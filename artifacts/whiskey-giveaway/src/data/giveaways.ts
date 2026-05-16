import twentyOneYoImg from '@/assets/images/clonakilty-21yo.png';
import singlePotStillImg from '@/assets/images/clonakilty-single-pot-still.png';
import cognacCaskImg from '@/assets/images/clonakilty-cognac-cask.png';
import doubleOakImg from '@/assets/images/clonakilty-double-oak.png';
import portCaskImg from '@/assets/images/clonakilty-port-cask.png';
import galleyHeadImg from '@/assets/images/clonakilty-galley-head.png';
import galleyHeadBlueImg from '@/assets/images/clonakilty-galley-head-blue.png';

export type { Giveaway } from '@workspace/api-client-react';

export interface Bottle {
  name: string;
  value: string;
  image: string;
  description: string;
}

export const COLLECTION_BOTTLES: Bottle[] = [
  {
    name: "21 Year Old Single Malt",
    value: "£220",
    image: twentyOneYoImg,
    description: "West Cork's finest aged expression, bottled at 46% for maximum character."
  },
  {
    name: "Single Pot Still",
    value: "£60",
    image: singlePotStillImg,
    description: "Classic Irish style made from malted and unmalted barley."
  },
  {
    name: "Cognac Cask Finish",
    value: "£59",
    image: cognacCaskImg,
    description: "Rich dried fruit and spice from ex-Cognac cask finishing."
  },
  {
    name: "Double Oak",
    value: "£50",
    image: doubleOakImg,
    description: "Layered vanilla and toasted oak, honey and spice on the finish."
  },
  {
    name: "Port Cask",
    value: "£50",
    image: portCaskImg,
    description: "Lush red berries and dark chocolate from ruby port cask finishing."
  },
  {
    name: "Galley Head Rhum Cask",
    value: "£42",
    image: galleyHeadImg,
    description: "Light, coastal, and refreshingly approachable Atlantic expression."
  },
  {
    name: "Galley Head Single Malt",
    value: "£42",
    image: galleyHeadBlueImg,
    description: "The iconic coastal single malt in its original blue-label expression — sea-fresh and smooth."
  },
];

export const BUNDLED_IMAGE_MAP: Record<number, string> = {
  1: twentyOneYoImg,
  2: singlePotStillImg,
  3: cognacCaskImg,
  4: doubleOakImg,
  5: portCaskImg,
  6: galleyHeadImg,
};

export function getGiveawayImage(id: number, imageUrl?: string | null): string | undefined {
  if (imageUrl) return imageUrl;
  return BUNDLED_IMAGE_MAP[id];
}

export function daysUntil(drawDate: string | Date): number {
  const now = new Date();
  const draw = new Date(drawDate);
  const diff = draw.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
