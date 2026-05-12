import pappyImg from '@/assets/images/pappy.png';
import clonakiltyImg from '@/assets/images/clonakilty32.jpg';

// maxEntries = ceil(prizeValueNumeric * 1.4 / 4.99)
// baseEntries set so draws closer to close date are closer to capacity
export const ACTIVE_GIVEAWAYS = [
  {
    id: 1,
    name: "Clonakilty 32 Year Old",
    value: "€3,800",
    priceNumeric: 3800,
    maxEntries: 1067,   // ceil(3800 * 1.4 / 4.99)
    baseEntries: 875,   // 82% sold — 6 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 6,
    description: "Ultra-rare 32-year Irish single malt. One of only 84 bottles ever released from the West Cork distillery.",
    image: clonakiltyImg
  },
  {
    id: 2,
    name: "Pappy Van Winkle 23 Year",
    value: "$4,200",
    priceNumeric: 4200,
    maxEntries: 1179,   // ceil(4200 * 1.4 / 4.99)
    baseEntries: 944,   // 80% sold — 10 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 10,
    description: "The crown jewel of American bourbon. Impossibly rare.",
    image: pappyImg
  },
  {
    id: 3,
    name: "Glenfarclas 40 Year",
    value: "$2,800",
    priceNumeric: 2800,
    maxEntries: 786,    // ceil(2800 * 1.4 / 4.99)
    baseEntries: 590,   // 75% sold — 12 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 12,
    description: "Speyside legend. Single malt perfection aged four decades.",
    image: pappyImg
  },
  {
    id: 4,
    name: "Buffalo Trace Antique",
    value: "$3,500",
    priceNumeric: 3500,
    maxEntries: 982,    // ceil(3500 * 1.4 / 4.99)
    baseEntries: 913,   // 93% sold — only 3 days left!
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 3,
    description: "The full BTAC set. The most coveted bourbon collection.",
    image: pappyImg
  },
  {
    id: 5,
    name: "Hibiki 21 Japanese",
    value: "$1,200",
    priceNumeric: 1200,
    maxEntries: 337,    // ceil(1200 * 1.4 / 4.99)
    baseEntries: 270,   // 80% sold — 9 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 9,
    description: "Master blender's masterpiece. Japan's finest blended whisky.",
    image: pappyImg
  },
  {
    id: 6,
    name: "Macallan 18 Sherry Oak",
    value: "$950",
    priceNumeric: 950,
    maxEntries: 267,    // ceil(950 * 1.4 / 4.99)
    baseEntries: 187,   // 70% sold — 15 days left
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 15,
    description: "Iconic Speyside single malt aged in hand-picked sherry casks.",
    image: pappyImg
  }
];
