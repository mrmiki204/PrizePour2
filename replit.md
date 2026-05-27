# PrizePour

Exclusive whiskey giveaway platform where users enter draws to win rare, collectible whiskies. Each draw has a ticket capacity set at 140% of the prize value (÷ $4.99 per ticket). Inspired by Prize Guy.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts exec tsx src/seed-products.ts` — create Stripe ticket products (run once after connecting Stripe)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind, shadcn/ui, framer-motion, wouter, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Payments: Stripe (via Replit integration) + stripe-replit-sync
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/whiskey-giveaway/` — React frontend (Vite)
- `artifacts/api-server/` — Express API server
- `lib/db/` — Drizzle ORM schema + migrations
- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `lib/api-client-react/` — generated React Query hooks (do not edit)
- `lib/api-zod/` — generated Zod schemas (do not edit)
- `scripts/src/seed-products.ts` — creates Stripe ticket products
- `artifacts/whiskey-giveaway/src/data/giveaways.ts` — all giveaway data
- `artifacts/whiskey-giveaway/src/pages/` — all pages (Home, GiveawayDetail, DrawPage, AdminDashboard, Terms, Privacy, Rules)

## Architecture decisions

- **140% ticket capacity rule**: `maxEntries = ceil(prizeValueNumeric * 1.4 / 4.99)` — ensures revenue covers prize cost with margin
- **Stripe Checkout (redirect)**: Payment redirects to Stripe, returns with `?session_id=xxx` which is verified server-side before creating the entry — avoids storing card data entirely
- **Idempotent entry creation**: `stripeSessionId` stored on entries — if same session verified twice, returns existing entry
- **Stripe init is graceful**: Server starts even if Stripe isn't connected; logs a warning instead of crashing
- **Referral codes**: Frontend-only for now (`firstname-giveawayid-ticketnumber`), stored in DB via `referralCode` field on entries

## Product

- Home page: hero with featured draw, all draws grid with capacity bars and countdown, trust section, FAQ, winners
- Giveaway detail: 4-step flow (tickets → details → Stripe checkout → confirmation + referral link)
- Draw page: live cinematic draw animation (lobby → spinner → reveal)
- Admin dashboard: entry stats, per-giveaway breakdown, searchable entry table
- Legal pages: Terms of Service, Privacy Policy, Official Contest Rules (at `/terms`, `/privacy`, `/rules`)

## User preferences

- Dark amber/gold aesthetic throughout
- Ticket capacity = 140% of prize value ÷ $4.99 (maxEntries formula)
- Keep giveaway data in `src/data/giveaways.ts` — single source of truth

## Stripe TEST MODE (beta)

PrizePour runs in **test mode only** during beta. Real payments cannot be taken — the server actively refuses any Stripe key that doesn't start with `sk_test_`.

**Three flags must all be true to enable test checkout:**

1. Connect a Stripe **test-mode** account via the Replit Integrations tab (secret key starts with `sk_test_`).
2. API server env: `PAYMENTS_ENABLED=true`
3. Frontend build env: `VITE_PAYMENTS_ENABLED=true`

If any of these is missing, the Step 4 button stays gated with the "Checkout opens at launch" panel.

**Optional env:** `PUBLIC_BASE_URL` — full origin used for Stripe `success_url` / `cancel_url`. Defaults to `https://${REPLIT_DOMAINS[0]}`. Set on Railway to your `*.up.railway.app` or custom domain (e.g. `https://prizepour.up.railway.app`).

**Test cards (Stripe test mode only):**
- `4242 4242 4242 4242` — successful payment
- `4000 0000 0000 9995` — declined (insufficient funds)
- `4000 0025 0000 3155` — requires 3DS authentication
- Any future expiry, any 3-digit CVC, any postcode.

**Flow:**
1. Visitor opens a giveaway → Steps 1–3 → Step 4 shows a yellow "TEST MODE" banner.
2. Click "Test Pay £X — Stripe Test Checkout" → redirects to Stripe test checkout.
3. **Success** → returns to `/giveaway/:id?session_id=...` → server verifies session, creates entry, frontend advances to Step 5 with ticket numbers + referral link.
4. **Cancel** → returns to `/giveaway/:id?checkout=cancelled` → frontend stays on Step 4 with a friendly cancel notice.
5. **Decline / failure** → Stripe shows the error inline; user can retry; no entry created.

**Safety guarantees:**
- Server refuses `sk_live_` keys with a 503 + log line.
- Without `PAYMENTS_ENABLED=true`, server returns 503 on all checkout attempts.
- Without `VITE_PAYMENTS_ENABLED=true`, the frontend never shows a Pay button.
- All checkout sessions are tagged with `metadata.test_mode = "true"` for auditability.

## Gotchas

- **Stripe not yet connected**: Go to Integrations tab → add Stripe (test mode). Then run `seed-products.ts` once to create ticket products. Checkout falls back to inline `price_data` until products exist.
- **Stripe webhook route**: Must be registered BEFORE `express.json()` in app.ts — already done correctly
- **Never use `console.log` in server code** — use `req.log` in route handlers, `logger` elsewhere
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after changing DB schema

## Open decisions (in progress)

- **Age verification**: currently a self-declared age gate. Options discussed: Stripe Identity, Onfido, Veriff, Persona, Sumsub, Yoti, GBG/Experian database lookup, Open Banking (TrueLayer/Plaid), manual ID upload + admin review, hybrid (DB lookup + doc fallback). No choice made yet.
- **User accounts / login**: site has no accounts; entries are anonymous per-giveaway. Options discussed: Clerk (Replit-managed), custom email+password, or stub login UI now and wire backend later. No choice made yet. When picked, also: navbar Sign in/Register button, welcome+logout state, pre-fill entry form for logged-in users, "My entries" view linking past entries by `userId`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `stripe` skill for Stripe integration setup and conventions
