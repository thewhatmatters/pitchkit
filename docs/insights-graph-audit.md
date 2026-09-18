# Insights ↔ Graph audit

**Tip audited:** `main` @ `633a2f7` (2026-09-18).  
**Verdict:** Live Instagram/Meta OAuth and Graph are **not implemented**. `/insights` paints **seed/example numbers**. Docs describe a fetch path the repo does not have. No `IG_*` / `TOKEN_KEY` values are present in this environment — dry-run stopped (section 5).

Host for Instagram Login is `graph.instagram.com` (not `graph.facebook.com`). Pin: `GRAPH_API_VERSION=v25.0` in `.env.example` only — **no TypeScript reads it**.

---

## 1. Auth path today — stub only

| Step | What code does | Live Graph? |
|---|---|---|
| Landing CTA | `app/page.tsx` POSTs `<form action="/auth/instagram">` | No |
| Connect | GET/POST `app/auth/instagram/route.ts` → `stubConnect()` | No |
| Session | httpOnly `pitchkit_session=demo` (handle string, **not** an IG token) | No |
| Gate | `app/insights/page.tsx` / `app/settings/page.tsx`: no cookie → `/` | Cookie only |
| Sign out | GET/POST `/auth/sign-out` → `stubSignOut()` clears `pitchkit_session` + `pitchkit_hidden` | No |
| Reconnect | Insights + Settings POST the same stub; seed `demo` again; no WHA-313 | No |
| Disconnect | Button only; `STUB_DISCONNECT` copy; no SQL/R2 delete | No |
| Personal fail | `/?error=personal` copy exists (`lib/copy.ts` `PERSONAL_FAIL`) | **Nothing ever redirects here** |

**Entrypoints**

- `app/auth/instagram/route.ts` — GET + POST → `lib/session.ts` `stubConnect()` → 303 `/insights` + `Set-Cookie: pitchkit_session=demo`
- `lib/session.ts` — `AUTH_CONNECT_PATH = "/auth/instagram"`, `SESSION_COOKIE = "pitchkit_session"`, `parseSessionValue()` looks up `lib/seed.ts` `seedUsers` by handle
- `app/auth/sign-out/route.ts` — GET + POST → `stubSignOut()` → 303 `/`
- Seed tokens stay null (`users.token_encrypted` / `refresh_encrypted` / `token_expires_at`) so `TOKEN_KEY` is unused

**Scopes planned (docs + privacy page only — never requested)**

- `instagram_business_basic`
- `instagram_business_manage_insights`

Cited: `PLAN.md` (Meta review), `AGENTS.md`, `app/privacy/page.tsx`. Instagram Login authorize URL is **not** in the repo. Planned Meta URLs (not coded):

```text
https://www.instagram.com/oauth/authorize
  ?client_id={IG_APP_ID}
  &redirect_uri={…}
  &response_type=code
  &scope=instagram_business_basic,instagram_business_manage_insights

POST https://api.instagram.com/oauth/access_token          # code → short-lived
GET  https://graph.instagram.com/access_token              # short → long-lived (60d)
GET  https://graph.instagram.com/refresh_access_token      # refresh long-lived
```

**Account type:** Professional only (Business **or** Creator). Personal cannot power Insights. Seed hardcodes `ig_account_type: "BUSINESS"` (`lib/seed.ts`). Graph Instagram Login `account_type` is `Business` or `Media_Creator` — seed casing does not match.

**Env / bindings:** `.env.example` names `IG_APP_ID`, `IG_APP_SECRET`, `TOKEN_KEY`, `GRAPH_API_VERSION`. `.dev.vars.example` is only `NEXTJS_ENV=development`. `wrangler.jsonc` and `cloudflare-env.d.ts` expose **`HIDDEN_KIT` only** — no IG secrets typed or bound. `hasHyperdrive()` in `lib/store.ts` is hardcoded `false`.

---

## 2. Graph client inventory

**Implemented Graph calls: none.** No `lib/graph*.ts`, no `fetch` to `graph.instagram.com` / `graph.facebook.com`, no OAuth client. The only product `fetch` is hide/restore (`lib/kit-visibility.ts` → `/api/media/*`).

Helpers that *anticipate* Graph (unused on a live path):

- `lib/reach-series.ts` `utcDayFromGraphEndTime()` — maps Insights `end_time` → UTC `YYYY-MM-DD`. Tested; product chart reads seed `{ day, reach }` already in that shape.

### Planned calls (docs + comments — not executed)

Professional Instagram account required for all Insights rows. Instagram Login token. Scopes as above.

| # | Endpoint | Fields / metrics | Lands in | Status |
|---|---|---|---|---|
| A | `GET /{v}/me` | `user_id` (or `id`), `username`, `name`, `account_type`, `profile_picture_url`, `followers_count`, `media_count` | `users.ig_user_id`, `handle` (first connect), `name`, `ig_account_type`, R2 ← photo, `followers`, `media_count` | Planned (`PLAN.md` sequence 2). **Do not persist** `follows_count` (`DATA.md`). GLOSSARY also names Public `biography` / `website` — **no columns** (`DATA.md` Do not collect). |
| B | `GET /{v}/{ig-user-id}/media` (one page) | `id`, `permalink`, `timestamp`, `media_type`, `media_product_type`, `caption`, `media_url` / `thumbnail_url`, `like_count`, `comments_count`, carousel `children` | `media.*` + R2 (`r2_key`: first child / video poster) | Planned (`PLAN.md` sequence 3). Graph `CAROUSEL_ALBUM` vs our `CAROUSEL` — no mapper. |
| C | `GET /{v}/{ig-media-id}/insights?metric=reach,saved,shares` | media insights `reach`, `saved`, `shares` (Instagram Login; **not** Facebook-only media object `saved_count` / `shares_count`) | `media.reach`, `media.saves` ← `saved`, `media.shares`; stamp `insights_fetched_at` | Planned (`GLOSSARY.md`, `DATA.md`). Column `impressions` exists; GLOSSARY says impressions stay off. |
| D | `GET /{v}/{ig-user-id}/insights?metric=reach&period=day&metric_type=time_series` | account unique reach (posts + stories + ads) | kit payload `reach_series: { day, reach }[]` — **not a SQL table** | Planned (`GLOSSARY.md`, `DATA.md`). Seed fills `lib/seed.ts` `seedReachSeries`. |
| E | `GET /{v}/{ig-user-id}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=country\|city\|age\|gender` | integer counts in `total_value.breakdowns.results.value`; omitted if &lt;100 followers | **No column.** Intended FE objects: % of located sample = `value / sum(results)` | Planned (`GLOSSARY.md`). UI currently paints `lib/inventory.ts` `EXAMPLE_*` percents. |
| F | Poll trigger | On Insights load if `fetched_at` &gt; 6h, or Refresh | refresh A–E; drop `media` + R2 if IG deleted the post | Planned (`PLAN.md` Graph and tokens). **No Refresh, no poll.** |

`TOKEN_KEY` (planned): encrypt tokens at rest before Neon. Seed leaves tokens null.

---

## 3. Schema ↔ UI map

`/insights` loads `loadOwnerKit()` (`lib/store.ts`) → `seedOwnerMedia` + `seedReachSeries` (example Insights). Public `/k/demo` loads `loadPublicKit()` → `seedMedia` (Insights **null**).

`hasInsights` (`lib/kit.ts` `kitHasInsights`): true if any of the six has `insights_fetched_at`, `reach`, `saves`, `shares`, or `impressions` set.

### Followers

| | |
|---|---|
| Reads | `users.followers` → `InsightsStats` / public `ShareableKit` |
| Formula | raw count (`formatCount`) |
| Graph-ready | yes — user `followers_count` |
| Today | seed `10_000` |
| Missing | still paints the number (0 would show `0`) |

### Engagement rate

| | |
|---|---|
| Reads | six posts’ `media.like_count` + `media.comments_count`, denominator `users.followers` |
| Formula | `(Σ likes + Σ comments) / followers` when followers &gt; 0 (`lib/engagement.ts`) |
| Graph-ready | yes — public media fields + `followers_count`; **not** an Insights metric |
| Today | seed `0.099` → `9.9%` |
| Missing | `followers <= 0` → `null` → `—`. Still shown without Insights |

### Typical reach

| | |
|---|---|
| Reads | median of `media.reach` on the six (`typicalFromPosts`) |
| Formula | median of present finite values; empty → `null` (never paint 0) |
| Graph-ready | yes — media insights `reach`. **Not** account 30-day unique |
| Today | owner seed median **2175** (`lib/kit.test.ts`) |
| Missing | Stat omitted unless typical reach **or** typical saves **or** loading (`insights-stats.tsx`). Public kit never shows it |

### Saves (typical)

| | |
|---|---|
| Reads | median of `media.saves` on the six |
| Formula | same median rule |
| Graph-ready | yes — media insights **`saved`** → column `saves`. Not user insights `saves` |
| Today | owner seed median **42** |
| Missing | same hide rule as Typical reach |

### Reach over 30 days (`Chart.Cartesian`)

| | |
|---|---|
| Reads | `owner.reach_series` only (`app/insights/page.tsx` → `ReachChart`) |
| Formula | daily `{ day, reach }`; optional constant series from `typicalReach` (not a second Graph series). `sanitizeReachSeries` drops bad points; **no zero-fill** |
| Graph-ready | mapper ready (`utcDayFromGraphEndTime`); no poll |
| Today | 30 invented UTC days (`lib/seed.ts` `SEED_REACH_VALUES`). Card badge says **“Graph data”** (`components/reach-chart.tsx`) |
| Missing / empty | hide **entire** Chart band |

### Audience `Chart.RankedBars`

| | |
|---|---|
| Reads | **not** a user/media column. `OwnerChrome` if `hasInsights` → `EXAMPLE_COUNTRY_MIX` / `CITY` / `AGE` / `GENDER` from `lib/inventory.ts`; else `SEED_AUDIENCE` empty arrays (`lib/audience.ts`) |
| Formula | planned: `% = value / sum(results)` of located sample. Seed percents are **hand-written** |
| Graph-ready | types + hide-when-empty only |
| Today | owner `hasInsights` is always true → RankedBars **always paint invented mixes** |
| Missing | hide whole `AudienceFit` Card when every mix is empty |

### Ranked proof posts (Recent proof)

| | |
|---|---|
| Reads | owner: **all** `media` rows (hidden kept). Public: filter `hidden_from_kit_at == null` **before** `selectSixPosts` |
| Kit math | last 30 days, rank **saves → reach → likes** (`compareMediaRank`); backfill older if &lt;6 |
| Display sort | `Tab.Group` Reach / Engagement / Saves (`lib/post-sort.ts`) — does not change kit math |
| Metrics on card | Insights: Saves / Reach / Likes. No Insights: Likes / Comments |
| Graph-ready | columns exist; values are seed overlays on owner (`OWNER_INSIGHTS` in `lib/seed.ts`) |
| Missing Insights | `—` for null saves/reach; missing Insights sort last |

Public `/k/[handle]` (`components/shareable-kit.tsx`): Followers + Engagement rate + selected posts **likes/comments only**. No chart, no audience, no typical reach/saves.

---

## 4. Gaps

### Docs claim a fetch path; code never calls Graph

Poll on Insights load, `GET /me`, one media page, Insights, token encrypt, Professional check → `/?error=personal`: **all documentation**. `/insights` is labeled “Graph-only” in `PLAN.md` and the reach Card badge says “Graph data”; both are seed.

### Metrics in PLAN / GLOSSARY / DATA with no fetch path

| Claimed | Persist / UI today |
|---|---|
| User `followers_count`, `media_count`, `name`, photo, `account_type` | seed columns only |
| Media page + `like_count` / `comments_count` | seed |
| Media insights `reach` / `saved` / `shares` | owner seed overlays; `shares` unused in UI |
| User insights `reach` `time_series` | `seedReachSeries` on owner kit payload |
| `follower_demographics` ×4 | **invented percents** on owner Insights |
| 6h poll / Refresh / deleted-post drop | none |
| WHA-313 handle rename on reconnect | comment only |

### UI that shows numbers Graph cannot supply *yet* (and some Graph will never supply as painted)

- Owner four-up Typical reach **2175**, Saves **42**, 30-day chart, Followers **10k**, ER **9.9%** — invented seed
- Audience RankedBars — invented `%` that are not even stored as Graph counts (GLOSSARY: Graph returns integers, we must compute %)
- Reach Card **“Graph data”** badge on seed
- `ig_account_type: "BUSINESS"` vs Graph `Business` / `Media_Creator`

### Fields Graph can return that we ignore or refuse (by lock)

| Graph | Why unused |
|---|---|
| `follows_count` | `DATA.md` Do not collect |
| `biography`, `website` | GLOSSARY Public / hide-if-empty; **no columns**; public kit must not invent them |
| User insights `saves` | GLOSSARY: typical Saves = media `saved`, not account `saves` |
| Media object `saved_count` / `shares_count` | Facebook Login only |
| `impressions` / `views` / `plays` | column exists; GLOSSARY: impressions off |
| `profile_views`, `website_clicks`, `follower_count` (new followers), `total_interactions`, `reach` breakdown `follow_type` | Not v1 Stats |
| Extra media insights (`views`, reels watch time, …) | no columns |

### Schema ready vs Graph-ready vs UI-ready

| Layer | Ready? |
|---|---|
| Postgres / `lib/schema.ts` columns for user + media Insights | yes (empty Neon; seed only) |
| `reach_series` + audience objects | payload/FE types; no persist for demographics |
| Graph client + OAuth + `GRAPH_API_VERSION` reader | **no** |
| Mapper `CAROUSEL_ALBUM` → `CAROUSEL`, `saved` → `saves`, `user_id` → `ig_user_id` | **no** |
| Hide-when-empty / no zero-fill | yes (math + Chart + audience) |

---

## 5. Minimal next cut — one Professional account, raw JSON

**Do not** flip `/auth/instagram` to live OAuth for everyone. Smallest honest step: a **flagged one-shot** (script or `GRAPH_DRY_RUN=1` admin route) that never writes seed/`users` and only prints/stores raw JSON.

### This environment — stopped

No `IG_APP_ID`, `IG_APP_SECRET`, `TOKEN_KEY`, or Instagram User access token in process env, `.dev.vars`, or Wrangler bindings. **Do not invent keys.**

### Secrets / env required (names only)

| Name | Role |
|---|---|
| `GRAPH_API_VERSION` | pin, default `v25.0` — read this; do not hardcode `latest` |
| `IG_USER_ACCESS_TOKEN` | long-lived **Instagram User** token for one Professional tester (Business or Creator), scopes **only** `instagram_business_basic` + `instagram_business_manage_insights` |
| `IG_APP_ID` / `IG_APP_SECRET` | only if minting the token via Instagram Login (App Dashboard → Instagram → Business login). Not needed if Randy pastes an already-minted token into a local env |
| `TOKEN_KEY` | **not** required for a print-JSON dry-run (no SQL encrypt) |

Optional later (not this cut): `IG_REDIRECT_URI` for a flagged OAuth callback.

Mint a tester token (manual, outside the app):

1. Meta App with Instagram Login; add the two scopes; redirect URI allowlisted.
2. Open authorize URL (section 1) as the Professional account.
3. `POST api.instagram.com/oauth/access_token` → short-lived.
4. `GET graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret={IG_APP_SECRET}&access_token={short}` → long-lived.
5. Export `IG_USER_ACCESS_TOKEN` + `GRAPH_API_VERSION=v25.0` locally. Never commit.

### Calls to print (host `https://graph.instagram.com/$GRAPH_API_VERSION`)

```bash
# 1) Identity + account type (Professional check)
GET /me?fields=user_id,username,account_type,name,followers_count,media_count,profile_picture_url

# 2) Account 30-day reach series (chart)
GET /{user_id}/insights?metric=reach&period=day&metric_type=time_series

# 3) One media page (public fields)
GET /{user_id}/media?fields=id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count,media_url,thumbnail_url,children{media_url,media_type}&limit=25

# 4) Per-media Insights (typical reach / saves)
GET /{ig-media-id}/insights?metric=reach,saved,shares

# 5) Audience (omit/empty if <100 followers — hide, do not invent)
GET /{user_id}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=country
# repeat breakdown=city, age, gender
```

Store under something like `artifacts/graph-dry-run/` (gitignored). Design Insights from those payloads: metric names, `end_time` timezone, `CAROUSEL_ALBUM`, demographics `results.value` integers, omitted-when-&lt;100.

**Out of scope for this cut:** enabling Continue-with-Instagram for all users, Neon/Hyperdrive writes, R2 ingest, widening scopes, Facebook Login, webhooks.

---

## File index

| Path | Role |
|---|---|
| `app/auth/instagram/route.ts` | stub connect |
| `lib/session.ts` | cookie + stub |
| `lib/store.ts` / `lib/seed.ts` / `lib/kit.ts` / `lib/engagement.ts` | seed kits + math |
| `lib/inventory.ts` / `lib/audience.ts` | invented audience percents |
| `lib/reach-series.ts` | chart hide + `end_time` helper |
| `app/insights/page.tsx` / `components/owner-chrome.tsx` / `insights-stats.tsx` / `reach-chart.tsx` / `audience-fit.tsx` / `proof-posts.tsx` | owner UI |
| `app/k/[handle]/page.tsx` / `components/shareable-kit.tsx` | public kit (no Insights) |
| `.env.example` | `GRAPH_API_VERSION=v25.0` (unread by code) |
| `PLAN.md` / `DATA.md` / `GLOSSARY.md` | claimed Graph contract |
