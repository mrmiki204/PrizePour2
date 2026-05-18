import twentyOneYoImg from '@/assets/images/clonakilty-21yo.png';
import singlePotStillImg from '@/assets/images/clonakilty-single-pot-still.png';
import cognacCaskImg from '@/assets/images/clonakilty-cognac-cask.png';
import doubleOakImg from '@/assets/images/clonakilty-double-oak.png';
import portCaskImg from '@/assets/images/clonakilty-port-cask.png';
import galleyHeadImg from '@/assets/images/clonakilty-galley-head.png';
import galleyHeadBlueImg from '@/assets/images/clonakilty-galley-head-blue.png';

import patronSilverImg from '@/assets/images/patron-silver.png';
import patronReposadoImg from '@/assets/images/patron-reposado.png';
import patronAnejoImg from '@/assets/images/patron-anejo.png';
import patronExtraAnejoImg from '@/assets/images/patron-extra-anejo.png';
import patronGranPlatinumImg from '@/assets/images/patron-gran-platinum.png';
import patronGranPiedraImg from '@/assets/images/patron-gran-piedra.png';
import patronGranBurdeosImg from '@/assets/images/patron-gran-burdeos.png';

export type { Giveaway } from '@workspace/api-client-react';

export interface Bottle {
  name: string;
  value: string;
  image: string;
  description: string;
  background: string;
}

export const COLLECTION_BOTTLES: Bottle[] = [
  {
    name: "21 Year Old Single Malt",
    value: "£220",
    image: twentyOneYoImg,
    description: "West Cork's finest aged expression, bottled at 46% for maximum character.",
    background: 'radial-gradient(ellipse at 50% 25%, #3d1a05 0%, #1c0c03 50%, #080401 100%)',
  },
  {
    name: "Single Pot Still",
    value: "£60",
    image: singlePotStillImg,
    description: "Classic Irish style made from malted and unmalted barley.",
    background: 'radial-gradient(ellipse at 50% 25%, #2d1204 0%, #160902 50%, #070401 100%)',
  },
  {
    name: "Cognac Cask Finish",
    value: "£59",
    image: cognacCaskImg,
    description: "Rich dried fruit and spice from ex-Cognac cask finishing.",
    background: 'radial-gradient(ellipse at 50% 25%, #3a1f08 0%, #1c0f04 50%, #090501 100%)',
  },
  {
    name: "Double Oak",
    value: "£50",
    image: doubleOakImg,
    description: "Layered vanilla and toasted oak, honey and spice on the finish.",
    background: 'radial-gradient(ellipse at 50% 25%, #3d2005 0%, #1e1003 50%, #0c0601 100%)',
  },
  {
    name: "Port Cask",
    value: "£50",
    image: portCaskImg,
    description: "Lush red berries and dark chocolate from ruby port cask finishing.",
    background: 'radial-gradient(ellipse at 50% 25%, #2d0a14 0%, #18050e 50%, #0a0308 100%)',
  },
  {
    name: "Galley Head Rhum Cask",
    value: "£42",
    image: galleyHeadImg,
    description: "Light, coastal, and refreshingly approachable Atlantic expression.",
    background: 'radial-gradient(ellipse at 50% 25%, #1a2d1a 0%, #0d160d 50%, #050a05 100%)',
  },
  {
    name: "Galley Head Single Malt",
    value: "£42",
    image: galleyHeadBlueImg,
    description: "The iconic coastal single malt in its original blue-label expression — sea-fresh and smooth.",
    background: 'radial-gradient(ellipse at 50% 25%, #0d1f35 0%, #071020 50%, #030a14 100%)',
  },
];

export const PATRON_BOTTLES: Bottle[] = [
  {
    name: "Patrón Silver",
    value: "£35",
    image: patronSilverImg,
    description: "Unaged blanco tequila, crisp and clean with fresh agave, citrus, and a light pepper finish.",
    background: 'radial-gradient(ellipse at 50% 25%, #0d1f35 0%, #071020 50%, #030a14 100%)',
  },
  {
    name: "Patrón Reposado",
    value: "£45",
    image: patronReposadoImg,
    description: "Aged 2 months in oak barrels. Light vanilla and caramel balanced with fresh agave sweetness.",
    background: 'radial-gradient(ellipse at 50% 25%, #3d2805 0%, #1e1403 50%, #0c0901 100%)',
  },
  {
    name: "Patrón Añejo",
    value: "£50",
    image: patronAnejoImg,
    description: "Aged over 12 months in small oak barrels. Smooth honey, vanilla, and a rich earthy finish.",
    background: 'radial-gradient(ellipse at 50% 25%, #3d1a05 0%, #1e0d03 50%, #0c0501 100%)',
  },
  {
    name: "Patrón Extra Añejo",
    value: "£75",
    image: patronExtraAnejoImg,
    description: "Aged over 3 years. Complex dried fruit, toasted oak, and long smoky finish.",
    background: 'radial-gradient(ellipse at 50% 25%, #2d0f0a 0%, #180708 50%, #0a0305 100%)',
  },
  {
    name: "Gran Patrón Platinum",
    value: "£150",
    image: patronGranPlatinumImg,
    description: "Triple-distilled ultra-premium silver tequila. Silky smooth with sweet agave and white pepper.",
    background: 'radial-gradient(ellipse at 50% 25%, #1a2030 0%, #0d1018 50%, #05080e 100%)',
  },
  {
    name: "Gran Patrón Piedra",
    value: "£200",
    image: patronGranPiedraImg,
    description: "Extra añejo aged in new American oak. Intense butterscotch, toasted nuts, and rich spice.",
    background: 'radial-gradient(ellipse at 50% 25%, #2a1505 0%, #150b03 50%, #090501 100%)',
  },
  {
    name: "Gran Patrón Burdeos",
    value: "£350",
    image: patronGranBurdeosImg,
    description: "Aged in American oak then finished in Bordeaux wine barrels. Exceptionally rare and complex.",
    background: 'radial-gradient(ellipse at 50% 25%, #2d0a14 0%, #18050e 50%, #0a0308 100%)',
  },
];

export const GIVEAWAY_BOTTLES: Record<number, Bottle[]> = {
  1: COLLECTION_BOTTLES,
  2: PATRON_BOTTLES,
};

export const BUNDLED_IMAGE_MAP: Record<number, string> = {
  1: twentyOneYoImg,
  2: patronGranBurdeosImg,
};

export function getGiveawayBottles(giveawayId: number): Bottle[] {
  return GIVEAWAY_BOTTLES[giveawayId] ?? [];
}

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
