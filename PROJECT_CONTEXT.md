# PrizePour — Project Context

> Living summary of the PrizePour codebase as of the latest commit. Keep this file up to date when major features land so future AI sessions don't lose context or hallucinate. **This file is documentation only — do not import it from code.**

## Project memory system

PrizePour uses a four-file memory system to keep AI sessions consistent and prevent drift. **Read all four before making changes.**

| File | Role | Update when |
|---|---|---|
| **`PROJECT_CONTEXT.md`** (this file) | Living **snapshot** of current code/state — routes, schema, seeds, fixed issues, deploy workflow | A meaningful change ships that affects what the code does or how it's deployed |
| **`SYSTEM_RULES.md`** | Permanent **business rules** + safety constraints + architectural conventions | A rule changes (rarely); never violate a rule without explicit user override |
| **`CHANGELOG.md`** | Chronological **history** of every meaningful change | After every meaningful change (append a short entry at the top) |
| **`replit.md`** | Operator README + user preferences; entry point that points at the other three | When the user records a new preference or convention |

  How they work together: `SYSTEM_RULES.md` tells you what you **must not break**, `PROJECT_CONTEXT.md` tells you **what currently exists**, `CHANGELOG.md` tells you **what just changed and why**, and `replit.md` is the short README that points new sessions at all three. If they disagree, `SYSTEM_RULES.md` wins on rules, `PROJECT_CONTEXT.md` wins on current state, and the most recent `CHANGELOG.md` entry wins on what just happened.



## NON-NEGOTIABLE BUSINESS RULES (SOURCE OF TRUTH)


### READ FIRST RULE

Before making ANY Replit/Codex changes ALWAYS read:

1. PROJECT_CONTEXT.md
2. SYSTEM_RULES.md
3. CHANGELOG.md

Treat them as source of truth.

Every future Replit/Codex prompt MUST begin with:

"Read PROJECT_CONTEXT.md, SYSTEM_RULES.md, and CHANGELOG.md first before making changes."

---

## PROJECT MISSION

PrizePour is a premium spirit giveaway platform.

Brand positioning:

**“Luxury whisky brand × premium collector experience”**

PrizePour should feel:

* luxury
* premium
* elegant
* cinematic
* collector-focused
* trust-driven

PrizePour should NOT feel like:

* cheap raffle website
* gambling-heavy
* cluttered
* over-animated
* spammy
* discount-focused

Design philosophy:

**Minimal luxury**

Elegant spacing, premium visuals, restrained effects.

---

## NON-NEGOTIABLE SAFETY RULES

PrizePour is in BETA.

REAL PAYMENTS MUST NEVER BE ENABLED.

Always preserve:

* Stripe TEST mode
* PAYMENTS_ENABLED safety
* checkout gating
* ADMIN_PASSWORD protection
* private admin routes
* beta safeguards

DO NOT REMOVE:

* beta banner
* payment protections
* admin authentication
* checkout safety restrictions

Never expose admin publicly.

Protected routes:

* /admin
* /admin/draws
* /admin/beta-signups
* /admin/analytics

---

## ADMIN DRAW RULES (CRITICAL)

ADMIN MUST ALWAYS SHOW ALL DRAWS.

Admin includes:

* active
* inactive
* hidden
* visible
* paused
* ended
* seeded
* archived
* test draws

Admin endpoint:

GET ALL DRAWS

Public endpoint:

GET FILTERED DRAWS

Hidden draws MUST NEVER disappear from admin.

Hide button behavior:

Expected:

Admin:

* draw remains visible
* status updates to hidden

Public:

* draw hidden

Hide ONLY affects public visibility.

---

## PUBLIC DRAW VISIBILITY RULES

Homepage and Active Draws should ONLY show:

* active = true
* visible/public = true
* paused = false
* not ended

Public should NEVER show:

* hidden draws
* paused draws
* ended draws
* inactive draws

---

## CURRENT HIGHEST PRIORITY BUG

BUG:

Hide button removes giveaway from admin.

Wrong behavior:

* draw disappears from admin
* admin shows "No giveaways yet"

Expected behavior:

Admin:

* draw remains visible

Public:

* draw hidden

Likely cause:

Admin logic incorrectly uses public filtering.

Correct architecture:

Admin = ALL DRAWS

Public = FILTERED DRAWS

---

## DESIGN RULES

Keep:

* luxury dark/gold aesthetic
* premium typography
* elegant spacing
* cinematic imagery
* restrained animations
* mobile responsiveness

Avoid:

* clutter
* cheap raffle feel
* gambling look
* excessive glow
* unnecessary redesigns

Rule:

**Premium > flashy**

---

## 1. Project overview

**PrizePour** is a premium UK whiskey / spirits giveaway platform. Visitors buy tickets to enter draws for rare or collectible bottles and curated experiences. Inspired by Prize Guy.

- **Status:** Private beta. Stripe runs in **TEST MODE ONLY** — no real money can be taken.
- **Capacity rule:** `maxEntries = ceil(prizeValueNumeric * 1.4 / ticketPriceGbp)`. Default ticket price is £4.99 but Bushmills uses £10.00. This guarantees revenue covers the prize cost with margin.

### Stack

- **Monorepo:** pnpm workspaces (`@workspace/*` package naming)
- **Runtime:** Node.js 24, TypeScript 5.9
- **Frontend:** React 18 + Vite, Tailwind, shadcn/ui, framer-motion, wouter (routing), TanStack Query
- **API:** Express 5
- **Database:** PostgreSQL via Drizzle ORM
- **Payments:** Stripe (Replit integration) + `stripe-replit-sync`
- **Validation:** Zod (`zod/v4`), `drizzle-zod`
- **API codegen:** Orval from `lib/api-spec/openapi.yaml` → `lib/api-client-react`, `lib/api-zod`
- **Build:** esbuild (CJS bundle for the server)

### Hosting & deployment

- **Development:** Replit workspace (this environment) with a Replit-managed Postgres dev DB. Workflows run automatically:
  - `artifacts/api-server: API Server`
  - `artifacts/whiskey-giveaway: web`
  - `artifacts/prizepour-mobile: expo`
  - `artifacts/mockup-sandbox: Component Preview Server`
- **Production:** **Railway** (own Postgres). The repo is pushed to GitHub and Railway auto-deploys on push to main.
- **Local proxy:** All artifacts are reached through `localhost:80` (path-based routing — never call service ports directly).

### Main domains

- Replit dev preview (proxied iframe)
- Railway production: typically `https://<service>.up.railway.app` (and any custom domain configured on Railway)
- `PUBLIC_BASE_URL` env var should be set on Railway so Stripe `success_url` / `cancel_url` use the right origin.

### Beta / payment safety rules

Three flags must all be true for any checkout to function:

1. Stripe connected via Replit Integrations with a **test-mode** secret key (must start with `sk_test_`). The server actively refuses `sk_live_` keys with a 503 + log line.
2. API server env: `PAYMENTS_ENABLED=true`
3. Frontend build env: `VITE_PAYMENTS_ENABLED=true`

If any flag is missing, the Step 4 button stays gated with a "Checkout opens at launch" panel. Every checkout session is tagged `metadata.test_mode = "true"` for auditability.

**Stripe test cards:** `4242 4242 4242 4242` (success), `4000 0000 0000 9995` (declined), `4000 0025 0000 3155` (3DS). Any future expiry, any 3-digit CVC, any postcode.

---

## 2. Important safety rules

**Hard rules — never violate without explicit user instruction:**

- ❌ **Do not enable real payments.** Never flip `PAYMENTS_ENABLED` or `VITE_PAYMENTS_ENABLED` to `true` in production without explicit, repeated user confirmation.
- ❌ **Do not accept `sk_live_` Stripe keys.** The server already refuses them — do not remove this guard.
- ❌ **Do not remove the `requireAdmin` middleware** from any admin route. Admin is protected by `ADMIN_PASSWORD` (already a secret) via session cookies signed with `SESSION_SECRET`.
- ❌ **Do not expose admin routes publicly** (no anonymous links, no auto-login, no bypass for "convenience").
- ❌ **Do not use `console.log` in server code** — use `req.log` in route handlers, the singleton `logger` elsewhere. Skill: `pnpm-workspace`.
- ❌ **Do not log or print secret values** (Stripe keys, session secret, admin password, DATABASE_URL contents).
- ✅ **Always run `pnpm --filter @workspace/api-spec run codegen`** after changing `openapi.yaml`.
- ✅ **Always run `pnpm --filter @workspace/db run push`** in dev after changing DB schema, AND update `artifacts/api-server/src/lib/ensureSchema.ts` to mirror the change so Railway self-heals on next boot.

---

## 3. Current routes / pages

### Public frontend (`artifacts/whiskey-giveaway`)

| Path | File | Purpose |
|---|---|---|
| `/` | `pages/Home.tsx` | Hero (headline + trust line + "View Active Draws" / "How It Works" CTAs) → featured-draw carousel → **`#how-it-works`** 3-card section → **`#giveaways`** Active Draws grid → "Why Us" → **`#about`** FAQ (accordion) → winners. All CTAs say "Preview Giveaway" with a "Secure • Transparent • Beta Preview" trust line. |
| `/giveaway/:id` | `pages/GiveawayDetail.tsx` | **Premium collection landing** (step 1) → entry flow (steps 2–5). Step 1 = `<CollectionLanding>` (cinematic hero + DB stats/countdown/capacity bar + "Preview Giveaway"/"Join Beta List" CTAs + beta helper, What's Included, Why It Matters story, Highlights cards, FAQ) + `#enter` ticket selector (beta-gated) + `<WaitlistSection>`. "Preview Giveaway" enters the 4-step flow: tickets → details → Stripe checkout (disabled in beta) → confirmation + referral link. Bushmills uses its own page instead. |
| `/draw/:id` | `pages/DrawPage.tsx` | Live cinematic draw animation (lobby → spinner → reveal). |
| `/experiences/bushmills` | `pages/BushmillsExperience.tsx` | Dedicated Bushmills landing page (uses its own static images). |
| `/terms` | `pages/Terms.tsx` | Terms of Service. |
| `/privacy` | `pages/Privacy.tsx` | Privacy Policy. |
| `/rules` | `pages/Rules.tsx` | Official Contest Rules. |

### Admin frontend (protected by `ADMIN_PASSWORD`)

| Path | File | Purpose |
|---|---|---|
| `/admin` | `pages/AdminDashboard.tsx` | Entry stats, total revenue, tickets sold, active draw count, searchable entry table. |
| `/admin/draws` | `pages/AdminDraws.tsx` | Draw management — toggle active / public / paused, edit fields, eligibility status row showing exactly why a draw is or isn't visible publicly. |
| `/admin/beta-signups` | `pages/AdminBetaSignups.tsx` | Beta waitlist management — list, search, delete signups; stat cards (total + last 7 days). |
| `/admin/analytics` | `pages/AdminAnalytics.tsx` | Pre-launch analytics — page views, hero CTA clicks, draw card clicks, beta signups, waitlist funnel (started → completed/duplicate/failed + conversion rate), events-by-type, draw interest, recent events. |

### API routes (`artifacts/api-server/src/routes/`)

Mounted under `/api`:

- `GET /api/healthz` — health check
- `GET /api/giveaways` — public list. Filters: `isActive=true AND isPublic=true AND entriesPaused=false AND drawDate >= now()`.
- `GET /api/giveaways?all=true` — **admin-only** (requireAdmin); returns every draw including hidden/inactive/paused/ended.
- `GET /api/giveaways/:id` — single draw by id (public)
- `GET /api/giveaways/lookup/by-name/:name` — single draw by exact name (public; used by the static Bushmills page)
- `POST /api/giveaways` — admin; create draw
- `PATCH /api/giveaways/:id` — admin; update draw (toggles + edits)
- `DELETE /api/giveaways/:id` — admin; delete if no entries, else soft-deactivate
- `POST /api/giveaways/:id/winner` — admin; pick winner
- `POST /api/entries` — public; create entry (requires verified Stripe session)
- `POST /api/stripe/checkout` — public (but gated by `PAYMENTS_ENABLED`); creates a Stripe Checkout Session
- `POST /api/stripe/webhook` — Stripe webhook (registered BEFORE `express.json()` in `app.ts`)
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me` — admin auth
- `GET /api/admin/stats` — admin; dashboard stats
- Rewards routes for referrals (`/api/rewards/*`)
- `POST /api/beta-signups` — **public**; beta waitlist signup. Validates email (zod), normalizes to lowercase, in-memory IP rate limit (5/min). 201 on create, 409 duplicate, 400 invalid email, 429 rate-limited.
- `GET /api/beta-signups` — admin (requireAdmin); list all signups (newest first).
- `DELETE /api/beta-signups/:id` — admin; delete a signup.
- `POST /api/analytics-events` — **public**; record one analytics event (fire-and-forget, 204). Enum-validated event type, in-memory IP rate limit (60/min). Never blocks the frontend.
- `GET /api/analytics-events?limit=` — admin (requireAdmin); recent events newest-first (default 100, max 500).
- `GET /api/analytics-summary` — admin; aggregated counts by event type, top 4 tracked draws (patron / clonakilty / bushmills / macallan), waitlist funnel (started/completed/failed/duplicate/conversion rate), live beta signup total.

---

## 4. Database and draw model

Schema lives in `lib/db/src/schema/` (Drizzle). Four tables:

### `giveaways`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | Auto-increment — **differs across environments** |
| `name` | text NOT NULL | Unique by convention; used for stable cross-env lookup |
| `description` | text NOT NULL | |
| `prize_value` | text NOT NULL | Display string e.g. `"Worth Over £500"` |
| `prize_value_numeric` | numeric(10,2) NOT NULL | Drives capacity calculation |
| `max_entries` | integer NOT NULL | Computed at seed time: `ceil(prizeValueNumeric * 1.4 / ticketPriceGbp)` |
| `draw_date` | timestamptz NOT NULL | |
| `image_url` | text NULL | Admin override; null falls back to bundled image |
| `is_active` | boolean NOT NULL DEFAULT true | Admin master switch |
| `is_public` | boolean NOT NULL DEFAULT true | Visible on homepage |
| `entries_paused` | boolean NOT NULL DEFAULT false | Pause ticket sales without hiding |
| `ticket_price_gbp` | numeric(6,2) NOT NULL DEFAULT 4.99 | Bushmills uses 10.00 |
| `hero_tagline` | text NULL | Optional label on cards e.g. "Luxury Experience" |
| `created_at` | timestamptz NOT NULL DEFAULT now() | |

### `entries`

`id, giveaway_id, first_name, last_name, email, ticket_qty, ticket_numbers (text[]), amount_paid, referral_code, stripe_session_id, created_at`.

- `stripe_session_id` provides **idempotency** — verifying the same session twice returns the existing entry rather than creating a duplicate.

### `referral_rewards`

`id, referral_code, referee_entry_id, free_tickets, status, claimed_giveaway_id, claimed_entry_id, created_at, claimed_at`.

### `beta_signups`

`id, first_name (nullable), email (NOT NULL, unique via `beta_signups_email_unique` index), created_at`. Powers the homepage beta waitlist section and `/admin/beta-signups`. Emails stored lowercase; duplicate POSTs return 409.

### `analytics_events`

`id, event_type (NOT NULL), event_name (NOT NULL), draw_slug (nullable), page_path (nullable), metadata (nullable), created_at`. Indexes on `event_type` and `created_at`. Allowed `event_type` values are enum-locked server-side: `page_view`, `hero_cta_click`, `draw_click`, `explore_collection_click`, `waitlist_started`, `waitlist_completed`, `waitlist_failed`, `waitlist_duplicate`. No PII captured.

### How public visibility works

A draw appears on the public homepage / Active Draws section **iff all four conditions hold**:

1. `is_active = true`
2. `is_public = true`
3. `entries_paused = false`
4. `draw_date >= now()`

This is enforced server-side in `routes/giveaways.ts` for `GET /api/giveaways`.

### How admin visibility works

`/admin/draws` calls `GET /api/giveaways?all=true` with the admin session cookie, returning every row regardless of state. Each card displays an "Eligible for public Active Draws: Yes/No" status row, and if "No" it lists the exact reason(s) — `not active`, `hidden`, `entries paused`, `draw date passed`. The eligibility logic in the UI is intentionally identical to the server filter so they can never drift.

---

## 5. Currently seeded draws

Seeded automatically on first boot of a fresh database by `seedGiveaways()` in `artifacts/api-server/src/index.ts`. Seeding is **idempotent and name-keyed** — each default is inserted only if no row with that exact `name` exists. Existing rows are never modified, so admin edits in production are preserved across redeploys.

| Name | Prize | Tickets | Price | Default state |
|---|---|---|---|---|
| **The Clonakilty Collection** | Worth Over £500 (£481 numeric) | 147 | £4.99 | active, public |
| **The Patrón Collection** | Worth Over £1,950 (£1984.15 numeric) | 557 | £4.99 | active, public |
| **Bushmills Distillery Tour Experience** | Worth Over £2,500 | 250 | £10.00 | active, **hidden** (`isPublic=false`) — toggle visible in admin to publish |
| **The Macallan Luxury Scotch Collection** | Worth Over £2,500 | 351 | £9.99 | **inactive + hidden + paused** by default — admin enables all three toggles in `/admin/draws` to publish |

Bottle/product imagery lives in `artifacts/whiskey-giveaway/src/data/giveaways.ts` (`COLLECTION_BOTTLES`, `PATRON_BOTTLES`). Bushmills landing-page assets are in `src/assets/images/bushmills-*.png`.

### Image fallback chain

`getGiveawayImage(id, imageUrl, name)` in `src/data/giveaways.ts`:

1. Admin-supplied `imageUrl` (custom override) — always wins
2. Bundled image matched by **exact name** (stable across envs)
3. Bundled image matched by **id** (dev safety net)
4. `undefined` — caller renders its own placeholder

Bundled hero images: `hero-clonakilty.png`, `hero-patron.png`, `bushmills-hero.png`, `hero-macallan.png`.

---

## 6. Known issues already fixed

| Issue | Fix |
|---|---|
| Admin login session not persisting | Session cookies signed with `SESSION_SECRET`, `requireAdmin` middleware on all admin routes. |
| Create-draw endpoint failing on new fields | `POST /api/giveaways` accepts the full Zod schema generated from `giveawaysTable`. |
| Public list out of sync with admin toggles | Public `/api/giveaways` filter now requires `isActive AND isPublic AND NOT entriesPaused AND drawDate >= now()`. Admin uses `?all=true`. |
| Clonakilty "missing" from public list while showing Active in admin | Was correctly excluded due to `entriesPaused=true`. Admin `/admin/draws` now displays an explicit "Eligible for public Active Draws: Yes/No" row with the exact reason — so the cause is visible at a glance. |
| Bushmills had no image; admin thumbnail showed "No image" for any draw with null `imageUrl` | Added Bushmills to `BUNDLED_IMAGE_BY_NAME`. Admin thumbnail now uses `getGiveawayImage(id, imageUrl, name)` with a small "Default" badge when the fallback is used. Custom URL still overrides. |
| Hardcoded Bushmills entries on the homepage | Removed — Home.tsx now renders only DB-backed draws. |
| Railway "No giveaways yet" on `/admin` (production DB issue) | See section 7 — fixed and pending deploy. |

---

## 7. Current production issue

**Symptom (now fixed in code, awaiting deploy):** Live Railway `/admin` showed `Total entries: 0`, `Active draws: 0`, "No giveaways yet" even though local Replit admin worked.

**Root cause:**

1. `artifacts/api-server/src/lib/ensureSchema.ts` was stale — it created the `giveaways` table with only the original columns and was never updated when `is_public`, `entries_paused`, `ticket_price_gbp`, `hero_tagline` were added. On Railway's empty Postgres it created an out-of-date table, then every `SELECT` against the new schema failed silently with "column does not exist". The seed function caught the error and downgraded it to a warning, so the server kept running with an empty table.
2. Bushmills wasn't in the startup seed — only Clonakilty and Patrón were (`seed-bushmills.ts` is a manual script, not part of boot).

**Fix shipped (pending push to GitHub → Railway redeploy):**

- `ensureSchema.ts` rewritten to mirror the current schema exactly + adds `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for every column added after the original baseline, so existing Railway DBs self-heal.
- Startup seed in `index.ts` now uses a name-keyed diff: insert only rows whose `name` doesn't already exist. Existing rows are never touched.
- Bushmills added as the third default seed (`isPublic=false` so it stays hidden by default — admin can publish it).
- Boot logs now print: `Boot: connecting to database` → `Database schema ensured ...` → `Default giveaways seeded ...` (or `... already seeded — nothing to insert`) → `Giveaway table summary { total, active, public, paused, names }`. Seed errors log at `error` level.

**To verify after deploy:** check Railway logs for the boot sequence above, then `curl https://<app>.up.railway.app/api/giveaways?all=true` should return 3 rows. The admin page should now show all three draws.

---

## 8. Deployment workflow

```bash
# 1. Test in Replit first
pnpm run typecheck                                          # full repo typecheck
pnpm --filter @workspace/api-server run typecheck           # server only
pnpm --filter @workspace/whiskey-giveaway run typecheck     # web only

# Workflows auto-restart on file changes. Verify in the preview pane.

# 2. Commit and push
git status
git add .
git commit -m "<message>"
git push

# 3. Railway auto-deploys from main.
#    Watch Railway logs for the boot sequence:
#      "Boot: connecting to database"
#      "Database schema ensured (tables + columns up to date)"
#      "Default giveaways seeded on startup" (first deploy) OR
#        "Default giveaways already seeded — nothing to insert"
#      "Giveaway table summary { total, active, public, paused, names }"

# 4. Test live
#    - https://<app>.up.railway.app/                  (public homepage)
#    - https://<app>.up.railway.app/admin             (login with ADMIN_PASSWORD)
#    - https://<app>.up.railway.app/admin/draws       (all three draws visible)
#    - curl https://<app>.up.railway.app/api/giveaways           → eligible draws only
#    - curl https://<app>.up.railway.app/api/giveaways?all=true  → admin-auth-required; all rows
```

**Important:** Never run `pnpm dev` at the workspace root — use workflows (Replit) or Railway's start command. Individual artifacts need `PORT` and `BASE_PATH` env vars wired by the workflow / Railway service config.

---

## Rules for future AI assistants

### Do

- ✅ **Read `replit.md` first**, then this file, then any skill that's directly relevant (`stripe`, `pnpm-workspace`, `database`).
- ✅ **Keep this file accurate.** When you ship a meaningful change (new route, new field, new seed, fixed bug, new safety rule), update the relevant section in the same task.
- ✅ **Mirror DB schema changes in `ensureSchema.ts`** AND run `pnpm --filter @workspace/db run push` in dev. Forgetting the former is what broke Railway last time.
- ✅ **Update both seed name + name-based image fallback** when adding a new default draw, so its image renders without an admin URL.
- ✅ **Use the eligibility helper logic** (active + public + not paused + draw in future) anywhere you need to know if a draw is publicly visible — never reinvent it.
- ✅ **Run typecheck (`pnpm --filter ... run typecheck`)** before suggesting a deploy. `build` may fail from the shell because it needs workflow-provided env vars.
- ✅ **Use `req.log` / `logger`** for all server logging.
- ✅ **Use the Stripe integration** via `getStripeSync()` — do not instantiate raw Stripe clients.
- ✅ **Suggest pushing to GitHub / redeploying Railway** whenever a change affects production behavior.

### Don't

- ❌ **Do not enable real payments** (`PAYMENTS_ENABLED=true` with a `sk_live_` key) unless the user explicitly confirms, repeatedly. The server already refuses `sk_live_` — leave that guard alone.
- ❌ **Do not bypass `requireAdmin`** or weaken admin auth in any way.
- ❌ **Do not hardcode draws in frontend pages.** Everything must be DB-backed via `GET /api/giveaways`. The only acceptable static asset is bundled imagery.
- ❌ **Do not use `console.log` in server code.**
- ❌ **Do not edit `lib/api-client-react/` or `lib/api-zod/`** — they're generated. Edit `lib/api-spec/openapi.yaml` and run codegen.
- ❌ **Do not rely on DB ids being stable across environments** (Clonakilty might be id=1 in dev and id=42 in prod). Match by `name` for cross-env lookups (bundled images, seeds).
- ❌ **Do not log secrets** or echo env var values into the chat.
- ❌ **Do not assume Railway DB == Replit DB.** They are completely separate Postgres instances.
- ❌ **Do not run destructive git commands** (`git reset --hard`, `git push --force`, etc.) without explicit user approval — delegate to a project task if asked.
- ❌ **Do not introduce new top-level packages** outside the established workspace layout (`artifacts/*`, `lib/*`, `scripts/`).

When in doubt: read the relevant skill in `.local/skills/`, then ask the user a focused clarifying question instead of guessing.
