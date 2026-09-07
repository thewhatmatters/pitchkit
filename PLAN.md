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
| Install | Pin GitHub `github:thewhatmatters/wmds#<sha>` (CI cannot use `../wmds`). Local path still works. `prepare` builds `dist/`. Current pin: `a80b2b99a7d2ca91bdc46c7fa6b860bf5e0ce42a`. How to consume: WMDS `CONSUMING.md`. After login: WMDS `SegmentedControl` (Insights / PitchKit) on `grid-page` + `band` with `--grid-max: 960px`. `AppFrame` mounts WMDS `GridOverlay` (`visibleByDefault`; press **g**) as the first child of `grid-page`. No AppShell / NavRail / owner rail. Do not invent a Pitchkit Grid atom. |
| Compute | Cloudflare Workers via **OpenNext** (official adapter only) |
| DB | Neon Postgres + Hyperdrive (`HYPERDRIVE` / `HYPERDRIVE_PREVIEW`) |
| Files | R2 `pitchkit-media` |
| Auth | Instagram Login + Pitchkit httpOnly cookie |
| Charts | WMDS `Chart` only (`@visx/visx` peer). No Nivo in Pitchkit `package.json`. |

**Not used:** D1, Vercel, shadcn, Browser Run, Queues, Workers AI.

**Storybook** lives in the WMDS repo. Copy patterns from there; do not add Storybook to Pitchkit.

---

## Identity and URLs (locked)

**Kit URL:** `pitchkit.app/k/[handle]` — not `pitchkit.app/[handle]`. Root stays landing, Insights, privacy, delete. `/k/` never collides with those.

**Handle** is frozen at first successful connect (Instagram username, slugified; `-2` if taken). If they rename on Instagram, **our URL does not change.** No redirect. Unknown or disconnected handle → **404**.

**Public from first successful connect.** No publish switch. Ingest builds the kit; `/k/[handle]` is live as soon as the `users` row exists.

**Session:** Instagram proves who they are. Pitchkit still sets an **httpOnly cookie** for Insights, disconnect, and refresh. The cookie is our login, not the Instagram token. Until live OAuth, stub Continue (GET/POST `/auth/instagram`) sets that cookie for seed handle `demo`. Sign out clears it. `/insights` without the cookie goes `/`. `/k/[handle]` does not need it.

Owner home: `/insights`. SegmentedControl PitchKit is owner chrome over the same card at `/k/[handle]`. Brands only get `/k/[handle]` (no owner nav).

Seed: `/k/demo`.

---

## What we offer (v1)

| Who | What |
|---|---|
| Creator | Continue with Instagram (Professional). Land on Insights. Share the kit URL. Reconnect, sign out, disconnect. Phone works. |
| Brand | Open the kit. No account. |

No extra onboarding. No PDF in v1. No TikTok in v1. No bio, website, rates, “contact for collab,” or geo on the **public kit**. `/insights` is the owner Graph layout (headline Typical reach + four-up Stat row + one Chart from `owner.reach_series` + Top-performing posts). Primary nav is a WMDS `SegmentedControl` — Insights / PitchKit — no AppShell and no duplicate tabs on the page. Account is a quiet footer link. Mixes as ranked % lists, not a map. No new Postgres columns for identity typed holes.

---

## Kit math (locked)

**Six posts / Top-performing posts:** among posts we fetched with `posted_at` in the **last 30 days**, rank **saves, then reach, then likes** (missing Insights sort last). Fill from older fetched posts only if we do not have six in-window. Insights UI label is **Top-performing posts**, with a display sort (Reach / Engagement / Saves). Kit math stays the locked rank.

**Engagement rate:** `(likes + comments) / followers` on those six, when followers > 0. If Insights are missing, still show that ER from public likes and comments; **hide reach, saves, and the chart**.

**Chart series:** Insights kit payload exposes one `reach_series` (`{ day, reach }`, `day` = YYYY-MM-DD UTC). Account reach day buckets (stories + ads). Empty, omit, or a plot that cannot paint ink hides the **entire Chart band** (title + slot) — never a header-only empty 240px box. Do not invent 30 zeros. `/insights` reads `owner.reach_series` only. WMDS `Chart.Cartesian` area: `{ date, reach }` points, `animate="none"`, explicit `Area`. Owner demo seed includes ~30 labeled example points. Public `/k/demo` omits (Insights missing). Seed only; no Graph poll in this path.

**Carousel:** first child frame (cover) into R2. **Video:** poster only on the kit, never the file.

---

## Meta review (screenshots + copy)

**Scopes (Instagram Login):** public media + Insights only — `instagram_business_basic` and `instagram_business_manage_insights`. Nothing else.

**Before the button** (`disclosure_version` = 1):

> We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

Short: *Public posts and Insights only. No DMs. No following list. Disconnect deletes everything we stored.*

**Privacy:** `https://pitchkit.app/privacy`  
**Delete-all:** `https://pitchkit.app/delete` — same as Disconnect: Postgres `users` + `media` + R2 `{user_id}/` (see Storage).

**Professional only.** If Graph says personal / login fails for that reason, show:

> Pitchkit works with Instagram Professional accounts (Business or Creator). In Instagram, switch to Professional, then try again.

**Stub vs live OAuth:** same `users` / `media` schema. Stub fills the same columns. Review pending → stub + seed `demo`. Testers on a live app use real OAuth. Do not fork the data model.

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

**Token revoked or refresh fails:** public kit **stays** on last Postgres/R2. Owner sees **Reconnect Instagram**. Cookie still needed to reconnect.

---

## Ops (day one)

| Thing | v1 |
|---|---|
| Neon | One project. **Region:** choose when we create the database. |
| Hyperdrive | Prod binding `HYPERDRIVE`. Preview binding `HYPERDRIVE_PREVIEW` |
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
| `/` | anyone | Pitch, disclosure, Continue with Instagram, Professional note, support |
| `/insights` | owner cookie | Graph-only Insights: headline Typical reach (hire; hide if missing), then a four-desktop-column Stat row (Followers, Engagement rate, Typical reach, Saves when Insights are present). Do not lead with Engagement rate. Spell **Engagement rate** (never “ER”). No invented period-over-period trends. One 30-day account-reach Chart from `owner.reach_series` when that field is non-empty **and** the area can paint. Hide the whole Chart band when omitted, `[]`, or no ink. Date ticks use WMDS `chartMaxTicksForWidth` (~3 on a phone). Never zero-fill. **Top-performing posts** with Reach / Engagement / Saves sort; compact single-column rows. Quiet “Private to you” Badge. Top nav is SegmentedControl Insights / PitchKit (not AppShell). No contact/past-brands holes. Reconnect / sign out / disconnect stay as buttons. Account is a quiet footer link. |
| `/k/[handle]` | public | Kit card + support footer. No owner nav. Owner session on this handle gets SegmentedControl + 960 grid and can toggle Edit for contact + past brands. Share link stays view. |
| `/settings` | owner cookie | Account only — reconnect / sign out / disconnect. 960 grid, no SegmentedControl. Quiet Insights link in the footer. No past-brands or contact slots. |
| `/privacy`, `/delete` | public | Meta review |

Responsive: Stat.Group stays WMDS 2-up on a phone / 4-up on desktop. Insights posts are compact single-column rows. Public kit stays a 2×3 card grid. Owner views wrap `grid-page` + `band` with `--grid-max: 960px` and a top SegmentedControl (Insights / PitchKit). `AppFrame` paints WMDS `GridOverlay` inside `grid-page`. A public kit path that skips `AppFrame` has no overlay.

Personal fail, OAuth cancel → landing with the Professional message or unchanged landing. Empty grid is OK. No blank Insights: “Pulling your grid…” until R2 catches up.

---

## Sequences

1. OAuth (or stub) → token.  
2. `GET /me` → `users`. Handle frozen. Followers + `media_count` live.  
3. One page of media → `media` + R2 (carousel first frame, video poster). Insights nullable.  
4. Cookie → `/insights`. `/k/[handle]` already public.

---

## Build order

1. Next.js App Router + Tailwind v4 on OpenNext Workers. Install WMDS from `github:thewhatmatters/wmds#<sha>` (local `../wmds` still fine). Neon + Hyperdrive + R2. Env names in README.  
2. Schema from [DATA.md](./DATA.md) including empty `detections` and `weekly_counts`. Seed `demo`. SQL in `db/`. Until Hyperdrive exists, `/k/demo` and `/insights` read the in-repo seed (`lib/seed.ts`) with the same types. `TOKEN_KEY` not required for seed.  
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
