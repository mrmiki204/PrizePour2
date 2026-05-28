import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { logger } from "./logger.js";

/**
 * Idempotently creates the application tables if they don't exist, and adds
 * any columns added in later schema revisions to existing tables.
 *
 * The project relies on `drizzle-kit push` in development. Production
 * environments (e.g. Railway) usually start against an empty database
 * with no schema applied, OR against a database that was bootstrapped by
 * an earlier version of this function and is missing columns added later.
 *
 * Without this, `seedGiveaways()` and `/api/giveaways` would fail silently
 * (e.g. "column is_public does not exist") and the admin/homepage would
 * appear empty.
 *
 * The SQL mirrors `lib/db/src/schema/*` exactly — keep them in sync when
 * the schema changes. New columns should be added BOTH in the CREATE TABLE
 * and in an ALTER TABLE ... ADD COLUMN IF NOT EXISTS block.
 */
export async function ensureSchema(): Promise<void> {
  try {
    // ── giveaways ────────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS giveaways (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        prize_value TEXT NOT NULL,
        prize_value_numeric NUMERIC(10, 2) NOT NULL,
        max_entries INTEGER NOT NULL,
        draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
        image_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_public BOOLEAN NOT NULL DEFAULT TRUE,
        entries_paused BOOLEAN NOT NULL DEFAULT FALSE,
        ticket_price_gbp NUMERIC(6, 2) NOT NULL DEFAULT 4.99,
        hero_tagline TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Add columns that may be missing on databases bootstrapped by an
    // older version of ensureSchema (e.g. existing Railway deployments).
    await db.execute(sql`
      ALTER TABLE giveaways
        ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS entries_paused BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS ticket_price_gbp NUMERIC(6, 2) NOT NULL DEFAULT 4.99,
        ADD COLUMN IF NOT EXISTS hero_tagline TEXT;
    `);

    // ── entries ──────────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        giveaway_id INTEGER NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        ticket_qty INTEGER NOT NULL,
        ticket_numbers TEXT[] NOT NULL,
        amount_paid NUMERIC(10, 2) NOT NULL,
        referral_code TEXT,
        stripe_session_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      ALTER TABLE entries
        ADD COLUMN IF NOT EXISTS referral_code TEXT,
        ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
    `);

    // ── referral_rewards ─────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS referral_rewards (
        id SERIAL PRIMARY KEY,
        referral_code TEXT NOT NULL,
        referee_entry_id INTEGER NOT NULL,
        free_tickets INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'unclaimed',
        claimed_giveaway_id INTEGER,
        claimed_entry_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        claimed_at TIMESTAMP WITH TIME ZONE
      );
    `);

    logger.info("Database schema ensured (tables + columns up to date)");
  } catch (err) {
    logger.error({ err }, "Failed to ensure database schema");
    throw err;
  }
}
