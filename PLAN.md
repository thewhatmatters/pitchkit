# Pitchkit MVP plan

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Product lives on **pitchkit.app**. Columns: [DATA.md](./DATA.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md). Stats vocabulary: [GLOSSARY.md](./GLOSSARY.md).

**Look:** WMDS (`@whatmatters/wmds`). Name on the site is Pitchkit.

---

## Stack (locked)

| Piece | Choice |
|---|---|
| App | Next.js App Router + TypeScript + Tailwind v4 |
| UI | **WMDS** (`@whatmatters/wmds`) — pattern-first. Import components and `@whatmatters/wmds/styles.css`. Layout (`grid`, `gap`, `max-w`) stays in the app. No shadcn. No ad-hoc `rounded-full bg-*` buttons. |
| Icons | Lucide via WMDS props |
| Motion | `motion` peer when a WMDS component needs it |
| Install | Pin GitHub `github:thewhatmatters/wmds#<sha>` (CI cannot use `../wmds`). Local path still works. `prepare` builds `dist/`. Current pin: `368560cd22bee2c5320b0b0e8038c30affa4bdea` (empty title↔subtext `gap-2`; Card.Header `end` trailing). How to consume: WMDS `CONSUMING.md`, Examples/PitchKit → Pattern — creator Insights (`examples-pitchkit--creator-insights`), Pattern — creator Insights (loading) (`examples-pitchkit--creator-insights-loading`), State — insufficient reach data (`examples-pitchkit--insufficient-reach-data`), State — insufficient audience data (`examples-pitchkit--insufficient-audience-data`), State — insufficient reach and audience data (`examples-pitchkit--insufficient-reach-and-audience-data`), State — Graph data unavailable (`examples-pitchkit--graph-data-unavailable`), Pattern — shareable PitchKit (`examples-pitchkit--shareable-pitchkit`), Pattern — owner PitchKit (`examples-pitchkit--owner-pitch-kit`), Pattern — creator identity (public) (`examples-pitchkit--creator-identity-public`), Pattern — creator identity (owner settings) (`examples-pitchkit--creator-identity-owner-settings`), State — creator identity loading / missing photo / missing name (`examples-pitchkit--creator-identity-loading`, `…-missing-photo`, `…-missing-name`), and Components/Data display/Chart → Pattern — Cartesian no-data gaps (`components-data-display-chart--cartesian-no-data-gaps`) Show code. After login: copy that shell — `<main className="grid-page min-h-screen bg-body [--grid-column-gap:8px] [--grid-max:1140px] [padding-bottom:44px]">`, header `band pb-4` with three-column brand + default hug `SegmentedControl` + `Avatar`, body `band pt-6 sm:pt-8` / inner `band min-w-0 gap-y-6 sm:gap-y-8`. PitchKit segment is Pattern — owner PitchKit (`examples-pitchkit--owner-pitch-kit`; Coming soon retired; no hard `/insights` ↔ `/k/…` nav, no `KitEdit`). Owner selected-post **MoreMenu** lives in `Card.Header` `end` — WMDS `end` is always trailing (`ml-auto`) even when `start` is omitted. Public `/k/[handle]` nameplate copies creator identity (public). Settings copies creator identity (owner settings) — Connected Instagram + Share kit `/k/[handle]` + Copy + connected / last sync. No `layout="stretch"`, no `w-full` on the control, no AppFrame `min-h-dvh py-6` replacement surface on Insights, the public kit, or Settings. Landing / legal keep `AppFrame` `OWNER_GRID_CLASS` with Tailwind `[--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]` — not React `style`. `npm test` fail-closes Pattern shell + owner gap tokens, identity nameplate / Settings card, `hidden_from_kit_at == null` **"N shown"** / rank partition, and Hide-from-kit `AlertDialog` dialog semantics. `GridOverlay` and `ExampleGridControls` stay Storybook-only — not product chrome. One `<Toaster position="bottom-right" />` at `app/layout.tsx`. Band children are grid items (`col-span-*`). Insights four-up: `Stat` `col-span-2 md:col-span-4 lg:col-span-3` — not nested `Stat.Group`. Proof ranking is `Tab.Group`. Hide-from-kit uses `MoreMenu` + `AlertDialog` + `toast.add()` Undo through `hideFromKit` / `restoreToKit`. Product toasts pass **title + description** (Share kit, hide, restore, hide/restore errors) — no title-only product toasts. Owner Recent proof partitions `hidden_from_kit_at` on init and when `posts` change — **"N shown"** and rank use `null` only; hidden rows stay with muted Badge + **Restore to kit**. No AppShell / NavRail / owner rail. Do not invent a Pitchkit Grid atom. |
| Compute | Cloudflare Workers via **OpenNext** (official adapter only). Workers Builds non-prod deploy is `npx wrangler versions upload`; `wrangler.jsonc` `build.command` is `npx opennextjs-cloudflare build` so `.open-next/worker.js` exists before upload. |
| DB | Supabase Postgres via Hyperdrive (`HYPERDRIVE` / `HYPERDRIVE_PREVIEW`). Workers use postgres.js on `env.HYPERDRIVE.connectionString` — not `@supabase/supabase-js` and not a serverless driver. Hyperdrive origin is the **direct** DB URI (port 5432), not the transaction pooler (6543). |
| Files | R2 `pitchkit-media` |
| Auth | Instagram Login + Pitchkit httpOnly cookie |
| Charts | WMDS `Chart` only (`@visx/visx` peer). No Nivo in Pitchkit `package.json`. |

**Not used:** D1, Vercel, shadcn, Browser Run, Queues, Workers AI.

**Storybook** lives in the WMDS repo. Copy patterns from there; do not add Storybook to Pitchkit.

---

## Identity and URLs (locked)

**Kit URL:** `pitchkit.app/k/[handle]` — not `pitchkit.app/[handle]`. Root stays landing, Insights, privacy, delete. `/k/` never collides with those.

**Handle** is frozen at first successful connect **by default** (Instagram username; keep `.` and `_`, do not hyphenate periods; `-2` if taken). If they rename on Instagram, **our URL does not change** unless they opt in on reconnect. Default = keep the existing URL. **No redirect** from the old path. Unknown or disconnected handle → **404**.

**Optional kit URL update (WHA-313):** on reconnect, if Instagram returns a username different from `users.handle`, offer **Update kit URL to @{new}** with a clear warning that old `/k/…` links will 404 / stop working. Collision if taken: `-2` suffix. Stub Connect does not surface this yet — no live OAuth UI.

**Public from first successful connect.** No publish switch. Ingest builds the kit; `/k/[handle]` is live as soon as the `users` row exists.

**Session:** Instagram proves who they are. Pitchkit still sets an **httpOnly cookie** for Insights, disconnect, and refresh. The cookie is our login, not the Instagram token. Continue GET/POST `/auth/instagram` starts Instagram Business Login when `IG_APP_ID` + `IG_APP_SECRET` are set (redirect URI default `https://pitchkit.app/auth/instagram`, exact dashboard match including trailing slash). Secrets missing → stub session for seed handle `demo`. When live secrets exist, `resolveSession` does **not** treat leftover seed `demo` as signed-in (`/` shows Continue with Instagram; `/insights` goes home). Public `/k/demo` stays. If `resolveSession` succeeds (stub seed, SQL user, or Graph KV snapshot), `GET /` redirects to `/insights` — do not show Continue with Instagram to an already-authenticated owner. Signed-out visitors still get disclosure / Professional / personal-fail / persist-fail. Failed live OAuth finish clears `pitchkit_session` (so a leftover `demo` cannot strand reconnect). `writeGraphSnapshot` tries SQL when available, then KV `graph:` — never refuse KV solely because Hyperdrive is bound. If both writes fail, do not set the session cookie — redirect `/?error=persist`. **Sign out** (`/auth/sign-out`) clears `pitchkit_session` + `pitchkit_hidden` only; the public kit stays up. **Disconnect** (`POST /auth/disconnect`) clears those cookies, stamps `disconnected_at` and nulls token fields (SQL when Hyperdrive is bound; else KV `graph:`), and 404s `/k/[handle]`. `/insights` without the cookie goes `/`. `/k/[handle]` does not need it. Personal Graph account → `/?error=personal`.

Owner home: `/insights`. Pattern header (hug SegmentedControl) toggles Insights vs Pattern — owner PitchKit (Coming soon retired). Brands only get `/k/[handle]` (shareable Pattern freeze; no owner nav). Edit on the owner tab is hide/restore posts only.

Seed: `/k/demo`.

---

## What we offer (v1)

| Who | What |
|---|---|
| Creator | Continue with Instagram (Professional). Land on Insights. Share the kit URL. Reconnect, sign out, disconnect. Phone works. |
| Brand | Open the kit. No account. |

No extra onboarding. No PDF in v1. No TikTok in v1. No bio, website, rates, “contact for collab,” or geo on the **public kit**. `/insights` is the owner Graph layout (WMDS Pattern — creator Insights Show code shell + `PageHeader`, four-up Stat, `Chart.Cartesian` + `Chart.RankedBars`, Recent proof). Primary nav is the Pattern three-column header (PitchKit label + hug `SegmentedControl` Insights / PitchKit + Avatar) — no AppShell and no duplicate tabs on the page. Account is a quiet footer link. Mixes as `Chart.RankedBars`, not a map. Hide/restore posts through `hideFromKit(mediaId)` → `POST /api/media/hide` and `restoreToKit(mediaId)` → `POST /api/media/restore` (WHA-312). Success `{ mediaId, hiddenFromKitAt }`. Schema `media.hidden_from_kit_at`. Public kit filters before `selectSixPosts`; owner Insights keeps the row. FE partitions `hidden_from_kit_at` so Insights reload **"N shown"** excludes hidden (Restore chrome stays). Seed SoT is KV `HIDDEN_KIT` (`hidden:<userId>`) until Hyperdrive; when Hyperdrive is bound, SQL `media.hidden_from_kit_at` is SoT. httpOnly `pitchkit_hidden` is the owner reload mirror. No localStorage. No new Postgres columns for identity typed holes.

---

## Kit math (locked)

**Six posts / Recent proof:** among posts we fetched with `posted_at` in the **last 30 days**, rank **saves, then reach, then likes** (missing Insights sort last). Fill from older fetched posts only if we do not have six in-window. Insights UI label is **Recent proof**, with `Tab.Group` display sort (Reach / Engagement / Saves). Kit math stays the locked rank. Owner MoreMenu can hide a post from the kit (`AlertDialog` confirm + toast Undo with title + description). Restore to kit uses the same toast pattern.

**Engagement rate:** `(likes + comments + saves + shares) / reach` on those six (unlocked 2026-09-18). Account rate is **sum(interactions) ÷ sum(reach)** on posts with Insights `reach` > 0 — not an average of per-post rates. Hide (or show —) when reach is missing, null, or 0. **Do not** fall back to ÷ followers. Same formula on the public kit and Insights. If Insights are missing, hide Engagement rate, reach, and saves, and omit the optional chart (graph-unavailable). Saves/shares are media insights `saved` / `shares` (Instagram Login), not Facebook-only `saved_count` / `shares_count`. Spell **Engagement rate** (never “ER”).

**Chart series:** Insights kit payload exposes one `reach_series` (`{ day, reach }`, `day` = YYYY-MM-DD UTC). Account reach day buckets (stories + ads). When Insights exist but the series is missing, too thin, or all-zero, keep the Reach Card and paint State — insufficient reach data (`No reach data yet` / `Connect more Instagram activity to plot the last 30 days.`) — centered empty well (muted **Badge** “No data” → title → body, title↔subtext `gap-2` / ~0.5rem, same centered Badge stack), do not hide the band, do not use Skeleton / `Chart.Loading`, and do not invent 30 zeros. Partial calendar holes in a plottable window use Chart.Cartesian `noData` hatch (`null` / omitted days; `0` is plotted) — keep the Show-code `noData` label, wire it type-safely onto `Chart.Cartesian` so deploy typecheck does not require cached `ChartCartesianProps` to declare `noData`, do not invent hatch UI, and do not hatch the full-card empty or loading wells. Graph-unavailable (`!hasInsights`) still **omits** the optional Reach region. `/insights` reads `owner.reach_series` only. Pattern ReachCard: `Chart.Cartesian` at `minHeight` 344 with daily reach plus a constant Typical reach reference from the existing `typicalReach` median (not a second Graph time series), `Chart.Legend`, `animate="none"`. Header: **Reach over 30 days**. First Graph connect / `?grid=pulling` copies Pattern — creator Insights (loading) (Stat `loading` + Skeleton Reach/Audience wells + six proof placeholders). Retrieving after chrome is up / Refresh is Header + `Chart.Loading` (`?grid=retrieving`). No Stat `trend` deltas. Audience uses `Chart.RankedBars` from live `follower_demographics`. Empty mixes (0 rows / &lt;100 followers / omitted) keep the Audience Card with State — insufficient audience data (`No audience data yet` / `Connect Instagram Insights demographics when available.`) — centered empty well (muted **Badge** “No data” → title → body, title↔subtext `gap-2` / ~0.5rem), do not omit the Card, do not use Skeleton / `Chart.Loading` for that empty, and never EXAMPLE percents or `audience ?? SEED_AUDIENCE`. When both Graph series are unusable, keep both Cards (`examples-pitchkit--insufficient-reach-and-audience-data`). Honest `0` only when Graph returned a zero count. Owner demo seed (no token) includes ~30 labeled example reach points; audience stays empty (insufficient well, not EXAMPLE mixes). Public `/k/demo` omits Insights. Live token → Graph poll on Insights load when `fetched_at` / `polled_at` is older than 6 hours, or Refresh.

**Carousel:** first child frame (cover) into R2. **Video:** poster only on the kit, never the file.

---

## Meta review (screenshots + copy)

**Scopes (Instagram Login):** public media + Insights only — `instagram_business_basic` and `instagram_business_manage_insights`. Nothing else.

**Before the button** (`disclosure_version` = 1):

> We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

Short: *Public posts and Insights only. No DMs. No following list. Disconnect deletes everything we stored.*

**Privacy:** `https://pitchkit.app/privacy`  
**Delete-all:** `https://pitchkit.app/delete` — same as Disconnect: Postgres `users` + `media` + R2 `{user_id}/` (see Storage).

**Professional only.** Business **or** Creator. Personal accounts cannot power Insights. If Graph says personal / login fails for that reason, land `/?error=personal` and show:

> Pitchkit works with Instagram Professional accounts (Business or Creator). In Instagram, switch to Professional, then try again.

**Stub vs live OAuth:** same `users` / `media` schema. Stub fills the same columns. Secrets missing → stub + seed `demo`. Testers with `IG_APP_ID` / `IG_APP_SECRET` use Instagram Business Login. A leftover stub `pitchkit_session=demo` is not a live owner session — `resolveSession` returns null so they hit Continue with Instagram. Persist tries SQL then KV `graph:` after Graph; false (and `/?error=persist`) only if both writes fail. Optional operator `IG_USER_TOKEN` polls Graph for live users without an encrypted token. Never resolve or use it for seed `DEMO_HANDLE` / the demo user — owner demo stays the in-repo seed (handle stays `demo`) on the stub path only. Public `/k/demo` stays seed. Do not fork the data model.

Screencast to capture: disclosure on connect → Instagram permissions → Insights inventory → copy link → public `/k/[handle]`.

---

## Storage and delete (locked)

**R2:** kit images are **publicly readable** (these posts are already public). Not expiring signed URLs — those break the kit and messages. SQL stores keys only.

**Disconnect / delete-all:** start immediately; finish **within 24 hours**. Delete `users`, `media`, and `r2://…/{user_id}/`. Kit URL 404s. `weekly_counts` stay only if they cannot identify a person.

**`consent_index`:** bool, **default off**. Opt-in to anonymized rollups, not the connect-screen disclosure.

A rollup **may** contain: a time bucket, a metric name, a hashed or global cohort, an integer. **Must not** contain `user_id`, `ig_user_id`, handle, name, tokens, captions, or permalinks.

**`TOKEN_KEY`:** Workers secret. Encrypt tokens at rest. Rotate by re-encrypting. **Never in git.**

---

## Graph and tokens (locked)

**API version:** pin in config (`GRAPH_API_VERSION`, start at `v25.0`). Bump on purpose; do not float “latest.”

**New posts:** **poll**, not webhooks. On Insights load, if `fetched_at` older than 6 hours (or they tap Refresh), pull one media page + Insights.

**Instagram deleted a post:** on that poll, drop our `media` row and its R2 object.

**Token revoked or refresh fails:** public kit **stays** on last Postgres/R2. Owner sees **Reconnect Instagram**. Cookie still needed to reconnect. Reconnect may offer WHA-313 if the Instagram username differs from `users.handle`.

---

## Ops (day one)

| Thing | v1 |
|---|---|
| Supabase | One project. **Region:** choose when we create the database. Point Hyperdrive at the **direct** Postgres URI (port 5432). Do not use the transaction pooler (6543) — Hyperdrive already pools. |
| Hyperdrive | Prod binding `HYPERDRIVE`. Preview binding `HYPERDRIVE_PREVIEW`. Both bind Hyperdrive config `pitchkit` (`bf225442516d44f599e083b72df886cd`) in `wrangler.jsonc` — same id for preview MVP. Apply `db/*.sql` with `npm run db:apply`. OpenNext typecheck: postgres.js `sql.unsafe` rows assert through `unknown` onto `SqlQueryRow` (`asQueryRows` in `lib/postgres.ts`) — do not `as T[]`. |
| R2 | Bucket `pitchkit-media`; public read for kit objects |
| Cloudflare | **randy@whatmatters.so**. Domain `pitchkit.app` on the Worker. |
| Secrets | `IG_APP_ID`, `IG_APP_SECRET`, `TOKEN_KEY`, Hyperdrive. Never commit values |
| Support | **randy@whatmatters.so** on the connect page and the public kit (footer), until we change it. Not a Postgres column. |

No D1. No Vercel. No Browser Run. No shadcn. No Storybook in this repo.

---

## Auth and first-run

```text
Landing (disclosure + Professional note + support)
  → Continue with Instagram (stub or live)
  → upsert users by ig_user_id
  → httpOnly session cookie
  → one page of media + R2
  → kit is public at /k/[handle]
  → redirect /insights
```

---

## Product surface

| Route | Who | What |
|---|---|---|
| `/` | anyone | Signed-out: pitch, disclosure, Professional note, Continue with Instagram, quiet demo-session line under the button, support. Do not lead with stub-token / “no Instagram token” language. `/?error=personal` and `/?error=persist` stay on this chrome. Resolvable session (`resolveSession`) redirects to `/insights` — same landing chrome, no second signed-in home. Live secrets + leftover seed `demo` cookie is not resolvable. |
| `/insights` | owner cookie | Graph-only Insights matching WMDS Pattern — creator Insights Show code shell (hug `SegmentedControl` in a three-column PitchKit / control / Avatar header) plus `PageHeader`, four-up `Stat` (`col-span-2 md:col-span-4 lg:col-span-3`), outlined `Chart.Cartesian` + `Chart.RankedBars`, **Recent proof** with `Tab.Group`. Spell **Engagement rate** (never “ER”). Formula lives on the Engagement rate Stat info `Tooltip` (`ENGAGEMENT_FORMULA`), not a PageHeader headline. No invented period-over-period trends. Insufficient `reach_series` (missing / thin / all-zero with Insights) keeps the Reach Card empty band. Graph-unavailable omits the optional Reach region. First-connect loading is the skeleton Pattern; Refresh retrieving is Header + `Chart.Loading`. Empty audience mixes keep the Audience Card insufficient well (`No audience data yet` / `Connect Instagram Insights demographics when available.`) — never EXAMPLE percents. Both empties can show at once when both Graph series are insufficient. `MoreMenu` + `AlertDialog` “Hide from kit” + `toast.add()` Undo via `hideFromKit` / `restoreToKit`. Restore and Share kit also `toast.add()` with title + description. Owner proof partitions `hidden_from_kit_at` (`"N shown"` + rank = visible only; Hidden + Restore survive reload). PitchKit segment is Pattern — owner PitchKit (`examples-pitchkit--owner-pitch-kit`: shareable sections + hide/restore + Share kit; Coming soon retired). Insights PageHeader keeps Share kit because that Pattern still shows it. No contact/past-brands editors. Reconnect / sign out / disconnect stay as buttons. Account is a quiet footer link. One root `Toaster`. No title-only product toasts. |
| `/k/[handle]` | public | Pattern — shareable PitchKit Show code + Pattern — creator identity (public) nameplate + support footer. PitchKit wordmark only. Identity strip: Avatar, display name (hide if missing), `@handle`, followers as context, optional Professional chip. No owner nav, Edit, MoreMenu, hide, or Coming soon. Share link stays view even with an owner cookie. Hidden posts stay off this card. Owner PitchKit segment on `/insights` is Pattern — owner PitchKit (hide/restore posts; Coming soon retired), not this public URL. |
| `/settings` | owner cookie | Pattern — creator identity (owner settings): Connected Instagram strip + Share kit `/k/[handle]` + Copy + Connected / last sync. Reconnect / sign out / disconnect stay account-only. Disconnect is `POST /auth/disconnect` (WMDS `AlertDialog` confirm). Same Pattern page chrome as Insights (no SegmentedControl, no AppFrame). Quiet Insights link in the footer. No past-brands or contact slots. |
| `/privacy`, `/delete` | public | Meta review |

Responsive: Insights four-up Stats sit on the WMDS page subgrid — each `Stat` uses `col-span-2 md:col-span-4 lg:col-span-3`. Do not nest `Stat.Group`. Recent proof cards use `md:col-span-4 lg:col-span-4`. Public kit uses the shareable Pattern selected-post band (`md:col-span-4 lg:col-span-4`, likes/comments only). Insights, `/k/[handle]`, and Settings copy Pattern Show code bands (`band pb-4` + `band pt-6 sm:pt-8`). Landing `AppFrame` still uses Tailwind `[--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]`. `GridOverlay` is Storybook-only.

Personal fail, OAuth cancel → landing with the Professional message or unchanged landing. Empty grid is OK. No blank Insights: “Pulling your grid…” until R2 catches up.

---

## Sequences

1. OAuth (or stub) → token.  
2. `GET /me` → `users`. Handle frozen at first connect by default. Optional WHA-313 URL update on reconnect if username differs. Followers + `media_count` live.  
3. One page of media → `media` + R2 (carousel first frame, video poster). Insights nullable.  
4. Cookie → `/insights`. `/k/[handle]` already public.

---

## Build order

1. Next.js App Router + Tailwind v4 on OpenNext Workers. Install WMDS from `github:thewhatmatters/wmds#<sha>` (local `../wmds` still fine). Supabase Postgres via Hyperdrive + R2. Env names in README.  
2. Schema from [DATA.md](./DATA.md) including empty `detections` and `weekly_counts`. Seed `demo`. SQL in `db/`. Apply once with `npm run db:apply` when a Supabase direct URI exists. Until Hyperdrive is bound, `/k/demo` and `/insights` read the in-repo seed (`lib/seed.ts`) with the same types and KV `graph:` snapshots. When `HYPERDRIVE` is bound, SQL is preferred SoT for live Graph users + hide/restore; `writeGraphSnapshot` still falls back to KV `graph:` if that SQL write fails. `TOKEN_KEY` not required for seed.  
3. Insights + public `/k/demo` (responsive, OG tags).  
4. Cookie + stub Instagram → Insights.  
5. Live Instagram for testers.  
6. Privacy + delete pages; disconnect SLA.  
7. Support line on connect + kit.

---

## Write down, do not build

CV / filling `detections`. TikTok. PDF. Brand dashboard. Kit-view analytics for sale. Browser Run. D1. Vercel. shadcn. Storybook in this repo. Empty `detections` and `weekly_counts` tables are enough.

---

## Skip unless they are on the kit

Bio, website, rates, “contact for collab,” geo. Easy to add columns later. Not why someone connects. No columns in [DATA.md](./DATA.md) until we show them.
