import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { logger } from "./logger.js";

/**
 * Idempotently creates the application tables if they don't exist.
 *
 * The project relies on `drizzle-kit push` in development. Production
 * environments (e.g. Railway) usually start against an empty database
 * with no schema applied, which would cause `seedGiveaways()` and
 * `/api/giveaways` to fail silently and leave the homepage's
 * "Active Draws" section empty.
 *
 * This function runs once at startup so a fresh production DB
 * self-bootstraps. The SQL mirrors `lib/db/src/schema/*` exactly —
 * keep them in sync when the schema changes.
 */
export async function ensureSchema(): Promise<void> {
  try {
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
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

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

    logger.info("Schema ensured (tables exist)");
  } catch (err) {
    logger.error({ err }, "Failed to ensure database schema");
    throw err;
  }
}
