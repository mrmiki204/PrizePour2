# CHANGELOG

Chronological log of meaningful changes to PrizePour. Newest entries at the top.

---

# CHANGELOG RULES

After every meaningful change:

- **Append a short entry** at the top of the dated section (newest first).
- **Include why** the change was made, not just what.
- **List affected files** if known.
- **Note risks, follow-ups, or required deploys.**
- **Keep entries concise** — a few bullets, not paragraphs.
- One entry per logical change. Multiple changes in the same task = multiple entries under the same date.
- If unsure whether something is "meaningful": route changes, DB changes, safety changes, seed changes, deployment changes, and bug fixes always are. Pure refactors and doc tweaks usually aren't (unless they affect the memory system itself).

---

## 2026-05-28

### Project memory system: SYSTEM_RULES.md + CHANGELOG.md

- Created `SYSTEM_RULES.md` as the permanent source of truth for business rules, safety constraints, admin/public visibility logic, seeded draws, styling, engineering, and deploy workflow.
- Created this `CHANGELOG.md` with rules at the top.
- Updated `PROJECT_CONTEXT.md` to reference both new files and added a "Project Memory System" section explaining how the four memory files (`PROJECT_CONTEXT.md`, `SYSTEM_RULES.md`, `CHANGELOG.md`, `replit.md`) work together.
- **Why:** reduce AI memory drift, prevent hallucinations across future Replit/Codex sessions, preserve business logic.
- **Files:** `SYSTEM_RULES.md` (new), `CHANGELOG.md` (new), `PROJECT_CONTEXT.md`.
- **Risks:** none — documentation only, no app behaviour change.

### Pointer to PROJECT_CONTEXT.md added in replit.md

- Added a "read first / keep updated" pointer in `replit.md` so future AI sessions discover `PROJECT_CONTEXT.md` via the canonical agent README.
- **Why:** ensure new sessions land on the memory system from the first prompt.
- **Files:** `replit.md`.

### PROJECT_CONTEXT.md created

- New file at repo root: living summary of project overview, stack, hosting, safety rules, all routes/pages, DB schema, seeded draws, fixed issues, current production issue, deploy workflow, and AI do/don't rules.
- **Why:** future AI sessions were losing context and re-asking the same questions.
- **Files:** `PROJECT_CONTEXT.md` (new).

### Fix Railway "No giveaways yet" — stale `ensureSchema` + missing Bushmills seed

- Rewrote `ensureSchema.ts` to mirror the current `giveaways` schema exactly: every column in `CREATE TABLE IF NOT EXISTS`, plus `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for `is_public`, `entries_paused`, `ticket_price_gbp`, `hero_tagline` (and equivalents on `entries`) so already-deployed Railway DBs self-heal on next boot.
- Refactored startup seed in `index.ts`: extracted `DEFAULT_GIVEAWAYS` constant and switched to a name-keyed diff (insert only rows whose `name` doesn't exist). Existing rows are never touched, so admin edits in prod survive redeploys.
- Added Bushmills as the third default seed (`isPublic=false` by default — admin publishes manually).
- Added boot logs: `Boot: connecting to database` → `Database schema ensured ...` → `Default giveaways seeded ...` (or `... already seeded — nothing to insert`) → `Giveaway table summary { total, active, public, paused, names }`. Seed errors now log at `error` level.
- **Root cause:** Railway's empty Postgres got an out-of-date table from the stale `ensureSchema`; subsequent `SELECT` calls failed silently with "column does not exist", and the seed never inserted Bushmills.
- **Why:** live `/admin` was showing "No giveaways yet" / 0 stats despite local working.
- **Files:** `artifacts/api-server/src/lib/ensureSchema.ts`, `artifacts/api-server/src/index.ts`.
- **Risks:** none on schema side (`ADD COLUMN IF NOT EXISTS` is safe on empty + populated DBs). Seed is idempotent. **Requires push to GitHub → Railway redeploy** to take effect.

### Image restoration + name-based fallback

- Extended `getGiveawayImage(id, imageUrl)` → `getGiveawayImage(id, imageUrl, name)` in `src/data/giveaways.ts`. New resolution order: admin URL → name-keyed bundled map → id-keyed bundled map → undefined.
- Added `BUNDLED_IMAGE_BY_NAME` map: Clonakilty, Patrón, Bushmills.
- Updated all callers (Home, GiveawayDetail, DrawPage, AdminDraws) to pass `name` through.
- Admin thumbnail now uses the helper and shows a small "Default" badge when the bundled fallback is in use; custom URLs still override.
- **Why:** Bushmills had no bundled fallback so it rendered "No image" everywhere it lacked an admin URL; DB ids differ between dev and prod, so id-keyed fallback was fragile.
- **Files:** `src/data/giveaways.ts`, `src/pages/Home.tsx`, `src/pages/GiveawayDetail.tsx`, `src/pages/DrawPage.tsx`, `src/pages/AdminDraws.tsx`.
- **Risks:** none — pure frontend, fallback only.

### Admin "Eligible for public Active Draws" status row

- Added a per-draw eligibility block in `/admin/draws` showing **Yes/No** + the exact reason(s) — `not active`, `hidden`, `entries paused`, `draw date passed` — using identical logic to the public-API server filter.
- **Why:** Clonakilty was appearing "Active" in admin but absent from the homepage (it was `entriesPaused=true`). Admins had no clear explanation.
- **Files:** `src/pages/AdminDraws.tsx`.
- **Risks:** none.

### Public `/api/giveaways` filter tightened to four conditions

- Server filter now requires `isActive=true AND isPublic=true AND entriesPaused=false AND drawDate >= now()` for the public list. `?all=true` (admin-only, behind `requireAdmin`) returns every row.
- **Why:** previously paused or hidden draws were leaking onto the homepage, or admin toggles weren't taking effect publicly.
- **Files:** `artifacts/api-server/src/routes/giveaways.ts`.

### Bushmills wired to DB + public lookup-by-name endpoint

- Bushmills moved from hardcoded frontend to DB-backed (seeded row).
- Added `GET /api/giveaways/lookup/by-name/:name` (public) so the dedicated `/experiences/bushmills` static page can resolve the live row without knowing its id.
- Removed the hardcoded Bushmills card from `Home.tsx`.
- **Why:** keep everything DB-driven; ids differ across environments.
- **Files:** `artifacts/api-server/src/routes/giveaways.ts`, `src/pages/BushmillsExperience.tsx`, `src/pages/Home.tsx`.

---

## Earlier (undated — recovered from project history)

### Admin authentication

- Session-based admin login via `ADMIN_PASSWORD` (secret) + `SESSION_SECRET` (secret). `requireAdmin` middleware guards every admin route.
- **Why:** prevent unauthorised access to draw management and entry data.

### Create-draw endpoint fix

- `POST /api/giveaways` accepts the full Zod schema generated from the current `giveawaysTable` (incl. `isPublic`, `entriesPaused`, `ticketPriceGbp`, `heroTagline`).
- **Why:** earlier versions rejected the new fields.

### Public draw sync fixes

- Frontend reads draws exclusively from `GET /api/giveaways` via TanStack Query hooks generated by Orval. No hardcoded fallback list.
- **Why:** admin toggles must be reflected publicly without code changes.

### Google Search Console verification + sitemap + robots

- Added Google Search Console verification meta/file.
- Generated `sitemap.xml` and `robots.txt` covering public pages (homepage, giveaway detail pages, legal pages); excluded `/admin*`.
- **Why:** SEO indexing for launch.

### Clonakilty visibility investigation

- Diagnosed Clonakilty "missing from homepage" as a paused-entries state, not a bug. Surfaced via the admin eligibility row (see 2026-05-28 entry above).

### Bushmills admin integration

- Bushmills row included in admin draw management; toggleable like any other draw. Dedicated `/experiences/bushmills` landing page reads the live row by name.

### Image restoration (initial)

- Bundled hero images (`hero-clonakilty.png`, `hero-patron.png`, `bushmills-hero.png`) added/restored under `artifacts/whiskey-giveaway/src/assets/images/`. Fallback resolver introduced (later upgraded — see 2026-05-28 entry).

### Stripe TEST MODE beta gate

- Three-flag gate: `sk_test_` key + `PAYMENTS_ENABLED=true` + `VITE_PAYMENTS_ENABLED=true`. Server refuses `sk_live_` keys. All checkout sessions tagged `metadata.test_mode = "true"`.
- **Why:** prevent accidental real payments during beta.
