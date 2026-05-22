import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, giveawaysTable, entriesTable } from "@workspace/db";
import {
  ListGiveawaysQueryParams,
  ListGiveawaysResponse,
  CreateGiveawayBody,
  GetGiveawayParams,
  GetGiveawayResponse,
  UpdateGiveawayParams,
  UpdateGiveawayBody,
  UpdateGiveawayResponse,
  DeleteGiveawayParams,
  DeleteGiveawayResponse,
} from "@workspace/api-zod";
import { sendWinnerEmail } from "../emailService.js";
import { logger } from "../lib/logger.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router: IRouter = Router();

async function withEntryCount(rows: (typeof giveawaysTable.$inferSelect)[]) {
  if (rows.length === 0) return [];
  const counts = await db
    .select({
      giveawayId: entriesTable.giveawayId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(entriesTable)
    .groupBy(entriesTable.giveawayId);

  const countMap = Object.fromEntries(
    counts.map((c) => [c.giveawayId, c.count]),
  );
  return rows.map((g) => ({ ...g, entryCount: countMap[g.id] ?? 0 }));
}

router.get("/giveaways", async (req, res): Promise<void> => {
  const query = ListGiveawaysQueryParams.safeParse(req.query);
  const showAll = query.success && query.data.all === true;

  const rows = showAll
    ? await db.select().from(giveawaysTable).orderBy(giveawaysTable.createdAt)
    : await db
        .select()
        .from(giveawaysTable)
        .where(eq(giveawaysTable.isActive, true))
        .orderBy(giveawaysTable.createdAt);

  const giveaways = await withEntryCount(rows);
  req.log.info({ count: giveaways.length, showAll }, "Listed giveaways");
  res.json(ListGiveawaysResponse.parse(giveaways));
});

router.post("/giveaways", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateGiveawayBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid giveaway input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prizeValueNumeric, drawDate, isActive, ...rest } = parsed.data;
  const [giveaway] = await db
    .insert(giveawaysTable)
    .values({
      ...rest,
      prizeValueNumeric: String(prizeValueNumeric),
      drawDate: new Date(drawDate),
      isActive: isActive ?? true,
    })
    .returning();

  const [withCount] = await withEntryCount([giveaway]);
  req.log.info({ giveawayId: giveaway.id }, "Giveaway created");
  res.status(201).json(GetGiveawayResponse.parse(withCount));
});

router.get(
  "/giveaways/:id/winner",
  requireAdmin,
  async (req, res): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid giveaway id" });
      return;
    }

    const entries = await db
      .select()
      .from(entriesTable)
      .where(eq(entriesTable.giveawayId, id));

    if (entries.length === 0) {
      res.status(404).json({ error: "No entries found for this giveaway" });
      return;
    }

    const pool: {
      ticketNumber: string;
      firstName: string;
      lastName: string;
      email: string;
    }[] = [];
    for (const entry of entries) {
      for (const ticket of entry.ticketNumbers as string[]) {
        pool.push({
          ticketNumber: ticket,
          firstName: entry.firstName,
          lastName: entry.lastName,
          email: entry.email,
        });
      }
    }

    const winnerEntry = pool[Math.floor(Math.random() * pool.length)];
    req.log.info(
      { giveawayId: id, winner: winnerEntry.ticketNumber },
      "Winner selected",
    );

    const [giveaway] = await db
      .select()
      .from(giveawaysTable)
      .where(eq(giveawaysTable.id, id));

    setImmediate(async () => {
      try {
        await sendWinnerEmail({
          to: winnerEntry.email,
          toName: `${winnerEntry.firstName} ${winnerEntry.lastName}`,
          ticketNumber: winnerEntry.ticketNumber,
          giveawayName: giveaway?.name ?? "PrizePour Draw",
          prizeValue: giveaway?.prizeValue ?? "an exclusive prize",
        });
      } catch (err) {
        logger.error(
          { err, to: winnerEntry.email },
          "Failed to send winner email",
        );
      }
    });

    res.json({
      ticketNumber: winnerEntry.ticketNumber,
      firstName: winnerEntry.firstName,
      lastName: winnerEntry.lastName,
    });
  },
);

router.get("/giveaways/:id", async (req, res): Promise<void> => {
  const params = GetGiveawayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [giveaway] = await db
    .select()
    .from(giveawaysTable)
    .where(eq(giveawaysTable.id, params.data.id));

  if (!giveaway) {
    res.status(404).json({ error: "Giveaway not found" });
    return;
  }

  const [withCount] = await withEntryCount([giveaway]);
  req.log.info({ giveawayId: giveaway.id }, "Fetched giveaway");
  res.json(GetGiveawayResponse.parse(withCount));
});

router.patch(
  "/giveaways/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateGiveawayParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const body = UpdateGiveawayBody.safeParse(req.body);
    if (!body.success) {
      req.log.warn({ errors: body.error.message }, "Invalid giveaway update");
      res.status(400).json({ error: body.error.message });
      return;
    }

    const { prizeValueNumeric, drawDate, ...rest } = body.data;
    const updates: Record<string, unknown> = { ...rest };
    if (prizeValueNumeric !== undefined)
      updates.prizeValueNumeric = String(prizeValueNumeric);
    if (drawDate !== undefined) updates.drawDate = new Date(drawDate);

    const [updated] = await db
      .update(giveawaysTable)
      .set(updates)
      .where(eq(giveawaysTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Giveaway not found" });
      return;
    }

    const [withCount] = await withEntryCount([updated]);
    req.log.info({ giveawayId: updated.id }, "Giveaway updated");
    res.json(UpdateGiveawayResponse.parse(withCount));
  },
);

router.delete(
  "/giveaways/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = DeleteGiveawayParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [disabled] = await db
      .update(giveawaysTable)
      .set({ isActive: false })
      .where(eq(giveawaysTable.id, params.data.id))
      .returning();

    if (!disabled) {
      res.status(404).json({ error: "Giveaway not found" });
      return;
    }

    const [withCount] = await withEntryCount([disabled]);
    req.log.info({ giveawayId: disabled.id }, "Giveaway disabled");
    res.json(DeleteGiveawayResponse.parse(withCount));
  },
);

export default router;
