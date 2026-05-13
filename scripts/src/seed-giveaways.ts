import { db, giveawaysTable } from "@workspace/db";

const NOW = new Date();

function drawDate(daysFromNow: number): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

const GIVEAWAYS = [
  {
    name: "The Clonakilty Collection",
    description:
      "One winner takes home the complete Clonakilty Distillery collection — all six Atlantic coast expressions worth £481 combined, professionally packed and shipped insured to your door.",
    prizeValue: "£481",
    prizeValueNumeric: "481.00",
    maxEntries: 135,
    drawDate: drawDate(14),
    imageUrl: null,
    isActive: true,
  },
];

async function main() {
  const existing = await db.select().from(giveawaysTable);
  if (existing.length > 0) {
    console.log(`Giveaways table already has ${existing.length} row(s). Skipping seed.`);
    process.exit(0);
  }

  const inserted = await db.insert(giveawaysTable).values(GIVEAWAYS).returning();
  console.log(`Seeded ${inserted.length} giveaway(s):`);
  inserted.forEach((g) => console.log(`  [${g.id}] ${g.name}`));
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
