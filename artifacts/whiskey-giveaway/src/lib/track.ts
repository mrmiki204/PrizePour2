import { createAnalyticsEvent, type AnalyticsEventInput } from "@workspace/api-client-react";

/**
 * Slugs used in analytics for the four tracked seeded draws. These are
 * intentionally stable strings (not DB ids) so they stay consistent
 * across environments and redeploys.
 */
export const DRAW_SLUGS = {
  patron: "patron-collection",
  clonakilty: "clonakilty-collection",
  bushmills: "bushmills",
  macallan: "macallan-luxury-collection",
} as const;

export type DrawSlug = (typeof DRAW_SLUGS)[keyof typeof DRAW_SLUGS];

/** Best-effort mapping from a giveaway display name to our analytics slug. */
export function slugForGiveawayName(name: string): DrawSlug | null {
  const n = name.toLowerCase();
  if (n.includes("patrón") || n.includes("patron")) return DRAW_SLUGS.patron;
  if (n.includes("clonakilty")) return DRAW_SLUGS.clonakilty;
  if (n.includes("bushmills")) return DRAW_SLUGS.bushmills;
  if (n.includes("macallan")) return DRAW_SLUGS.macallan;
  return null;
}

/**
 * Fire-and-forget analytics event. Never throws, never blocks the caller,
 * never surfaces an error to the UI. If the network or server is down the
 * event is silently dropped.
 */
export function track(event: AnalyticsEventInput): void {
  try {
    const body: AnalyticsEventInput = {
      ...event,
      pagePath:
        event.pagePath ?? (typeof window !== "undefined" ? window.location.pathname : null),
    };
    void createAnalyticsEvent(body).catch(() => {
      /* analytics must never break the UI */
    });
  } catch {
    /* swallow */
  }
}
