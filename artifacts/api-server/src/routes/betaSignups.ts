import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, betaSignupsTable, insertBetaSignupSchema } from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth.js";

const router: IRouter = Router();

// Simple in-memory IP rate limit: 5 signups / minute per IP.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

// Periodic cleanup so the map doesn't grow unbounded.
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [ip, hits] of ipHits) {
    const fresh = hits.filter((t) => t > cutoff);
    if (fresh.length === 0) ipHits.delete(ip);
    else ipHits.set(ip, fresh);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

router.post("/beta-signups", async (req: Request, res: Response): Promise<void> => {
  // `req.ip` is derived from the trusted proxy hop count configured in app.ts
  // (`app.set("trust proxy", 1)`), so it's safe against `X-Forwarded-For` spoofing.
  const ip = req.ip || "unknown";

  if (rateLimited(ip)) {
    req.log.warn({ ip }, "Beta signup rate-limited");
    res.status(429).json({ error: "Too many signups from this network. Please try again in a moment." });
    return;
  }

  const parsed = insertBetaSignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  const { firstName, email } = parsed.data;

  try {
    const [existing] = await db
      .select({ id: betaSignupsTable.id })
      .from(betaSignupsTable)
      .where(eq(betaSignupsTable.email, email))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "You're already signed up." });
      return;
    }

    const [row] = await db
      .insert(betaSignupsTable)
      .values({ firstName: firstName ?? null, email })
      .returning();

    if (!row) {
      req.log.error({ email }, "Beta signup insert returned no row");
      res.status(500).json({ error: "Could not save your signup. Please try again." });
      return;
    }

    req.log.info({ id: row.id, email }, "Beta signup created");
    res.status(201).json({
      ok: true,
      message: "You're on the list. PrizePour beta updates are coming soon.",
      signup: {
        id: row.id,
        firstName: row.firstName,
        email: row.email,
        createdAt: row.createdAt.toISOString(),
      },
    });
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    if (code === "23505") {
      // Race condition on unique index — treat as duplicate.
      res.status(409).json({ error: "You're already signed up." });
      return;
    }
    req.log.error({ err }, "Beta signup failed");
    res.status(500).json({ error: "Could not save your signup. Please try again." });
  }
});

router.get("/beta-signups", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(betaSignupsTable)
    .orderBy(betaSignupsTable.createdAt);

  res.json(
    rows
      .slice()
      .reverse()
      .map((r) => ({
        id: r.id,
        firstName: r.firstName,
        email: r.email,
        createdAt: r.createdAt.toISOString(),
      })),
  );
});

router.delete("/beta-signups/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = req.params.id;
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
  const id = Number.parseInt(idStr ?? "", 10);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(betaSignupsTable)
    .where(eq(betaSignupsTable.id, id))
    .returning({ id: betaSignupsTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Signup not found" });
    return;
  }

  req.log.info({ id }, "Beta signup deleted");
  res.json({ ok: true });
});

export default router;
