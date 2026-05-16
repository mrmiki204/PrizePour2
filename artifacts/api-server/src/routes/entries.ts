import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, entriesTable, giveawaysTable } from "@workspace/db";
import {
  CreateEntryBody,
  ListEntriesResponse,
  ListEntriesByGiveawayParams,
  ListEntriesResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/entries", async (req, res): Promise<void> => {
  const { email } = req.query as { email?: string };

  const entries = await db
    .select()
    .from(entriesTable)
    .where(email ? eq(entriesTable.email, email) : undefined)
    .orderBy(entriesTable.createdAt);

  req.log.info({ count: entries.length, emailFilter: email }, "Listed entries");
  res.json(ListEntriesResponse.parse(entries));
});

router.post("/entries", async (req, res): Promise<void> => {
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid entry input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { ticketQty, ticketNumbers, amountPaid, ...rest } = parsed.data;

  const [giveaway] = await db
    .select({
      maxEntries: giveawaysTable.maxEntries,
      isActive: giveawaysTable.isActive,
    })
    .from(giveawaysTable)
    .where(eq(giveawaysTable.id, rest.giveawayId))
    .limit(1);

  if (!giveaway || !giveaway.isActive) {
    res.status(409).json({ error: "This draw is not currently active." });
    return;
  }

  const [{ totalTickets }] = await db
    .select({ totalTickets: sql<number>`coalesce(cast(sum(ticket_qty) as int), 0)` })
    .from(entriesTable)
    .where(eq(entriesTable.giveawayId, rest.giveawayId));

  if (totalTickets + ticketQty > giveaway.maxEntries) {
    res.status(409).json({ error: "This draw has sold out. No more tickets are available." });
    return;
  }

  const tickets: string[] =
    ticketNumbers && ticketNumbers.length > 0
      ? ticketNumbers
      : Array.from({ length: ticketQty }, () => "#" + Math.floor(1000 + Math.random() * 9000).toString());

  const paid = amountPaid ?? "0.00";

  const [entry] = await db.insert(entriesTable).values({
    ...rest,
    ticketQty,
    ticketNumbers: tickets,
    amountPaid: paid,
  }).returning();

  req.log.info({ entryId: entry.id, giveawayId: entry.giveawayId, tickets }, "Entry created");
  res.status(201).json(ListEntriesResponseItem.parse(entry));
});

router.get("/entries/giveaway/:giveawayId", async (req, res): Promise<void> => {
  const params = ListEntriesByGiveawayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const entries = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.giveawayId, params.data.giveawayId))
    .orderBy(entriesTable.createdAt);

  req.log.info({ giveawayId: params.data.giveawayId, count: entries.length }, "Listed entries by giveaway");
  res.json(entries);
});

export default router;
