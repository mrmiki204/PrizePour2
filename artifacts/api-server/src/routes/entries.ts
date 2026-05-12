import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, entriesTable } from "@workspace/db";
import {
  CreateEntryBody,
  ListEntriesResponse,
  ListEntriesByGiveawayParams,
  ListEntriesResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/entries", async (req, res): Promise<void> => {
  const entries = await db.select().from(entriesTable).orderBy(entriesTable.createdAt);
  req.log.info({ count: entries.length }, "Listed entries");
  res.json(ListEntriesResponse.parse(entries));
});

router.post("/entries", async (req, res): Promise<void> => {
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid entry input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db.insert(entriesTable).values(parsed.data).returning();
  req.log.info({ entryId: entry.id, giveawayId: entry.giveawayId }, "Entry created");
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
