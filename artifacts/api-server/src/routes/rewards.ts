import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, referralRewardsTable, entriesTable } from "@workspace/db";

const router: IRouter = Router();

/**
 * GET /api/rewards/:referralCode
 * Returns all rewards earned by a referral code (unclaimed + claimed).
 */
router.get("/rewards/:referralCode", async (req, res): Promise<void> => {
  const { referralCode } = req.params;

  const rewards = await db
    .select()
    .from(referralRewardsTable)
    .where(eq(referralRewardsTable.referralCode, referralCode))
    .orderBy(referralRewardsTable.createdAt);

  req.log.info({ referralCode, count: rewards.length }, "Fetched referral rewards");
  res.json({ rewards });
});

/**
 * POST /api/rewards/:id/claim
 * Claims a reward by creating a free entry in the chosen giveaway.
 * Body: { referralCode, giveawayId, firstName, lastName, email }
 */
router.post("/rewards/:id/claim", async (req, res): Promise<void> => {
  const rewardId = parseInt(req.params.id, 10);
  const { referralCode, giveawayId, firstName, lastName, email } = req.body as {
    referralCode: string;
    giveawayId: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  if (!referralCode || !giveawayId || !firstName || !lastName || !email) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [reward] = await db
    .select()
    .from(referralRewardsTable)
    .where(
      and(
        eq(referralRewardsTable.id, rewardId),
        eq(referralRewardsTable.referralCode, referralCode),
        eq(referralRewardsTable.status, "unclaimed")
      )
    );

  if (!reward) {
    res.status(404).json({ error: "Reward not found or already claimed" });
    return;
  }

  const tickets = Array.from({ length: reward.freeTickets }).map(
    () => "#" + Math.floor(1000 + Math.random() * 9000).toString()
  );

  const [entry] = await db
    .insert(entriesTable)
    .values({
      giveawayId,
      firstName,
      lastName,
      email,
      ticketQty: reward.freeTickets,
      ticketNumbers: tickets,
      amountPaid: "0.00",
      referralCode: null,
      stripeSessionId: null,
    })
    .returning();

  const [updated] = await db
    .update(referralRewardsTable)
    .set({
      status: "claimed",
      claimedGiveawayId: giveawayId,
      claimedEntryId: entry.id,
      claimedAt: new Date(),
    })
    .where(eq(referralRewardsTable.id, rewardId))
    .returning();

  req.log.info({ rewardId, giveawayId, freeTickets: reward.freeTickets }, "Referral reward claimed");
  res.json({ reward: updated, entry, ticketNumbers: tickets });
});

export default router;
