import { db, giveawaysTable } from "@workspace/db";

const NOW = new Date("2026-05-13T12:00:00Z");

function drawDate(daysFromNow: number): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

const GIVEAWAYS = [
  {
    name: "Clonakilty 21 Year Old Single Malt",
    description:
      "West Cork's finest aged expression. 21 years matured at the Atlantic coast distillery, bottled at 46% for maximum character.",
    prizeValue: "€220",
    prizeValueNumeric: "220.00",
    maxEntries: 62,
    drawDate: drawDate(6),
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Clonakilty Single Pot Still",
    description:
      "A classic Irish style — pot still whiskey made from a mashbill of malted and unmalted barley, finished in Atlantic-washed casks.",
    prizeValue: "€60",
    prizeValueNumeric: "59.95",
    maxEntries: 17,
    drawDate: drawDate(10),
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Clonakilty Cognac Cask Finish",
    description:
      "Batch 4 of the Cask Finish Series. Clonakilty single malt finished in ex-Cognac casks, adding rich dried fruit and spice complexity.",
    prizeValue: "€59",
    prizeValueNumeric: "59.00",
    maxEntries: 17,
    drawDate: drawDate(12),
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Clonakilty Double Oak",
    description:
      "Matured in two distinct oak cask types for a layered flavour profile. Vanilla and toasted oak on the nose, honey and spice on the finish.",
    prizeValue: "€50",
    prizeValueNumeric: "49.50",
    maxEntries: 14,
    drawDate: drawDate(3),
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Clonakilty Port Cask",
    description:
      "Finished in ruby port casks from Portugal. Lush red berries, dark chocolate, and a silky sweetness from the Atlantic-influenced distillate.",
    prizeValue: "€50",
    prizeValueNumeric: "49.50",
    maxEntries: 14,
    drawDate: drawDate(9),
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Clonakilty Galley Head Single Malt",
    description:
      "Named after the iconic West Cork headland. Atlantic sea air meets Irish single malt — light, coastal, and refreshingly approachable.",
    prizeValue: "€42",
    prizeValueNumeric: "41.95",
    maxEntries: 12,
    drawDate: drawDate(15),
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
  console.log(`Seeded ${inserted.length} giveaways:`);
  inserted.forEach((g) => console.log(`  [${g.id}] ${g.name}`));
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
