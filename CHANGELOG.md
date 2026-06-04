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
## STANDARD CHANGE ENTRY FORMAT

For every meaningful Replit change use this structure:

```md
## YYYY-MM-DD — Short title

### Changed
- What changed

### Fixed
- What bug was fixed

### Why
- Why this change was necessary

### Safety checked
- admin still protected
- checkout still gated
- payments still TEST mode
- mobile still responsive
- draw visibility works

### Files affected
- file names if known

### Notes for future Replit AI
- warnings, caveats, follow-up work
```

Rules:

* newest entries stay at the top
* explain WHY, not only WHAT
* include safety checks after risky changes
* mention affected files when possible
* include follow-up tasks if unfinished
* bug fixes should include root cause when known
* keep entries concise and readable
* avoid huge paragraphs

Meaningful changes include:

* admin logic changes
* route changes
* DB/schema changes
* deployment changes
* payment logic
* UI changes
* bug fixes
* security changes
* architectural changes


## 2026-05-31 — Age gate now per-session (no permanent localStorage)

### Changed
- Age verification now uses **`sessionStorage`** with key **`prizepour_age_verified_session`** instead of `localStorage` (`prizepour_age_verified`).

### Why
- The age gate must appear on every fresh visit/session for both new and returning visitors. `localStorage` permanently remembered verification, so returning visitors skipped the gate. Session storage persists only for the current tab/session.

### Behaviour
- Gate shows first on any public route (incl. direct deep links like `/giveaway/:id`) before content renders (synchronous read in `useState` initializer — no content flash).
- Within the same session, internal SPA navigation and full-page reloads/deep links do NOT re-prompt.
- Closing the tab/browser clears the session → gate shows again next visit.

### Safety checked
- admin still password-protected (`AdminGuard`/`ADMIN_PASSWORD`, untouched) — e2e confirmed `/admin` shows login form
- checkout still gated / payments still TEST mode (no payment/Stripe code touched)
- public draw visibility unchanged (DB-driven)
- no DB schema change

### Files affected
- `artifacts/whiskey-giveaway/src/components/AgeGate.tsx` (only file changed)

### Notes for future Replit AI
- Old `localStorage` key `prizepour_age_verified` is no longer read or written. Other `localStorage` usage (Profile, PreLaunchChecklist) is unrelated and left as-is.
- e2e verified: fresh context → gate first on `/` and `/giveaway/1`; no re-prompt on internal nav or same-session deep link; brand-new context re-prompts; `/admin` still requires password.

---

## 2026-05-31 — Homepage conversion polish (no payment changes)

### Changed
- **How It Works** → retitled "How PrizePour Works" / "Three Steps to Your Collection". Step copy clarified for beta: Explore a Collection → Reserve Your Place ("Entries open at launch — join the beta list to be first in line") → Winner Announced. Added a prominent "Join the Beta List" CTA below the steps (scrolls to the waitlist) with microcopy "Free to join · No payment during beta".
- **Beta waitlist** → headline now "Be First Through the Door", clearer subcopy, and a new "Why join early" value row (Early Access / Founding Members / No Spam). Form, validation, and analytics events unchanged.
- **Active Draws** → renamed eyebrow to "Premium Collections · Limited Access" and heading to "Open Collections"; removed the "Live Raffles" wording (off-brand "raffle" feel per SYSTEM_RULES) and improved the intro copy to push preview + waitlist.

### Why
- During beta, checkout is disabled, so the highest-value conversion action is joining the waitlist or previewing a draw. These copy/CTA changes make those paths clearer and more premium without enabling payments or redesigning working sections.

### Safety checked
- admin still protected (untouched)
- checkout still gated (e2e confirmed payment step shows the beta-disabled state, no live Pay button)
- payments still TEST mode (no Stripe/payment code touched)
- mobile still responsive (e2e at 390×844 — sections stack cleanly, no overflow)
- draw visibility works (DB-driven via `useListGiveaways()`, unchanged)

### Files affected
- `artifacts/whiskey-giveaway/src/pages/Home.tsx`
- `artifacts/whiskey-giveaway/src/components/home/WaitlistSection.tsx`

### Notes for future Replit AI
- Pure content/copy + one CTA + one value-props row. No routes, schema, seeds, API contract, or analytics event types changed (reused existing `hero_cta_click` for the new How-It-Works CTA).
- Typecheck baseline still has the two pre-existing shadcn/ui errors (`components/ui/button-group.tsx`, `calendar.tsx`) — unrelated.
- Known pre-existing nit (not addressed here): duplicate waitlist email (409) surfaces the server's validation-style message rather than a dedicated "already on the list" notice.

---

## 2026-05-29

### Fixed admin draw list so hidden draws remain visible in admin while only disappearing from the public homepage

- **Why:** Clicking the eye ("Hide") icon on a draw in the `/admin` dashboard made the draw vanish from the admin list — and hiding draws could empty the list entirely ("No giveaways yet"). Root cause: the dashboard's eye button was wired to `handleToggleActive`, which called `deleteGiveaway` when a draw was active. The delete endpoint **hard-deletes** rows that have no entries, so "Hide" was permanently destroying draws.
- **Fix:** The eye icon now toggles `isPublic` only (public-website visibility) and never deletes. Added a separate power icon to toggle `isActive`. Both go through a non-destructive `toggleField` → `updateGiveaway` + `refetch` (with 401 re-login handling). Removed the destructive delete path from the dashboard — deletion/archiving still lives in `/admin/draws` behind an explicit confirmation. The status column now shows full badges (Active/Inactive, Public/Hidden, Paused, Ended).
- **Behaviour:** Admin always shows ALL draws via `GET /api/giveaways?all=true` (unchanged). Public homepage still shows only `isActive && isPublic && !entriesPaused && drawDate>=now` via `GET /api/giveaways` (unchanged). Server was already correct — no server/DB/schema/API-contract changes.
- **Files:** `artifacts/whiskey-giveaway/src/pages/AdminDashboard.tsx`.
- **Tested:** typecheck clean (pre-existing baseline errors in `components/ui/button-group.tsx` + `calendar.tsx` only); e2e — logged into admin, hid a public draw → stayed in admin as "Hidden", disappeared from homepage, restored to "Public" again.
- **Safety:** No payment/admin-auth/Stripe guards touched. Checkout remains gated/disabled.

---

## 2026-05-28

### Upgraded /giveaway/:id into premium collection landing pages

- **Why:** Draw detail pages looked like a bare entry form. Turn them into premium luxury product landing pages (à la Prize Guy) to build desire before the (still-disabled) checkout. Bushmills keeps its own bespoke `/experiences/bushmills` page — this is for the DB-driven collections (Clonakilty, Patrón, Macallan, and any future draw).
- **What:**
  - New `src/data/collectionContent.ts` — name-keyed **presentational** content layer (kicker, includedIntro, includedItems, story, highlights, faq) for Clonakilty/Patrón/Macallan + `getCollectionContent()` generic fallback. Shared `TRUST_HIGHLIGHTS` + `COMMON_FAQ`. Same pattern as bottle/hero-image data — content is presentational only; live draw stats still come from `GET /api/giveaways`.
  - New `src/components/giveaway/CollectionLanding.tsx` — reusable premium landing: cinematic hero (hero/bottle image + DB stats + countdown + capacity bar + "Preview Giveaway" / "Join Beta List" CTAs + beta helper text), What's Included (bottle grid when bottles exist, else descriptive item cards), Why This Collection Matters story, Collection Highlights trust cards, collection FAQ accordion.
  - `GiveawayDetail.tsx` restructured: step 1 now renders `<CollectionLanding>` + `<section id="enter">` (existing ticket selector, still beta-gated/checkout-disabled) + `<WaitlistSection>`. Steps 2–5 (entry flow) moved into a narrow container behind a "Back to Giveaway" button with the entry-flow progress bar. Removed now-unused `img`/`getGiveawayImage`.
- **Macallan** has no bottle array → renders item-card "What's Included" mode; Clonakilty/Patrón render the bottle grid.
- **Safety:** No payment changes — `VITE_PAYMENTS_ENABLED` gating intact, checkout stays disabled, beta notice unchanged. Verified via e2e: hero/CTAs/beta text render, "Preview Giveaway" scrolls to entry section, and **no enabled Pay button** exists.
- **Robustness (post-review):** `getGiveawayBottles(id, name?)` now resolves bottle imagery by stable giveaway **name** first (id is dev-only fallback), matching the hero-image pattern — collections no longer break if DB ids differ across environments. `genericContent()` always ships descriptive "What's Included" cards so a generic/future draw never renders an empty section. Step-1 entry preview now falls back to the hero image (then a Gift icon) when a collection has no individual bottle shots (e.g. Macallan), avoiding a blank panel.
- **Files:** `src/data/collectionContent.ts` (new), `src/components/giveaway/CollectionLanding.tsx` (new), `src/pages/GiveawayDetail.tsx` (edited), `src/data/giveaways.ts` (name-keyed bottle lookup).
- **Risk:** Presentational only; new draws without an entry in `collectionContent.ts` fall back to generic content via `getCollectionContent()`.

### Added lightweight analytics + admin conversion dashboard

- **Why:** Need visibility into pre-launch visitor behaviour and the waitlist funnel without bolting on a third-party analytics SDK. Helps decide which draws resonate before checkout opens.
- **What:**
  - New `analytics_events` table (id, eventType, eventName, drawSlug, pagePath, metadata, createdAt; 2 indexes). Drizzle schema + mirrored idempotent `ensureSchema.ts` block. Pushed via `pnpm --filter @workspace/db run push`.
  - Event types are enum-validated server-side: `page_view`, `hero_cta_click`, `draw_click`, `explore_collection_click`, `waitlist_started|completed|failed|duplicate`.
  - OpenAPI: `POST /analytics-events` (public, 204), `GET /analytics-events?limit=` (admin), `GET /analytics-summary` (admin). Hooks/Zod regenerated.
  - Server `routes/analytics.ts`: in-memory IP rate limit (60/min via `req.ip`), 400 on bad enum, public POST, admin GET list + aggregated summary (counts by type, top 4 draws, waitlist funnel + conversion rate, beta_signups count).
  - Frontend `lib/track.ts` fire-and-forget helper (auto-fills `pagePath`, never throws). Wired into Home: page_view on mount, hero CTAs, draw card "Preview Giveaway", "Explore Full Collection" expand, FAQ "Browse Active Draws". Wired into WaitlistSection: started/completed/duplicate(409)/failed.
  - New `/admin/analytics` page (`AdminAnalytics.tsx`) — stat cards, waitlist funnel, events-by-type, draw interest, recent events table. Nav button added to AdminDashboard.
- **Files:** `lib/db/src/schema/analyticsEvents.ts` (new), `lib/db/src/schema/index.ts`, `artifacts/api-server/src/lib/ensureSchema.ts`, `artifacts/api-server/src/routes/analytics.ts` (new), `artifacts/api-server/src/routes/index.ts`, `lib/api-spec/openapi.yaml`, generated `lib/api-client-react/*`, `lib/api-zod/*`, `artifacts/whiskey-giveaway/src/lib/track.ts` (new), `artifacts/whiskey-giveaway/src/pages/AdminAnalytics.tsx` (new), `artifacts/whiskey-giveaway/src/App.tsx`, `artifacts/whiskey-giveaway/src/pages/AdminDashboard.tsx`, `artifacts/whiskey-giveaway/src/pages/Home.tsx`, `artifacts/whiskey-giveaway/src/components/home/WaitlistSection.tsx`.
- **Risks / follow-ups:** Rate limiter is in-memory only — fine for a single Railway dyno; if we ever horizontally scale, swap for a shared store. No PII captured. No Stripe/PAYMENTS_ENABLED/ADMIN_PASSWORD changes. Pre-existing button-group/calendar shadcn typecheck baseline errors remain (not introduced here).

### Added beta email waitlist and admin signup management

- **Why:** Collect visitor interest while checkout stays disabled in beta. Lets us warm a launch list without touching Stripe / `PAYMENTS_ENABLED`.
- **DB:** New `beta_signups` table (`id`, `first_name` nullable, `email` not null, `created_at`). Email uniqueness enforced by `beta_signups_email_unique` index. Mirrored in `ensureSchema.ts` for Railway bootstrap. `pnpm --filter @workspace/db run push` applied locally.
- **API:** Three new endpoints under `betaSignups` tag:
  - `POST /api/beta-signups` — public, in-memory IP rate limit 5/min, Zod-validated, normalizes email to lowercase, idempotent on duplicate (409). Returns `{ ok, message, signup }`.
  - `GET /api/beta-signups` — `requireAdmin`.
  - `DELETE /api/beta-signups/:id` — `requireAdmin`.
- **Frontend:**
  - New homepage section `WaitlistSection` between How It Works and Active Draws — dark/gold premium styling, optional first name, required email, success/error/loading states inline, trust line "No spam · Early access only · Unsubscribe anytime".
  - New admin page `/admin/beta-signups` with stats (total + last 7 days), search, and per-row delete with confirm.
  - Admin dashboard: new `Beta Signups` stat card (5-col grid) + "Beta Signups" header button linking to the new page.
- **Files:** `lib/db/src/schema/betaSignups.ts` (new), `lib/db/src/schema/index.ts`, `artifacts/api-server/src/lib/ensureSchema.ts`, `lib/api-spec/openapi.yaml`, `artifacts/api-server/src/routes/betaSignups.ts` (new), `artifacts/api-server/src/routes/index.ts`, `artifacts/whiskey-giveaway/src/components/home/WaitlistSection.tsx` (new), `artifacts/whiskey-giveaway/src/pages/Home.tsx`, `artifacts/whiskey-giveaway/src/pages/AdminBetaSignups.tsx` (new), `artifacts/whiskey-giveaway/src/pages/AdminDashboard.tsx`, `artifacts/whiskey-giveaway/src/App.tsx`. Regenerated: `lib/api-client-react/src/generated`, `lib/api-zod/src/generated`.
- **Verified locally (curl via shared proxy):** `POST /api/beta-signups` valid → 201, duplicate (case-insensitive) → 409, invalid email → 400 "Please enter a valid email address.", unauth `GET /api/beta-signups` → 401.
- **Safety untouched:** zero Stripe / checkout / `PAYMENTS_ENABLED` interaction. Admin auth reuses existing `requireAdmin` (session OR `x-admin-token`).
- **Follow-up:** On Railway redeploy, `ensureSchema()` will create the table automatically — no manual migration step needed.

### Fixed admin all-draw loading and confirmed Macallan seeded draw visibility in admin

- **Symptom:** Live `/admin` showed `Active Draws: 0` and "No giveaways yet"; Macallan was invisible in admin even though it had seeded correctly. Public homepage continued to show the 3 eligible draws — so the DB was healthy, only the admin fetch was broken.
- **Root cause:** Yesterday's security fix for `GET /api/giveaways?all=true` only checked `req.session?.isAdmin === true`. But the admin UI doesn't use session cookies — it authenticates with the `x-admin-token` header (HMAC-signed token stored in `localStorage`, the same scheme the `requireAdmin` middleware accepts). So every admin call to `?all=true` was being 401'd, which TanStack Query swallowed → empty list → "No giveaways yet". Public `/api/giveaways` was unaffected (no auth check), which is why the homepage kept working.
- **Fix:** Extracted the dual-mode auth check from `requireAdmin` into a reusable `isAdminAuthed(req)` predicate (checks session OR validates the `x-admin-token` header). Replaced the session-only check in `GET /api/giveaways` with `isAdminAuthed(req)` so the admin UI's token-header requests pass while unauthenticated requests still return 401.
- **Files:** `artifacts/api-server/src/middleware/adminAuth.ts` (new export `isAdminAuthed`), `artifacts/api-server/src/routes/giveaways.ts` (use it for the `?all=true` gate).
- **Verified locally (curl):**
  - `GET /api/giveaways?all=true` with no auth → `401` ✅
  - `GET /api/giveaways?all=true` with admin token header → returns all **4** draws including `The Macallan Luxury Scotch Collection` ✅
  - `GET /api/giveaways` (no auth) → returns **3** eligible draws (Clonakilty, Patrón, Bushmills), no Macallan ✅
- **Macallan seed confirmation:** server boot logs show `Default giveaways already seeded — nothing to insert` once present; `Giveaway table summary { total: 4, active: 3, public: 3, paused: 1 }`. Seed is name-keyed idempotent — re-runs only insert missing rows, never modifies existing ones, so admin edits in production are preserved.
- **After deploy:** Railway boots with the existing schema (no migration needed). The same admin token mechanism is used in prod, so the fix lands as-is. Expected post-deploy state: `/admin` and `/admin/draws` show all 4 draws including Macallan (inactive + hidden + paused row with eligibility "No — not active, hidden, entries paused"); public homepage still shows only the 3 eligible draws.
- **Safety preserved:** `PAYMENTS_ENABLED`, `ADMIN_PASSWORD`, `requireAdmin` middleware, `sk_test_` guard — all untouched. No DB schema change. No new endpoints.

### Hardened `GET /api/giveaways?all=true` with admin auth (security fix)

- **What:** Added a session-based admin check at the top of `GET /api/giveaways` so the `?all=true` branch (which returns inactive/hidden/paused/ended draws) now returns `401 Unauthorized` for any caller without an admin session. Verified: `curl /api/giveaways?all=true` without admin login returns 401; admin UI still works because it sends the session cookie.
- **Why:** `PROJECT_CONTEXT.md` and `SYSTEM_RULES.md` both documented this endpoint as admin-only, but the implementation didn't enforce it. That meant anyone could enumerate hidden draws (including the newly seeded Macallan Collection, which is intentionally inactive+hidden+paused until admin enables it). Code review (architect) flagged this directly as breaking the "hidden until admin enables" guarantee.
- **Files:** `artifacts/api-server/src/routes/giveaways.ts` (one inline auth gate at the top of `GET /giveaways`).
- **Behavior unchanged for:** public `/api/giveaways` (still returns only eligible draws), admin UI (`/admin`, `/admin/draws`) which calls with admin cookie, all write endpoints (already had `requireAdmin`).

### Added Macallan Luxury Scotch Collection draw with premium hero artwork and admin support

- **What:** New seeded draw `The Macallan Luxury Scotch Collection` — £9.99 per ticket, prize value "Worth Over £2,500", 6 premium Macallan bottles (12 Double Cask, 12 Sherry Oak, 15 Double Cask, 18 Sherry Oak, Rare Cask, Harmony Collection), capacity 351 (`ceil(2500 × 1.4 / 9.99)`), draw date 2026-10-15.
- **Why:** Premium luxury Scotch tier to complement Patrón/Clonakilty/Bushmills, with promotional artwork already commissioned. Kept hidden/paused by default so it only goes public when admin enables it.
- **Default state (per spec):** `isActive=false`, `isPublic=false`, `entriesPaused=true`. Admin enables via `/admin/draws` (toggles active → public → unpause). All four public-visibility conditions must hold before it appears on the homepage.
- **Hero artwork:** Saved to `artifacts/whiskey-giveaway/src/assets/images/hero-macallan.png` and registered in `BUNDLED_IMAGE_BY_NAME` (`getGiveawayImage` fallback by exact name — admin custom URL still wins). Active Draw card uses the full poster via `getCollectionHero('macallan')` with `object-contain` on black bg — same treatment as Patrón/Clonakilty/Bushmills. No bottle thumbnail grid (poster already lists all 6).
- **Files:** `artifacts/api-server/src/index.ts` (seed), `artifacts/whiskey-giveaway/src/data/giveaways.ts` (image fallback), `artifacts/whiskey-giveaway/src/pages/Home.tsx` (`getCollectionHero` mapping).
- **DB / schema:** no schema change required — uses existing `giveaways` columns. Seed is idempotent + name-keyed, so Railway self-seeds on next boot (logs will show `insertedCount: 1, insertedNames: ["The Macallan Luxury Scotch Collection"]`). Admin edits in production are preserved.
- **Safety preserved:** beta status unchanged, `PAYMENTS_ENABLED` untouched, `ADMIN_PASSWORD` untouched, `requireAdmin` middleware unchanged, no API/route surface changes. Step-4 checkout gate still applies.
- **Verified in Replit:** API logs show `Default giveaways seeded on startup insertedCount: 1` and `Giveaway table summary total: 4, active: 3, public: 3, paused: 1` — Macallan is the paused/inactive/hidden one, invisible on the public homepage, visible in `/admin` and `/admin/draws` with the eligibility row explaining why.

### Rebuilt homepage hero slideshow using premium collection artwork and simplified hero conversion layout

- **What:** Replaced the old featured-draw hero (grid layout with `BottleSpotlight`/`RotatingTagline`, live-draw badges, progress bar, countdown, prize-value block, "Preview Giveaway" CTA, `LiveActivityTicker`, "View All Draws" ghost button) with a clean cinematic slideshow that cycles the three premium collection posters (Patrón, Clonakilty, Bushmills).
- **Why:** New promotional artwork already carries the headline, value, and "Enter Now" CTA — stacking heavy raffle UI on top was busy and competed with the embedded poster text. Active Draws (below the hero) already own countdowns, capacity bars, bottle lists, and per-draw CTAs.
- **Hero overlay (simplified, above the slideshow):** small "Featured Collections" label, headline "Win Premium Spirits & Luxury Experiences", short supporting copy, two CTAs (View Active Draws / How It Works), and the UK-based • Transparent winners • Premium verified prizes trust strip. Nothing overlaid on the artwork itself except the prev/next arrows.
- **Image fitting:** `aspect-[3/2] sm:aspect-[16/9]` wrapper with black background + `object-contain object-center` — no cropping of poster text on any device. Crossfade transition (`AnimatePresence` opacity + subtle scale), gentle 7s auto-advance, arrows + dots for manual nav.
- **State cleanup:** removed `featuredIndex`/`featuredGiveaways`/`isPatronFeatured`/`isClonakiltyFeatured`/`hasSpotlight`/`spotlight*`/`accent*`/`remainingTickets`/`isUrgent` from `Home()`; replaced with `slideIndex` + `heroSlides` (static premium artwork array). Active Draws section remains fully DB-driven via `useListGiveaways`. Helper components `BottleSpotlight`, `RotatingTagline`, `LiveActivityTicker`, `CinematicBackdrop` are now unused but left in the file to keep this diff surgical.
- **Files:** `artifacts/whiskey-giveaway/src/pages/Home.tsx` (hero section + state).
- **Safety preserved:** PrizePour beta status unchanged, no `PAYMENTS_ENABLED` touched, `ADMIN_PASSWORD` untouched, no DB/API/route changes, admin still protected, Active Draw visibility rules untouched.
- **Test before push:** preview the homepage desktop + mobile, confirm slideshow rotates across all three posters with no text cropping, confirm the two CTAs scroll to `#giveaways` and `#how-it-works`, confirm Active Draws cards below still render correctly.

### Bushmills hero artwork added

- Added Bushmills Distillery Tour Experience promotional artwork ("THE WORLD'S OLDEST LICENSED WHISKEY DISTILLERY • 1608 — Worth Over £2,500") to the name-keyed `getCollectionHero` mapping in `Home.tsx`. The Bushmills Active Draw card now shows the full premium artwork instead of falling back to the bottle strip.
- **Files:** `artifacts/whiskey-giveaway/src/pages/Home.tsx` (one import + one mapping line).
- **Preserved:** same `object-contain` fit + black letterbox as Patrón/Clonakilty so the full image is visible. No DB, admin, or payment changes.

### Active Draw hero artwork → fit full image without cropping

- **Problem:** previous hero used `aspect-[16/9] sm:aspect-[21/9] object-cover`, which cropped the top headline ("THE PATRÓN COLLECTION" / "THE CLONAKILTY COLLECTION") and the bottom "Enter Now" caption from each promo image.
- **Fix:** hero wrapper changed to `aspect-[3/2] sm:aspect-[16/10] flex items-center justify-center bg-black`; image swapped from `object-cover` → `object-contain object-center`. Full artwork is now visible — no cropped text — with a premium black background filling any small letterboxing.
- **Files:** `artifacts/whiskey-giveaway/src/pages/Home.tsx` (one className edit).
- **Preserved:** name-keyed hero mapping, bottle-strip fallback for draws without a hero, `BottleList` "Explore Full Collection" in details panel, DB-driven data, admin controls, beta safety.

### Active Draw cards → premium collection hero artwork

- **Change:** replaced the bottle gallery strip at the top of each Active Draw card with a single premium hero image per collection. Patrón card now shows "The PATRÓN Collection — 15 iconic expressions, worth over £1,950" artwork; Clonakilty card shows "The CLONAKILTY Collection — Premium Irish Whiskeys, worth over £500" artwork.
- **Implementation:** new name-keyed mapping `getCollectionHero(name)` in `Home.tsx` returns the matching imported asset (Patrón → patron hero, Clonakilty → clonakilty hero). If a draw has no matching hero, the card transparently falls back to the existing capped bottle strip — so any future DB-driven draw works without code changes.
- **Layout:** hero uses `aspect-[16/9] sm:aspect-[21/9] object-cover` — cinematic on desktop, scales cleanly on mobile, no empty box, fills the card image area edge-to-edge. `onError` hides broken images gracefully.
- **Bottle data preserved:** `BottleList` with "Explore Full Collection" toggle still renders in the details panel below — every bottle name remains visible/explorable. `getGiveawayBottles()` and the underlying data are untouched, so detail pages and the live draw page still show all bottles. DB draw data, public visibility filter, and admin controls all untouched.
- **Files:** `artifacts/whiskey-giveaway/src/pages/Home.tsx` (two imports + one helper + one render branch in the Active Draws card).
- **Assets:** imported via Vite's `@assets` alias (`attached_assets/ChatGPT_Image_May_28,_2026,_10_09_40_PM_*.png` for Patrón, `*_10_04_51_PM_*.png` for Clonakilty) — Vite hashes them into the production bundle.
- **Beta-safe:** no payment, admin, or server changes. Checkout still disabled.

### Active Draw cards → stacked premium layout

- **Decision:** abandoned the side-by-side 50/50 layout for Active Draw cards. Even with `items-start`, splitting the card into gallery-column + details-column meant the gallery either stretched (blank box) or sat awkwardly half-height next to a much taller details column. A stacked layout cleanly eliminates the problem.
- **New structure:** card is now `flex flex-col` — top is a fixed-height bottle strip (`h-44 sm:h-52 lg:h-60`), bottom is the full-width details panel (Prize Selection label, title, value, description, BottleList with Explore Full Collection, progress, countdown, CTA, trust line).
- **Gallery strip:** single horizontal row, capped at 6 bottles on desktop / 4 on mobile so bottles never become tiny. If a draw has more bottles than the cap, a "+N more" tile is appended; the full collection remains accessible via the existing `BottleList` "Explore Full Collection" toggle in the details panel below.
- **Why this is better:** card height is now driven entirely by content, no stretching tricks. Gallery is intentionally compact (~176–240px tall) so it never dwarfs the details. Details get the full card width, giving the description, bottle list, and CTA proper breathing room.
- **Files:** `artifacts/whiskey-giveaway/src/pages/Home.tsx` — Active Draws card section rewritten (one block, ~50 lines).
- **Preserved:** all DB-driven draw data, public visibility filter (`isActive ∧ isPublic ∧ !entriesPaused ∧ drawDate ≥ now`), admin visibility controls, `BottleList` + Explore Full Collection toggle, Bushmills `/experiences/bushmills` routing, "Preview Giveaway" CTA, trust line, luxury dark/gold styling. Checkout still disabled.

### Fix Active Draw card gallery column stretching (superseded by stacked layout)

- **Root cause (final):** previous attempt only centred the bottles inside a still-stretched left column — the blank space remained, just split above/below. CSS Grid items default to `align-items: stretch`, so the left gallery column was being forced to match the right details column's height.
- **Fix:** changed the card grid from default stretch to `lg:items-start`, and added `lg:self-start lg:w-full` to the desktop bottle wrapper. Now the gallery column takes only the height it needs and sits at the top; the right details column drives the card height; the outer `bg-card` background fills the area beside/below the gallery seamlessly. No tall empty box remains.
- Right info column padding kept at `sm:p-7 lg:p-8` and inner gap at `gap-5 sm:gap-6` from the previous pass — those tightening changes are good.
- **Files:** `artifacts/whiskey-giveaway/src/pages/Home.tsx` — two small className edits.
- **Risks:** pure CSS — no logic, DB, admin, or payment changes. Mobile (`<sm`) untouched. Bottle data, "Explore Full Collection", public visibility filter, and admin controls all preserved.

### Fix Active Draw card empty spacing (superseded by the entry above)

- **Root cause:** the Active Draws card uses `grid lg:grid-cols-2`. The right (info) column is naturally tall (description + bottle list + progress + countdown + CTA + trust line), so the grid stretches both columns to match. The left column's bottle rows have a fixed `aspect-[3/4]`, so they can't grow — they sat at the top of the stretched cell, leaving a large blank box below the bottles on desktop.
- **Fix attempted (insufficient):** added `lg:h-full lg:justify-center` to centre the rows. This only redistributed the blank space — it did not remove it. Superseded by the entry above.
- Right info column padding tightened from `sm:p-8 lg:p-10` → `sm:p-7 lg:p-8` and inner gap from `gap-6 sm:gap-8` → `gap-5 sm:gap-6` (kept — useful tightening).
- **Files:** `artifacts/whiskey-giveaway/src/pages/Home.tsx`.

### Homepage trust & conversion improvements

- **Hero (Stage 1):** new headline "Win Rare Spirits & Luxury Distillery Experiences", premium subhead, trust line ("UK-based • Transparent winners • Premium verified prizes"), and two CTAs ("View Active Draws" → scrolls to `#giveaways`, "How It Works" → scrolls to new `#how-it-works`).
- **How It Works (Stage 2 — NEW section):** 3-card section between the featured carousel and Active Draws — Choose a Collection / Secure Your Entry / Winner Announced. Card #2 carries the beta-safe wording: "PrizePour is currently in beta. Entry checkout is disabled while we finalise the platform."
- **Featured carousel (Stage 3):** CTA renamed "View Draw — Preview Entry" → "Preview Giveaway"; added trust line "Secure • Transparent • Beta Preview" beneath it; live activity ticker messages rewritten to reflect transparent winners + beta tone (no fake live-sales counts).
- **Active Draws cards (Stage 4):** CTA renamed to "Preview Giveaway"; long descriptions clamped to 3 lines via `line-clamp-3` (DB data untouched); same beta-safe trust line under each CTA. Bushmills card now routes to `/experiences/bushmills` like the featured carousel.
- **Patrón bottle list (Stage 5):** `BottleList` collapsed default reduced from 6 → 4 bottles; toggle text changed from "Show all 15 bottles (+9)" to "Explore Full Collection — +11 more included". Full list still accessible.
- **Bushmills (Stage 6):** no change needed — bundled fallback (`bushmills-hero.png` via `getGiveawayImage(id, imageUrl, name)`) already shipped earlier this date; verified path still resolves.
- **Why Us (Stage 7):** headline changed from "The collector's edge you've been looking for." to "Transparent Draws. Premium Prizes. No Shortcuts."
- **FAQ (Stage 8):** added 2 new FAQs at the top — "Why is PrizePour currently in beta?" and "How are winners announced?"; converted from static cards to a shadcn `Accordion` (collapsible, one open at a time) for cleaner reading and mobile layout.
- **Footer (Stage 9):** added location/trust line "UK / Northern Ireland based premium spirit giveaway platform." beside the existing beta notice. All previously-required links (Active Draws, Past Winners, How It Works, How Winners Are Selected, FAQ, Contact Us, Terms of Service, Privacy Policy, Contest Rules, Responsible Drinking / 18+) were already present and route to existing pages.
- **Why:** improve clarity, conversion, and trust signals while staying explicitly beta-safe — no implication of live paid checkout anywhere.
- **Files:** `artifacts/whiskey-giveaway/src/pages/Home.tsx`, `artifacts/whiskey-giveaway/src/components/layout/Footer.tsx`.
- **Safety verified:** checkout remains disabled (no `PAYMENTS_ENABLED` change); admin routes still behind `requireAdmin`; public visibility rules untouched (still `isActive AND isPublic AND !entriesPaused AND drawDate >= now`); draw data still 100% DB-driven via `useListGiveaways`; luxury dark/gold theme preserved.
- **Risks:** none functional. Typecheck errors that exist in `src/components/ui/button-group.tsx` and `src/components/ui/calendar.tsx` are **pre-existing shadcn-component issues**, untouched by this work.

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
