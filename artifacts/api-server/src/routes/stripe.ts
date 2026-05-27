import { Router, type IRouter } from "express";
import { getUncachableStripeClient } from "../stripeClient.js";
import { storage } from "../storage.js";
import { db } from "@workspace/db";
import { entriesTable, referralRewardsTable } from "@workspace/db";

const router: IRouter = Router();

// ── Beta kill switch ──────────────────────────────────────────────────────
// Real payments are disabled unless PAYMENTS_ENABLED=true is set in the
// environment. Safe-by-default: any misconfiguration on Railway/prod keeps
// checkout closed rather than charging real cards.
const PAYMENTS_ENABLED = process.env.PAYMENTS_ENABLED === "true";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for a ticket purchase.
 * Returns { url } to redirect the user to.
 */
router.post("/stripe/checkout", async (req, res) => {
  if (!PAYMENTS_ENABLED) {
    req.log.warn("Checkout attempt blocked — payments disabled (beta)");
    return res.status(503).json({
      error: "Checkout is disabled while PrizePour is in beta. Real entries open at launch.",
      betaMode: true,
    });
  }

  const { giveawayId, ticketQty, firstName, lastName, email, amountCents, referralCode } = req.body as {
    giveawayId: number;
    ticketQty: number;
    firstName: string;
    lastName: string;
    email: string;
    amountCents: number;
    referralCode?: string;
  };

  if (!giveawayId || !ticketQty || !firstName || !lastName || !email || !amountCents) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const stripe = await getUncachableStripeClient();

  // Try to find an existing Stripe price by metadata.ticketQty
  // Falls back to inline price_data if seed script hasn't been run yet
  let priceConfig: Record<string, unknown>;
  const existingPrice = await storage.getPriceByTicketQty(ticketQty).catch(() => null);

  if (existingPrice) {
    priceConfig = { price: existingPrice.id, quantity: 1 };
  } else {
    // Fallback: inline price (works before seed script is run)
    priceConfig = {
      price_data: {
        currency: "gbp",
        unit_amount: amountCents,
        product_data: {
          name: `PrizePour — ${ticketQty} Ticket${ticketQty > 1 ? "s" : ""}`,
          description: `Giveaway #${giveawayId} — ${ticketQty} ticket${ticketQty > 1 ? "s" : ""}`,
        },
      },
      quantity: 1,
    };
  }

  const domain = process.env.REPLIT_DOMAINS?.split(",")[0] ?? "localhost";
  const successUrl = `https://${domain}/giveaway/${giveawayId}?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `https://${domain}/giveaway/${giveawayId}`;

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ["card"],
    line_items: [priceConfig as never],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      giveawayId: String(giveawayId),
      ticketQty: String(ticketQty),
      firstName,
      lastName,
      email,
      referralCode: referralCode ?? "",
    },
  });

  req.log.info({ sessionId: session.id, giveawayId, ticketQty }, "Stripe checkout session created");

  return res.json({ url: session.url });
});

/**
 * GET /api/stripe/session/:sessionId
 * Verifies a completed Stripe session and idempotently creates an entry.
 * Returns the entry with ticket numbers.
 */
router.get("/stripe/session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  // Idempotency check — if entry already exists for this session, return it
  const existing = await storage.getEntryBySessionId(sessionId);
  if (existing) {
    req.log.info({ sessionId }, "Session entry already exists");
    return res.json({ entry: existing, ticketNumbers: existing.ticketNumbers });
  }

  const stripe = await getUncachableStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return res.status(402).json({ error: "Payment not completed" });
  }

  const { giveawayId, ticketQty, firstName, lastName, email, referralCode } = session.metadata as {
    giveawayId: string;
    ticketQty: string;
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
  };

  const qty = parseInt(ticketQty, 10);
  const tickets = Array.from({ length: qty }).map(
    () => "#" + Math.floor(1000 + Math.random() * 9000).toString()
  );

  const amountPaid = ((session.amount_total ?? 0) / 100).toFixed(2);

  const [entry] = await db.insert(entriesTable).values({
    giveawayId: parseInt(giveawayId, 10),
    firstName,
    lastName,
    email,
    ticketQty: qty,
    ticketNumbers: tickets,
    amountPaid,
    referralCode: referralCode || null,
    stripeSessionId: sessionId,
  }).returning();

  req.log.info({ sessionId, giveawayId, qty }, "Entry created from Stripe session");

  // If this entry was referred, create a referral reward for the referrer
  if (referralCode) {
    const freeTickets = Math.floor(Math.random() * 5) + 1;
    await db.insert(referralRewardsTable).values({
      referralCode,
      refereeEntryId: entry.id,
      freeTickets,
      status: "unclaimed",
    });
    req.log.info({ referralCode, freeTickets }, "Referral reward created");
  }

  return res.json({ entry, ticketNumbers: tickets });
});

export default router;
