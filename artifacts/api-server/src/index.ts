import app from "./app.js";
import { logger } from "./lib/logger.js";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient.js";
import { db, giveawaysTable } from "@workspace/db";

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

async function seedGiveaways() {
  try {
    const existing = await db.select().from(giveawaysTable);
    if (existing.length > 0) {
      logger.info(
        { count: existing.length },
        "Giveaways already seeded — skipping",
      );
      return;
    }

    const rows = await db
      .insert(giveawaysTable)
      .values([
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
      ])
      .returning();

    logger.info({ count: rows.length }, "Giveaways seeded on startup");
  } catch (err) {
    logger.warn({ err }, "Giveaway seed failed (non-fatal)");
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

await seedGiveaways();
await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
