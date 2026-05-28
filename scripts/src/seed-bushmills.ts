import { db, giveawaysTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const BUSHMILLS_NAME = "Bushmills Distillery Tour Experience";

const BUSHMILLS = {
  name: BUSHMILLS_NAME,
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
};

async function main() {
  const [existing] = await db
    .select()
    .from(giveawaysTable)
    .where(eq(giveawaysTable.name, BUSHMILLS_NAME));

  if (existing) {
    console.log(
      `Bushmills row already exists (id=${existing.id}). Skipping insert.`,
    );
    process.exit(0);
  }

  const [inserted] = await db
    .insert(giveawaysTable)
    .values(BUSHMILLS)
    .returning();

  console.log(`Seeded Bushmills draw: id=${inserted.id} name="${inserted.name}"`);
  console.log(
    `  isActive=${inserted.isActive} isPublic=${inserted.isPublic} ` +
      `maxEntries=${inserted.maxEntries} ticketPriceGbp=${inserted.ticketPriceGbp}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
