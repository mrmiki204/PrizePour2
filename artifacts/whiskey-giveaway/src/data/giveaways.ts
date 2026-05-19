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
    background: 'radial-gradient(ellipse at 50% 20%, #56280a 0%, #2e1405 40%, #120802 75%, #060301 100%)',
  },
  {
    name: "Single Pot Still",
    value: "£60",
    image: singlePotStillImg,
    description: "Classic Irish style made from malted and unmalted barley.",
    background: 'radial-gradient(ellipse at 50% 20%, #472008 0%, #241004 40%, #0f0602 75%, #060301 100%)',
  },
  {
    name: "Cognac Cask Finish",
    value: "£59",
    image: cognacCaskImg,
    description: "Rich dried fruit and spice from ex-Cognac cask finishing.",
    background: 'radial-gradient(ellipse at 50% 20%, #5c2e08 0%, #2e1704 40%, #120902 75%, #060401 100%)',
  },
  {
    name: "Double Oak",
    value: "£50",
    image: doubleOakImg,
    description: "Layered vanilla and toasted oak, honey and spice on the finish.",
    background: 'radial-gradient(ellipse at 50% 20%, #50250a 0%, #281305 40%, #110802 75%, #060301 100%)',
  },
  {
    name: "Port Cask",
    value: "£50",
    image: portCaskImg,
    description: "Lush red berries and dark chocolate from ruby port cask finishing.",
    background: 'radial-gradient(ellipse at 50% 20%, #4a2008 0%, #251004 40%, #0f0702 75%, #060301 100%)',
  },
  {
    name: "Galley Head Rhum Cask",
    value: "£42",
    image: galleyHeadImg,
    description: "Light, coastal, and refreshingly approachable Atlantic expression.",
    background: 'radial-gradient(ellipse at 50% 20%, #422008 0%, #221104 40%, #0e0702 75%, #060301 100%)',
  },
  {
    name: "Galley Head Single Malt",
    value: "£42",
    image: galleyHeadBlueImg,
    description: "The iconic coastal single malt in its original blue-label expression — sea-fresh and smooth.",
    background: 'radial-gradient(ellipse at 50% 20%, #3d1e08 0%, #1f0f04 40%, #0d0702 75%, #060301 100%)',
  },
];

export const PATRON_BOTTLES: Bottle[] = [
  {
    name: "Patrón Silver",
    value: "£47.95",
    image: patronSilverImg,
    description: "Unaged blanco tequila, crisp and clean with fresh agave, citrus, and a light pepper finish.",
    background: 'radial-gradient(ellipse at 50% 20%, #4a2208 0%, #251104 40%, #0f0702 75%, #060301 100%)',
  },
  {
    name: "Patrón Reposado",
    value: "£56.95",
    image: patronReposadoImg,
    description: "Aged 2 months in oak barrels. Light vanilla and caramel balanced with fresh agave sweetness.",
    background: 'radial-gradient(ellipse at 50% 20%, #542a08 0%, #2a1504 40%, #110802 75%, #060301 100%)',
  },
  {
    name: "Patrón Añejo",
    value: "£64.95",
    image: patronAnejoImg,
    description: "Aged over 12 months in small oak barrels. Smooth honey, vanilla, and a rich earthy finish.",
    background: 'radial-gradient(ellipse at 50% 20%, #5a2c08 0%, #2d1604 40%, #120802 75%, #060301 100%)',
  },
  {
    name: "Patrón Extra Añejo",
    value: "£83.49",
    image: patronExtraAnejoImg,
    description: "Aged over 3 years. Complex dried fruit, toasted oak, and long smoky finish.",
    background: 'radial-gradient(ellipse at 50% 20%, #502608 0%, #281304 40%, #100802 75%, #060301 100%)',
  },
  {
    name: "Gran Patrón Platinum",
    value: "£257.95",
    image: patronGranPlatinumImg,
    description: "Triple-distilled ultra-premium silver tequila. Silky smooth with sweet agave and white pepper.",
    background: 'radial-gradient(ellipse at 50% 20%, #482208 0%, #241104 40%, #0f0702 75%, #060301 100%)',
  },
  {
    name: "Gran Patrón Piedra",
    value: "£270.00",
    image: patronGranPiedraImg,
    description: "Extra añejo aged in new American oak. Intense butterscotch, toasted nuts, and rich spice.",
    background: 'radial-gradient(ellipse at 50% 20%, #562a08 0%, #2c1504 40%, #110802 75%, #060301 100%)',
  },
  {
    name: "Gran Patrón Burdeos",
    value: "£499.99",
    image: patronGranBurdeosImg,
    description: "Aged in American oak then finished in Bordeaux wine barrels. Exceptionally rare and complex.",
    background: 'radial-gradient(ellipse at 50% 20%, #5e2e08 0%, #301704 40%, #130902 75%, #060301 100%)',
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
