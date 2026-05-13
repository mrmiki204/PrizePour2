import twentyOneYoImg from '@/assets/images/clonakilty-21yo.jpg';
import singlePotStillImg from '@/assets/images/clonakilty-single-pot-still.jpg';
import cognacCaskImg from '@/assets/images/clonakilty-cognac-cask.jpg';
import doubleOakImg from '@/assets/images/clonakilty-double-oak.jpg';
import portCaskImg from '@/assets/images/clonakilty-port-cask.jpg';
import galleyHeadImg from '@/assets/images/clonakilty-galley-head.jpg';

export interface Bottle {
  name: string;
  value: string;
  image: string;
  description: string;
}

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
  bottles?: Bottle[];
}

// Combined prize value: £220 + £60 + £59 + £50 + £50 + £42 = £481
// maxEntries = ceil(481 * 1.4 / 4.99) = 135
export const ACTIVE_GIVEAWAYS: Giveaway[] = [
  {
    id: 1,
    name: "The Clonakilty Collection",
    value: "£481",
    priceNumeric: 481,
    maxEntries: 135,
    baseEntries: 87,
    get entries() { return this.baseEntries.toLocaleString(); },
    daysLeft: 14,
    description: "One winner takes home the complete Clonakilty Distillery collection — all six Atlantic coast expressions worth £481, professionally packed and shipped insured to your door.",
    image: twentyOneYoImg,
    bottles: [
      {
        name: "21 Year Old Single Malt",
        value: "£220",
        image: twentyOneYoImg,
        description: "West Cork's finest aged expression. 21 years matured at the Atlantic coast distillery, bottled at 46% for maximum character."
      },
      {
        name: "Single Pot Still",
        value: "£60",
        image: singlePotStillImg,
        description: "A classic Irish style made from malted and unmalted barley, finished in Atlantic-washed casks."
      },
      {
        name: "Cognac Cask Finish",
        value: "£59",
        image: cognacCaskImg,
        description: "Batch 4 of the Cask Finish Series. Rich dried fruit and spice complexity from ex-Cognac casks."
      },
      {
        name: "Double Oak",
        value: "£50",
        image: doubleOakImg,
        description: "Matured in two distinct oak cask types. Vanilla and toasted oak on the nose, honey and spice on the finish."
      },
      {
        name: "Port Cask",
        value: "£50",
        image: portCaskImg,
        description: "Finished in ruby port casks from Portugal. Lush red berries, dark chocolate, and silky sweetness."
      },
      {
        name: "Galley Head Single Malt",
        value: "£42",
        image: galleyHeadImg,
        description: "Named after the iconic West Cork headland. Light, coastal, and refreshingly approachable."
      },
    ]
  }
];
