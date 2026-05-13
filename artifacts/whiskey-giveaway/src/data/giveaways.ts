import twentyOneYoImg from '@/assets/images/clonakilty-21yo.jpg';
import singlePotStillImg from '@/assets/images/clonakilty-single-pot-still.jpg';
import cognacCaskImg from '@/assets/images/clonakilty-cognac-cask.jpg';
import doubleOakImg from '@/assets/images/clonakilty-double-oak.jpg';
import portCaskImg from '@/assets/images/clonakilty-port-cask.jpg';
import galleyHeadImg from '@/assets/images/clonakilty-galley-head.jpg';

export interface Giveaway {
  id: number;
  name: string;
  value: string;
  priceNumeric: number;
  maxEntries: number;
  baseEntries: number;
  entries: string;
  daysLeft: number;
  description: string;
  image?: string;
}

// maxEntries = ceil(prizeValueNumeric * 1.4 / 4.99)
// baseEntries set so draws closer to close date are closer to capacity
export const ACTIVE_GIVEAWAYS: Giveaway[] = [
  {
    id: 1,
    name: "Clonakilty 21 Year Old Single Malt",
    value: "£220",
    priceNumeric: 220,
    maxEntries: 62,     // ceil(220 * 1.4 / 4.99)
    baseEntries: 51,    // 82% sold — 6 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 6,
    description: "West Cork's finest aged expression. 21 years matured at the Atlantic coast distillery, bottled at 46% for maximum character.",
    image: twentyOneYoImg
  },
  {
    id: 2,
    name: "Clonakilty Single Pot Still",
    value: "£60",
    priceNumeric: 59.95,
    maxEntries: 17,     // ceil(59.95 * 1.4 / 4.99)
    baseEntries: 14,    // 80% sold — 10 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 10,
    description: "A classic Irish style — pot still whiskey made from a mashbill of malted and unmalted barley, finished in Atlantic-washed casks.",
    image: singlePotStillImg
  },
  {
    id: 3,
    name: "Clonakilty Cognac Cask Finish",
    value: "£59",
    priceNumeric: 59,
    maxEntries: 17,     // ceil(59 * 1.4 / 4.99)
    baseEntries: 13,    // 75% sold — 12 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 12,
    description: "Batch 4 of the Cask Finish Series. Clonakilty single malt finished in ex-Cognac casks, adding rich dried fruit and spice complexity.",
    image: cognacCaskImg
  },
  {
    id: 4,
    name: "Clonakilty Double Oak",
    value: "£50",
    priceNumeric: 49.50,
    maxEntries: 14,     // ceil(49.50 * 1.4 / 4.99)
    baseEntries: 13,    // 93% sold — only 3 days left!
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 3,
    description: "Matured in two distinct oak cask types for a layered flavour profile. Vanilla and toasted oak on the nose, honey and spice on the finish.",
    image: doubleOakImg
  },
  {
    id: 5,
    name: "Clonakilty Port Cask",
    value: "£50",
    priceNumeric: 49.50,
    maxEntries: 14,     // ceil(49.50 * 1.4 / 4.99)
    baseEntries: 11,    // 80% sold — 9 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 9,
    description: "Finished in ruby port casks from Portugal. Lush red berries, dark chocolate, and a silky sweetness from the Atlantic-influenced distillate.",
    image: portCaskImg
  },
  {
    id: 6,
    name: "Clonakilty Galley Head Single Malt",
    value: "£42",
    priceNumeric: 41.95,
    maxEntries: 12,     // ceil(41.95 * 1.4 / 4.99)
    baseEntries: 8,     // 70% sold — 15 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 15,
    description: "Named after the iconic West Cork headland. Atlantic sea air meets Irish single malt — light, coastal, and refreshingly approachable.",
    image: galleyHeadImg
  }
];
