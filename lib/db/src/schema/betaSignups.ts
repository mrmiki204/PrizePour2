import { pgTable, text, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const betaSignupsTable = pgTable(
  "beta_signups",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name"),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUniqueIdx: uniqueIndex("beta_signups_email_unique").on(t.email),
  }),
);

export const insertBetaSignupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  email: z.string().trim().toLowerCase().email().max(254),
});

export type InsertBetaSignup = z.infer<typeof insertBetaSignupSchema>;
export type BetaSignup = typeof betaSignupsTable.$inferSelect;
