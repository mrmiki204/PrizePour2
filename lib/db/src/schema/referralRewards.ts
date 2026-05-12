import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const referralRewardsTable = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  referralCode: text("referral_code").notNull(),
  refereeEntryId: integer("referee_entry_id").notNull(),
  freeTickets: integer("free_tickets").notNull(),
  status: text("status").notNull().default("unclaimed"),
  claimedGiveawayId: integer("claimed_giveaway_id"),
  claimedEntryId: integer("claimed_entry_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
});

export type ReferralReward = typeof referralRewardsTable.$inferSelect;
