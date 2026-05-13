import twentyOneYoImg from '@/assets/images/clonakilty-21yo.jpg';
import singlePotStillImg from '@/assets/images/clonakilty-single-pot-still.jpg';
import cognacCaskImg from '@/assets/images/clonakilty-cognac-cask.jpg';
import doubleOakImg from '@/assets/images/clonakilty-double-oak.jpg';
import portCaskImg from '@/assets/images/clonakilty-port-cask.jpg';
import galleyHeadImg from '@/assets/images/clonakilty-galley-head.jpg';

export type { Giveaway } from '@workspace/api-client-react';

export interface Bottle {
  name: string;
  value: string;
  image: string;
  description: string;
}

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
