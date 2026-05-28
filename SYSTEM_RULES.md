# SYSTEM_RULES.md

Permanent source of truth for PrizePour's business rules, safety constraints, and architectural conventions. **Do not violate any rule in this file without explicit, repeated user confirmation.**

Companion files:
- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — living summary of code/state (routes, schema, seeds, fixed issues)
- [`CHANGELOG.md`](./CHANGELOG.md) — chronological history of meaningful changes
- [`replit.md`](./replit.md) — quick operator README + user preferences

---

## Project overview

- **PrizePour** is a premium UK whiskey / spirits giveaway website.
- **Hosting:** Built in Replit → pushed to GitHub → **Railway** auto-deploys from main.
- **Database:** Replit-managed Postgres in dev, Railway-managed Postgres in prod. **They are separate instances.**
- **Domains:**
  - `prizepour.com` — primary (production)
  - `prizepour.co.uk` — future redirect to `.com`
- **Status:** Private **beta**. Stripe runs in **TEST MODE ONLY**. No real money may be taken.

---

## Permanent safety rules

These are inviolable unless the user explicitly overrides them more than once.

1. **PrizePour is in beta. Do not enable real payments.**
2. **Stripe must remain in test/beta mode.** The server actively refuses any key that does not start with `sk_test_` (503 + log). Do not weaken or remove this guard.
3. **Keep the `PAYMENTS_ENABLED` safety on.** Three flags must all be true for checkout to function: a `sk_test_` key, `PAYMENTS_ENABLED=true` on the server, `VITE_PAYMENTS_ENABLED=true` on the frontend build. Without all three, the checkout button stays gated.
4. **Keep checkout gated/disabled by default in production** until launch.
5. **Never expose, log, or echo secret values** — Stripe keys, `SESSION_SECRET`, `ADMIN_PASSWORD`, `DATABASE_URL` contents.
6. **Do not expose admin publicly.** No anonymous links, no auto-login, no convenience bypasses.
7. **Keep `ADMIN_PASSWORD` protection on every admin route** via the `requireAdmin` middleware. Sessions are signed with `SESSION_SECRET`. Do not remove either.
8. **Every Stripe Checkout Session must be tagged `metadata.test_mode = "true"`** for auditability while in beta.

---

## Admin rules

### Routes

- `/admin` — dashboard (stats, entries table)
- `/admin/draws` — draw management

### Admin must be able to

- Create draws
- Edit draws (name, description, prize value, price, draw date, image URL, etc.)
- Activate / deactivate draws (`isActive`)
- Hide / show publicly (`isPublic`)
- Pause entries (`entriesPaused`)
- Delete test draws safely (hard delete when no entries, soft-deactivate otherwise)
- Manage seeded experiences/draws (toggles persist; seeding never overwrites existing rows)
- Pick a winner per draw

### Admin must always see

Every draw, regardless of state:
- active
- inactive
- hidden
- paused
- ended
- previous

This is achieved by `GET /api/giveaways?all=true` (admin-only via `requireAdmin`), used by both `/admin` and `/admin/draws`.

---

## Public draw visibility rules

The public homepage / Active Draws section **only** shows draws where **all four** are true:

1. `isActive = true`
2. `isPublic = true`
3. `entriesPaused = false`
4. `drawDate >= now()` (not ended)

Enforced server-side in `routes/giveaways.ts` for `GET /api/giveaways` (no `?all=true`). The admin UI surfaces this exact logic per draw as "Eligible for public Active Draws: Yes/No + reason" so the rule is auditable from one place.

**Public state must always reflect admin state.** Never hardcode draws in the frontend — everything is DB-driven via `GET /api/giveaways`. The only acceptable static frontend assets are bundled images.

---

## Seeded draw rules

Three default draws are inserted by `seedGiveaways()` in `artifacts/api-server/src/index.ts` on first boot of a fresh database. Seeding is **idempotent and name-keyed** — only rows whose `name` doesn't already exist are inserted. Existing rows are never modified.

| # | Name | Prize value | Ticket price | Default visibility | Image |
|---|---|---|---|---|---|
| 1 | **The Patrón Collection** | Worth Over £1,950 (£1984.15 numeric) | £4.99 | active + public | `hero-patron.png` |
| 2 | **The Clonakilty Collection** | Worth Over £500 (£481 numeric) | £4.99 | active + public | `hero-clonakilty.png` |
| 3 | **Bushmills Distillery Tour Experience** | Worth Over £2,500 | £10.00 | active + **hidden** (`isPublic=false`) — admin publishes it manually | `bushmills-hero.png` |

### Image requirements

Every seeded draw must have a bundled fallback image so it renders even when admin hasn't set a custom `imageUrl`.

### Fallback rule

`getGiveawayImage(id, imageUrl, name)` in `src/data/giveaways.ts` resolves in this order:

1. Admin-supplied `imageUrl` (custom override) — always wins if non-blank
2. Bundled image matched by **exact `name`** (stable across environments)
3. Bundled image matched by **DB `id`** (dev safety net only)
4. `undefined` — caller renders its own placeholder

When adding a new seeded draw, **both** the seed entry and the `BUNDLED_IMAGE_BY_NAME` map must be updated together.

---

## Styling rules

- **Keep the luxury premium dark/gold theme.** Dark backgrounds, amber/gold accents, serif typography for premium feel.
- **Do not redesign unnecessarily.** Small, focused, on-brand changes only — no sweeping aesthetic rewrites without explicit user request.
- **Keep mobile responsive.** Test small viewports for hero, draw cards, admin tables, and the 4-step entry flow.
- **Preserve the premium feel.** No clip-art, no neon, no cartoonish iconography, no flashing animations. Subtle motion only (framer-motion is already in the stack).
- Use the existing shadcn/ui components and the established Tailwind palette — don't introduce a new design system.

---

## Engineering rules

- **Prefer DB-driven logic over hardcoded content.** Draws, entries, stats — all come from Postgres. The frontend reads via TanStack Query hooks generated from the OpenAPI spec.
- **Fix root cause rather than patch symptoms.** Diagnose before editing. Explain the root cause in your response.
- **Make minimal, invasive-as-needed changes.** Don't refactor unrelated code. Don't rewrite from scratch unless there's no alternative.
- **Reuse existing components and helpers** (`getGiveawayImage`, `daysUntil`, shadcn/ui, the eligibility logic). Don't reinvent.
- **Test in Replit before pushing.** Run typecheck (`pnpm --filter @workspace/<pkg> run typecheck`) and verify in the preview iframe.
- **Server logging:** use `req.log` in route handlers, the singleton `logger` elsewhere. **Never `console.log`** in server code.
- **DB schema changes:** update `lib/db/src/schema/*.ts`, run `pnpm --filter @workspace/db run push` in dev, **AND** update `artifacts/api-server/src/lib/ensureSchema.ts` to mirror the change (so Railway self-heals on next boot).
- **API contract changes:** edit `lib/api-spec/openapi.yaml` and run `pnpm --filter @workspace/api-spec run codegen`. Never edit `lib/api-client-react/` or `lib/api-zod/` by hand.
- **Don't rely on DB ids being stable across environments.** Match by `name` for cross-env lookups (bundled images, seeds, lookup endpoints).
- **Stripe access:** use `getStripeSync()` — do not instantiate raw Stripe clients.

---

## Deployment workflow

Always:

1. **Test locally in Replit** — workflows auto-restart on file changes; verify in the preview pane. Run typecheck.
2. **Commit and push:**
   ```bash
   git status
   git add .
   git commit -m "<concise message>"
   git push
   ```
3. **Railway auto-deploys** from `main`. Watch the Railway logs for the boot sequence:
   - `Boot: connecting to database`
   - `Database schema ensured (tables + columns up to date)`
   - `Default giveaways seeded on startup` (first deploy) OR `Default giveaways already seeded — nothing to insert`
   - `Giveaway table summary { total, active, public, paused, names }`
4. **Verify production manually** — visit the homepage, `/admin`, `/admin/draws`; sanity-check `curl https://<app>/api/giveaways` and `?all=true` (with admin cookie).

Never run `pnpm dev` at the workspace root. Use workflows in Replit or Railway's start command.

---

## Rules for future AI assistants

**Before making any change**, read in this order:

1. [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — current state
2. [`SYSTEM_RULES.md`](./SYSTEM_RULES.md) — this file; permanent rules
3. [`CHANGELOG.md`](./CHANGELOG.md) — recent history
4. [`replit.md`](./replit.md) — operator README + user preferences
5. Any directly relevant skill in `.local/skills/` (e.g. `stripe`, `pnpm-workspace`, `database`)

**Treat these files as the source of truth.** Do not contradict them or invent features/assumptions they don't describe.

**Before editing:**

- **Inspect the actual code** — never guess. Use ripgrep/read tools.
- **Explain root cause, plan, and changes made** in your response. The user is non-technical and needs to know what happened and why.

**While editing:**

- **Preserve every beta/payment/admin safety protection.** No exceptions without explicit user override.
- **Keep changes minimal and on-brand.**
- **Run typecheck** before declaring done.

**After editing:**

- **Append an entry to `CHANGELOG.md`** describing the change, why, files affected, and any risks/follow-ups.
- **Update `PROJECT_CONTEXT.md`** if the change adds/modifies routes, DB fields, seeds, safety rules, or deployment steps.
- **Suggest pushing to GitHub** so Railway redeploys, and confirm what to verify on the live site.
