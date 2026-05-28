import app from "./app.js";
import { logger } from "./lib/logger.js";
import { ensureSchema } from "./lib/ensureSchema.js";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient.js";
import { db, giveawaysTable } from "@workspace/db";

type SeedRow = typeof giveawaysTable.$inferInsert;

// Default draws seeded on first boot of a fresh database (e.g. Railway prod).
// Keyed by exact `name` so seeding is idempotent across restarts — we look up
// each row by name and only insert the ones that are missing. Existing rows
// are NEVER touched (admin edits in production are preserved).
const DEFAULT_GIVEAWAYS: SeedRow[] = [
  {
    name: "The Clonakilty Collection",
    description:
      "One winner takes home a selected range of Clonakilty Distillery expressions — professionally packed and shipped insured to your door.",
    prizeValue: "Worth Over £500",
    prizeValueNumeric: "481.00",
    maxEntries: 147,
    drawDate: new Date("2026-05-27T15:07:27.766Z"),
    imageUrl: null,
    isActive: true,
  },
  {
    name: "The Patrón Collection",
    description:
      "Fifteen iconic expressions from the world-renowned Patrón distillery — from crisp Silver to the ultra-rare Gran Patrón Burdeos, plus the Roca collection, Estate Release, Ahumado, El Cielo, El Alto, Cristalino, Citrónge and XO Café. Professionally packed and shipped insured to your door.",
    prizeValue: "Worth Over £1,950",
    prizeValueNumeric: "1984.15",
    maxEntries: 557,
    drawDate: new Date("2026-06-13T18:00:00.000Z"),
    imageUrl: null,
    isActive: true,
  },
  {
    name: "The Macallan Luxury Scotch Collection",
    description:
      "An extraordinary collection of premium Macallan Scotch whiskies — featuring rare cask expressions, aged single malts and collector favourites: Macallan 12 Year Double Cask, 12 Year Sherry Oak, 15 Year Double Cask, 18 Year Sherry Oak, Rare Cask and the Harmony Collection. Professionally handled, packed and insured.",
    prizeValue: "Worth Over £2,500",
    prizeValueNumeric: "2500.00",
    // ceil(2500 * 1.4 / 9.99) = ceil(350.35) = 351
    maxEntries: 351,
    drawDate: new Date("2026-10-15T18:00:00.000Z"),
    imageUrl: null,
    ticketPriceGbp: "9.99",
    heroTagline: "Luxury Scotch Whisky",
    // Per spec: hidden + paused by default until admin enables in /admin/draws.
    isActive: false,
    isPublic: false,
    entriesPaused: true,
  },
  {
    name: "Bushmills Distillery Tour Experience",
    description:
      "Win a premium Bushmills experience including a guided distillery tour, whiskey tasting experience, exclusive extras and luxury spirit-inspired rewards.",
    prizeValue: "Worth Over £2,500",
    prizeValueNumeric: "2500.00",
    maxEntries: 250,
    drawDate: new Date("2026-08-01T18:00:00.000Z"),
    imageUrl: null,
    ticketPriceGbp: "10.00",
    heroTagline: "Luxury Experience",
    isActive: true,
    isPublic: false,
    entriesPaused: false,
  },
];

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Idempotent seed: inserts any DEFAULT_GIVEAWAYS rows whose `name` does not
 * already exist in the giveaways table. Existing rows are left untouched, so
 * admin edits in production (toggles, custom imageUrl, etc.) are preserved
 * across restarts and redeploys.
 */
async function seedGiveaways() {
  try {
    const existing = await db.select().from(giveawaysTable);
    const existingNames = new Set(existing.map((g) => g.name));
    const missing = DEFAULT_GIVEAWAYS.filter(
      (g) => !existingNames.has(g.name),
    );

    if (missing.length === 0) {
      const activeCount = existing.filter((g) => g.isActive).length;
      logger.info(
        { total: existing.length, activeCount },
        "Default giveaways already seeded — nothing to insert",
      );
      if (activeCount === 0) {
        logger.warn(
          "No active giveaways — homepage Active Draws section will be empty",
        );
      }
      return;
    }

    const inserted = await db
      .insert(giveawaysTable)
      .values(missing)
      .returning();

    logger.info(
      {
        insertedCount: inserted.length,
        insertedNames: inserted.map((g) => g.name),
        alreadyPresent: existing.length,
        totalAfterSeed: existing.length + inserted.length,
      },
      "Default giveaways seeded on startup",
    );
  } catch (err) {
    logger.error({ err }, "Giveaway seed failed (non-fatal — server will still start)");
  }
}

/**
 * Log a summary of the giveaways table after seeding so operators can confirm
 * via Railway logs whether the live DB has the expected default draws.
 */
async function logGiveawaySummary() {
  try {
    const all = await db.select().from(giveawaysTable);
    logger.info(
      {
        total: all.length,
        active: all.filter((g) => g.isActive).length,
        public: all.filter((g) => g.isPublic).length,
        paused: all.filter((g) => g.entriesPaused).length,
        names: all.map((g) => g.name),
      },
      "Giveaway table summary",
    );
  } catch (err) {
    logger.warn({ err }, "Could not read giveaways table for summary");
  }
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  try {
    await runMigrations({ databaseUrl });
    logger.info("Stripe schema ready");

    const stripeSync = await getStripeSync();
    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (domain) {
      await stripeSync.findOrCreateManagedWebhook(
        `https://${domain}/api/stripe/webhook`,
      );
      logger.info("Stripe webhook configured");
    }

    // Sync in background — don't block server startup
    stripeSync
      .syncBackfill()
      .then(() => logger.info("Stripe data synced"))
      .catch((err) =>
        logger.warn({ err }, "Stripe backfill error (non-fatal)"),
      );
  } catch (err) {
    logger.warn({ err }, "Stripe init skipped — integration not connected");
  }
}

logger.info(
  { hasDatabaseUrl: !!process.env.DATABASE_URL },
  "Boot: connecting to database",
);
await ensureSchema();
await seedGiveaways();
await logGiveawaySummary();
await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
