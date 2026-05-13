import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const giveawaysTable = pgTable("giveaways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prizeValue: text("prize_value").notNull(),
  prizeValueNumeric: numeric("prize_value_numeric", { precision: 10, scale: 2 }).notNull(),
  maxEntries: integer("max_entries").notNull(),
  drawDate: timestamp("draw_date", { withTimezone: true }).notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGiveawaySchema = createInsertSchema(giveawaysTable).omit({ id: true, createdAt: true });
export type InsertGiveaway = z.infer<typeof insertGiveawaySchema>;
export type Giveaway = typeof giveawaysTable.$inferSelect;
