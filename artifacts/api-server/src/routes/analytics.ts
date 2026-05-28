import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq, sql } from "drizzle-orm";
import {
  db,
  analyticsEventsTable,
  insertAnalyticsEventSchema,
  ALLOWED_ANALYTICS_EVENT_TYPES,
  TRACKED_DRAW_SLUGS,
  betaSignupsTable,
} from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth.js";

const router: IRouter = Router();

// Simple in-memory IP rate limit: 60 events / minute per IP.
// Generous because page_views + click events legitimately stack up.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [ip, hits] of ipHits) {
    const fresh = hits.filter((t) => t > cutoff);
    if (fresh.length === 0) ipHits.delete(ip);
    else ipHits.set(ip, fresh);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

router.post("/analytics-events", async (req: Request, res: Response): Promise<void> => {
  const ip = req.ip || "unknown";

  if (rateLimited(ip)) {
    res.status(429).json({ error: "Too many events." });
    return;
  }

  const parsed = insertAnalyticsEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid event payload." });
    return;
  }

  try {
    await db.insert(analyticsEventsTable).values({
      eventType: parsed.data.eventType,
      eventName: parsed.data.eventName,
      drawSlug: parsed.data.drawSlug,
      pagePath: parsed.data.pagePath,
      metadata: parsed.data.metadata,
    });
    res.status(204).end();
  } catch (err) {
    // Analytics must never break the frontend — log and swallow.
    req.log.warn({ err }, "Failed to record analytics event");
    res.status(204).end();
  }
});

router.get("/analytics-events", requireAdmin, async (req, res): Promise<void> => {
  const rawLimit = req.query.limit;
  const limitStr = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;
  let limit = Number.parseInt(typeof limitStr === "string" ? limitStr : "", 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = 100;
  if (limit > 500) limit = 500;

  const rows = await db
    .select()
    .from(analyticsEventsTable)
    .orderBy(desc(analyticsEventsTable.createdAt))
    .limit(limit);

  res.json(
    rows.map((r) => ({
      id: r.id,
      eventType: r.eventType,
      eventName: r.eventName,
      drawSlug: r.drawSlug,
      pagePath: r.pagePath,
      metadata: r.metadata,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.get("/analytics-summary", requireAdmin, async (_req, res): Promise<void> => {
  // Aggregate counts by event type
  const byTypeRows = await db
    .select({
      eventType: analyticsEventsTable.eventType,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(analyticsEventsTable)
    .groupBy(analyticsEventsTable.eventType);

  const counts: Record<string, number> = {};
  for (const t of ALLOWED_ANALYTICS_EVENT_TYPES) counts[t] = 0;
  let totalEvents = 0;
  for (const row of byTypeRows) {
    const n = Number(row.count) || 0;
    counts[row.eventType] = n;
    totalEvents += n;
  }

  // Top draws — group by draw_slug for draw/explore/page-view events
  const drawRows = await db
    .select({
      slug: analyticsEventsTable.drawSlug,
      eventType: analyticsEventsTable.eventType,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(analyticsEventsTable)
    .where(sql`${analyticsEventsTable.drawSlug} is not null`)
    .groupBy(analyticsEventsTable.drawSlug, analyticsEventsTable.eventType);

  const drawMap = new Map<string, { drawClicks: number; exploreCollectionClicks: number; pageViews: number }>();
  for (const slug of TRACKED_DRAW_SLUGS) {
    drawMap.set(slug, { drawClicks: 0, exploreCollectionClicks: 0, pageViews: 0 });
  }
  for (const row of drawRows) {
    // Defence in depth: only surface known tracked slugs even though the
    // POST schema already rejects unknown ones. Older rows or future schema
    // changes can never poison the dashboard.
    if (!row.slug || !drawMap.has(row.slug)) continue;
    const bucket = drawMap.get(row.slug)!;
    const n = Number(row.count) || 0;
    if (row.eventType === "draw_click") bucket.drawClicks += n;
    else if (row.eventType === "explore_collection_click") bucket.exploreCollectionClicks += n;
    else if (row.eventType === "page_view") bucket.pageViews += n;
  }
  const topDraws = Array.from(drawMap.entries())
    .map(([slug, v]) => ({ slug, ...v }))
    .sort(
      (a, b) =>
        b.drawClicks + b.exploreCollectionClicks + b.pageViews -
        (a.drawClicks + a.exploreCollectionClicks + a.pageViews),
    );

  // Beta signups (read live count from beta_signups table — source of truth)
  const [{ count: betaSignupsCount } = { count: 0 }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(betaSignupsTable);

  const started = counts["waitlist_started"] ?? 0;
  const completed = counts["waitlist_completed"] ?? 0;
  const failed = counts["waitlist_failed"] ?? 0;
  const duplicate = counts["waitlist_duplicate"] ?? 0;
  const conversionRate = started > 0 ? completed / started : 0;

  res.json({
    totalEvents,
    totalPageViews: counts["page_view"] ?? 0,
    betaSignups: Number(betaSignupsCount) || 0,
    heroCtaClicks: counts["hero_cta_click"] ?? 0,
    drawClicks: counts["draw_click"] ?? 0,
    waitlistCompleted: completed,
    eventsByType: ALLOWED_ANALYTICS_EVENT_TYPES.map((k) => ({ key: k, count: counts[k] ?? 0 })),
    topDraws,
    waitlistFunnel: { started, completed, failed, duplicate, conversionRate },
  });
});

// Silence unused-import lint for eq, kept for parity with other route files.
void eq;

export default router;
