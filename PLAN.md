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
| Install | Git/path to `thewhatmatters/wmds` until the package is published (`npm install ../wmds` or `github:thewhatmatters/wmds`). Build WMDS (`npm run build`) so `dist/` exists. How to consume: WMDS `CONSUMING.md`. |
| Compute | Cloudflare Workers via **OpenNext** (official adapter only) |
| DB | Neon Postgres + Hyperdrive (`HYPERDRIVE` / `HYPERDRIVE_PREVIEW`) |
| Files | R2 `pitchkit-media` |
| Auth | Instagram Login + Pitchkit httpOnly cookie |
| Charts | CSS |

Randy overwrote **Charts: CSS** with **Nivo in WMDS**. Chart ships in the design system first. Do not implement Nivo in this repo.

**Not used:** D1, Vercel, shadcn, Browser Run, Queues, Workers AI.

**Storybook** lives in the WMDS repo. Copy patterns from there; do not add Storybook to Pitchkit.

---

## Identity and URLs (locked)

**Kit URL:** `pitchkit.app/k/[handle]` — not `pitchkit.app/[handle]`. Root stays landing, Insights, privacy, delete. `/k/` never collides with those.

**Handle** is frozen at first successful connect (Instagram username, slugified; `-2` if taken). If they rename on Instagram, **our URL does not change.** No redirect. Unknown or disconnected handle → **404**.

**Public from first successful connect.** No publish switch. Ingest builds the kit; `/k/[handle]` is live as soon as the `users` row exists.

**Session:** Instagram proves who they are. Pitchkit still sets an **httpOnly cookie** for Insights, disconnect, and refresh. The cookie is our login, not the Instagram token.

Owner home: `/insights`. Media kit tab is owner chrome over the same card. Brands only get `/k/[handle]`.

Seed: `/k/demo`.

---

## What we offer (v1)

| Who | What |
|---|---|
| Creator | Continue with Instagram (Professional). Land on Insights. Share the kit URL. Reconnect, sign out, disconnect. Phone works. |
| Brand | Open the kit. No account. |

No extra onboarding. No PDF in v1. No TikTok in v1. No bio, website, rates, “contact for collab,” or geo on the kit.

---

## Kit math (locked)

**Source:** User Research + Design, 2026-09-02. Meanings and copy: [GLOSSARY.md](./GLOSSARY.md). Backend must confirm live Graph names against the current IG version before wiring.

**Headline:** name and handle. Followers are **scale context**, not the headline.

**Ordered Stat row (ER still primary).** Do not pad to five. Row length follows the data. Chart is a trend object, not a fifth Stat.

1. **Engagement rate** — always. Hire/no-hire. WMDS Stat (label + number). Insights: `(likes + comments + saves + shares) / followers` on the six, when followers > 0. Public only: `(likes + comments) / followers` — the tooltip must say which.
2. **Typical reach** — Insights only. Median unique accounts on recent posts, not a spike. Hide until connected.
3. **Followers** — always. Scale / sanity vs reach.
4. **Saves** — Insights only. Intent. Hide until connected.
5. Then the **30-day chart** (reach). Insights only.

**Row:** 2 without Insights (ER + Followers). 4 + chart with Insights. Horizontal scroll is allowed later. Do not invent a fifth to fill a grid. Do not lock stats to a 2×2.

**Six posts:** among posts we fetched with `posted_at` in the **last 30 days**, rank **saves, then reach, then likes** (missing Insights sort last). Fill from older fetched posts only if we do not have six in-window.

**Insights-gated:** typical reach, saves, and the 30-day chart **only when Insights exist**. Empty > zeros — do not paint missing Insights as 0. If Insights are missing, still show ER from public likes and comments; **hide typical reach, saves, and the chart**.

**Carousel:** first child frame (cover) into R2. **Video:** poster only on the kit, never the file.

**Not on the kit in v1:** geo, rates, bio. Not a v1 Stat: impressions, comments, likes, conversion, media count, profile visits, 90-day growth (see [GLOSSARY.md](./GLOSSARY.md)).

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

Screencast to capture: disclosure on connect → Instagram permissions → Insights → Media kit tab → copy link → public `/k/[handle]`.

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

**Jobs (locked, User Research + Design, 2026-09-02):**

| Who | Job |
|---|---|
| Brand on `/k/[handle]` | Spend or pass in ~30s — is the audience real, how many people actually see a post, is the content worth keeping. |
| Creator on Insights | Same numbers as `/k/[handle]`, labeled — will this kit survive a brand checking the public grid before they share the link. |

| Route | Who | What |
|---|---|---|
| `/` | anyone | Pitch, disclosure, Continue with Instagram, Professional note, support |
| `/insights` | owner cookie | Last 30 days, stats, chart, six posts, reconnect / disconnect / sign out |
| `/insights` Media kit tab | owner | Same card as public + copy / share link |
| `/k/[handle]` | public | Card only + support footer |
| `/privacy`, `/delete` | public | Meta review |

Name/handle is the headline on both Insights and the public card. Followers are scale. ER is the hire/no-hire Stat. Vocabulary: [GLOSSARY.md](./GLOSSARY.md). **Stats row is fluid** (Randy, 2026-09-02): 2 without Insights (ER + Followers), 4 + chart with Insights. Do not pad to five. Do not lock stats to a 2×2. Posts: **2×3** on a phone.

Personal fail, OAuth cancel → landing with the Professional message or unchanged landing. Empty grid is OK. No blank Insights: “Pulling your grid…” until R2 catches up.

---

## Sequences

1. OAuth (or stub) → token.  
2. `GET /me` → `users`. Handle frozen. Followers + `media_count` live.  
3. One page of media → `media` + R2 (carousel first frame, video poster). Insights nullable.  
4. Cookie → `/insights`. `/k/[handle]` already public.

---

## Build order

1. Next.js App Router + Tailwind v4 on OpenNext Workers. Install WMDS from `../wmds` (build `dist/` first). Neon + Hyperdrive + R2. Env names in README.  
2. Schema from [DATA.md](./DATA.md) including empty `detections` and `weekly_counts`. Seed `demo`.  
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
