import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

/**
 * Lightweight analytics events table.
 *
 * Captures pre-launch visitor behaviour — page views, hero CTA clicks,
 * draw card clicks, waitlist funnel steps. No personally identifiable
 * data, no payment data, ever. Allowed event types are enumerated below
 * and enforced server-side.
 */
export const analyticsEventsTable = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    eventType: text("event_type").notNull(),
    eventName: text("event_name").notNull(),
    drawSlug: text("draw_slug"),
    pagePath: text("page_path"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    typeIdx: index("analytics_events_event_type_idx").on(t.eventType),
    createdAtIdx: index("analytics_events_created_at_idx").on(t.createdAt),
  }),
);

export const ALLOWED_ANALYTICS_EVENT_TYPES = [
  "page_view",
  "hero_cta_click",
  "draw_click",
  "explore_collection_click",
  "waitlist_started",
  "waitlist_completed",
  "waitlist_failed",
  "waitlist_duplicate",
] as const;

export type AnalyticsEventType = (typeof ALLOWED_ANALYTICS_EVENT_TYPES)[number];

/**
 * Allowlist of draw slugs we currently track. The public endpoint will
 * silently drop any other slug rather than persist it, so the analytics
 * table can never be polluted with attacker-supplied values.
 */
export const TRACKED_DRAW_SLUGS = [
  "patron-collection",
  "clonakilty-collection",
  "bushmills",
  "macallan-luxury-collection",
] as const;

export type TrackedDrawSlug = (typeof TRACKED_DRAW_SLUGS)[number];

// Tight character classes — alphanumerics + a few safe punctuation chars.
// This makes it impossible to slip an email / free-form string through.
const SAFE_NAME_RE = /^[a-z0-9_]{1,64}$/;
const SAFE_PATH_RE = /^\/[A-Za-z0-9/_-]{0,128}$/;
const SAFE_META_RE = /^[A-Za-z0-9_=,.\-:]{0,200}$/;

export const insertAnalyticsEventSchema = z.object({
  eventType: z.enum(ALLOWED_ANALYTICS_EVENT_TYPES),
  eventName: z.string().trim().regex(SAFE_NAME_RE),
  drawSlug: z
    .union([z.enum(TRACKED_DRAW_SLUGS), z.null(), z.undefined()])
    .optional()
    .transform((v) => v ?? null),
  pagePath: z
    .string()
    .trim()
    .regex(SAFE_PATH_RE)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  metadata: z
    .string()
    .trim()
    .regex(SAFE_META_RE)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
}).strict();

export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;
