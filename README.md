# Pitchkit

A hosted **media kit** for Instagram creators. They sign in with Instagram, see their numbers, and send brands a link. Live site: **pitchkit.app**. Public kit: `https://pitchkit.app/k/[handle]`.

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

GitHub: [thewhatmatters/pitchkit](https://github.com/thewhatmatters/pitchkit).

---

## How it works

1. Creator opens pitchkit.app and reads the collection note.
2. They tap **Continue with Instagram** (Professional accounts only — Business or Creator). That is login and sign-up. No email, no password.
3. We pull public posts and Insights (not DMs, not who they follow).
4. They land on **Insights** (private). Pattern header is PitchKit + hug SegmentedControl (Insights / PitchKit) + Avatar. **PitchKit** is Pattern — owner PitchKit (Theme controls, then the same shareable kit flush under Theme — no nested Public kit preview / second PitchKit wordmark; hide/restore posts; Coming soon retired). Avatar opens Account settings (Dialog). Delete lives in that dialog, not the footer.
5. Brands open `https://pitchkit.app/k/[handle]`. They do not sign in.

Handle is taken from the Instagram username at first successful connect and is **frozen by default**. Keep `.` and `_` (do not hyphenate periods); `-2` if taken. Local/demo kit: `/k/demo`.

If they rename on Instagram, this URL stays put unless they opt in on reconnect ([WHA-313](https://linear.app/whatmatters/issue/WHA-313/optional-kit-url-update-when-ig-username-changes-on-reconnect)): **Update kit URL to @{new}**, with a warning that old `/k/…` links will 404 / stop working. Default is keep the existing URL (no redirect). Collision: `-2` if taken. Stub Connect does not offer this yet. TikTok, PDF, and extra profile fields are written in the plan as later — not v1.

On the connect screen, before they tap Instagram:

> We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

Landing stays product copy: disclosure, Professional note, **Continue with Instagram**. A quiet demo-session line may sit under the button. Do not lead with stub-token language. If they already have a resolvable `pitchkit_session`, `/` redirects to `/insights`. A leftover seed `demo` cookie is not resolvable when live Instagram secrets are set.

---

## Where things live

| File | What it is |
|---|---|
| [PLAN.md](./PLAN.md) | Product and build brief |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How the pieces connect (Workers, Graph, Supabase via Hyperdrive, R2) |
| [DATA.md](./DATA.md) | Database tables and column names |
| [GLOSSARY.md](./GLOSSARY.md) | What each kit number means (first sentence is the Insights inventory definition) |
| [AGENTS.md](./AGENTS.md) | Short lock list for coding agents |
| `app/` | Next.js App Router routes |
| `components/` | WMDS composition: Pattern — creator Insights shell (hug SegmentedControl + in-page Pattern — owner PitchKit), Insights body (`PageHeader`, Stat, Chart, Recent proof), shareable kit freeze, creator identity nameplate + Settings card |
| `db/` | Postgres schema from [DATA.md](./DATA.md) (`users`, `media`, empty `detections` + `weekly_counts`) |
| `lib/` | Schema types, in-repo seed, kit math (six-post rank + ER), `reach_series` chart / empty / omit surfaces |
| `public/demo/` | Placeholder kit images (`r2_key` maps here until R2) |

Until Hyperdrive exists, `/k/demo` and tokenless `/insights` read the in-repo seed (`lib/seed.ts`). Same `User` / `Media` types as live. A Graph poll (OAuth token; operator `IG_USER_TOKEN` never for seed `demo`) persists a snapshot on KV `HIDDEN_KIT` under `graph:` keys. When the Worker `HYPERDRIVE` (or `HYPERDRIVE_PREVIEW`) binding has a non-empty `connectionString`, SQL is preferred SoT for live Graph `users` / `media` / `hidden_from_kit_at` via postgres.js (`lib/postgres.ts`) against **Supabase Postgres**. A failed or thrown SQL upsert still writes the KV `graph:` snapshot so login does not loop on Connect. After persist, OAuth only sets the session cookie if `resolveSession(handle)` resolves. Do not use `@supabase/supabase-js` on the Worker. Deploy typecheck casts postgres.js rows through `unknown` onto `SqlQueryRow` (`asQueryRows`) — do not `as T[]`. Missing binding stays on KV + seed — `npm test` does not need a live database. `TOKEN_KEY` encrypts tokens at rest when present; not required for seed. Unknown handle (`/k/nope`) is 404. Hide/restore seed SoT is KV `HIDDEN_KIT` until Hyperdrive; httpOnly `pitchkit_hidden` mirrors for owner reload. Brands hitting `/k/demo` see hides from KV without that cookie.

Apply schema once Supabase exists (one-shot, not a migration framework). Use the **direct** URI (port 5432), not the transaction pooler (6543):

```bash
HYPERDRIVE_LOCAL_CONNECTION_STRING='postgresql://…:5432/postgres' npm run db:apply
```

That runs `db/*.sql` in order (`IF NOT EXISTS`: `users`, `media`, empty `detections`, empty `weekly_counts`, `hidden_from_kit_at`). `wrangler.jsonc` comments out `HYPERDRIVE` / `HYPERDRIVE_PREVIEW` (emergency KV-only) and keeps Hyperdrive config `pitchkit` (`bf225442516d44f599e083b72df886cd`; same id for preview MVP) in the TODO. Uncomment when SQL persist is fixed. Point the Hyperdrive config at the same direct URI.

Owner Insights kit (`loadOwnerKit`) includes seed/example `reach_series: { day, reach }[]` (`day` = YYYY-MM-DD UTC) when no token. A live token polls `graph.instagram.com` (`GRAPH_API_VERSION`, start `v25.0`) on Insights load if stale (&gt;6h) or Refresh. `/insights` reads `owner.reach_series` for one WMDS Chart; keep the Reach Card empty band when Insights exist but the series is empty, all-zero, or too short; omit when Graph never returned Insights. Never zero-fill. Public `/k/demo` (`loadPublicKit`) has no Insights and omits `reach_series` (shareable insufficient-reach empty well). Live public kits receive `reach_series` + audience for the compact reach Card and top 3 countries. Theme (`light` | `dark` | `soft`, default `light`) persists on the KV Graph snapshot with intro / past brands. Not a SQL table.

Login: **Continue with Instagram** POST/GET `/auth/instagram`. With `IG_APP_ID` + `IG_APP_SECRET`, that is Instagram Business Login (scopes `instagram_business_basic`, `instagram_business_manage_insights`; redirect `https://pitchkit.app/auth/instagram`). Without secrets it sets an httpOnly seed session for handle `demo`. With secrets, leftover `pitchkit_session=demo` is ignored (`resolveSession` null) so landing stays Continue with Instagram. Failed OAuth finish clears that cookie. If both SQL and KV snapshot writes fail, do not set the session — `/?error=persist`. After a true write, set `pitchkit_session` to the in-memory handle on a single `Set-Cookie` (do not re-read via `resolveSession`; do not pair oauth-state clear on that 303 — OpenNext/Workers can fold it and leave leftover `demo`). Live finish never writes `pitchkit_session=demo` when `/me` username is not `demo` (a snapshot stuck on handle `demo` escapes). Distinct landing errors: `oauth_state`, `oauth_exchange`, `oauth_me`, `personal`, `oauth_poll`, `persist`. If Insights poll fails after `/me`, persist a minimal snapshot and still log in. `/insights` without that cookie redirects `/`. A resolvable session on `/` redirects to `/insights`. **Sign out** (`/auth/sign-out`) clears the cookie; the public kit stays up. **Disconnect** (`POST /auth/disconnect`) clears the cookie, stamps `disconnected_at` and nulls tokens (SQL when Hyperdrive is bound; else the KV Graph snapshot), and 404s `/k/[handle]`. `/k/demo` stays the public shareable freeze (no owner Edit / Coming soon, even with a cookie). The Insights PitchKit segment is Pattern — owner PitchKit (Coming soon retired).

`/insights` is the real owner layout (WMDS Pattern — creator Insights Show code `examples-pitchkit--creator-insights`: hug `SegmentedControl` in a three-column PitchKit / control / Avatar header on `grid-page min-h-screen … [--grid-column-gap:8px] [--grid-max:1140px] [padding-bottom:44px]`, body `band pt-6 sm:pt-8`, then `PageHeader`, four-up Stat, `Chart.Cartesian` + `Chart.RankedBars`, Recent proof with `Tab.Group`). Engagement rate formula lives on the Stat info `Tooltip`, not a PageHeader headline. Share kit stays on the owner PitchKit PageHeader only (**Your Pitchkit** / **Edit what brands see on your public kit.**). PitchKit segment stays on this page and shows Pattern — owner PitchKit (`examples-pitchkit--owner-pitch-kit`) with the kit body under that header (theme picker chrome off). Insights Recent proof is read-only. Public `/k/[handle]` copies Pattern — shareable PitchKit (`examples-pitchkit--shareable-pitch-kit`) plus Pattern — creator identity (public) (`examples-pitchkit--creator-identity-public`) for the nameplate. Unsigned visitors see Create your Pitchkit (`showCreateBand`); signed-in Pitchkit users and the kit owner do not. Account settings copies Pattern — account settings (owner) (`examples-pitchkit--account-settings-owner`): Avatar `md` opens a structured Dropdown (Account settings Dialog, Share kit, Disconnect, Delete, Sign out). Dialog keeps Connected Instagram → Reconnect → Share kit → Sign out → Disconnect → Delete. Centered Privacy + Support footer (no Reconnect block on Insights). `GridOverlay` is Storybook-only. One `<Toaster position="bottom-right" />` at the app root. Full-bleed `<body className="bg-body min-h-screen">`. Hide-from-kit goes through `hideFromKit(mediaId)` / `restoreToKit(mediaId)` → `POST /api/media/hide` and `POST /api/media/restore` (`AlertDialog` + toast Undo). Restore and Share kit toasts also pass title + description. Public kit filters `hidden_from_kit_at` before the six; owner Insights keeps the row and partitions so reload **"N shown"** excludes hidden (Restore chrome stays). Insufficient `reach_series` keeps the Reach Card empty band; Graph-unavailable omits the optional chart. Empty audience mixes keep the Audience Card with **No audience data yet** / **Connect Instagram Insights demographics when available.** (never EXAMPLE percents). Both empties can show at once. Public seed Insights stay null — Engagement rate, reach, and saves hide, and the Chart is omitted (no ÷ followers). Owner demo seed has post Insights plus the example series; audience stays empty. Pitchkit-owned intro and past brands (`{ id, name }`) persist on the KV Graph snapshot; public kit omits each block when empty. Seed `/k/demo` ships frozen Pattern display data. IG biography stays off. Kit Stat label is **Engagement rate**, never “ER”.

---

## Data, in one sentence

Postgres holds creator rows and the posts we fetched. Photos go in file storage, not in SQL. We only store what Instagram Login and Insights already give us. Full column list: [DATA.md](./DATA.md).

Disconnect severs the Pitchkit↔Instagram connection: session cookies clear, `disconnected_at` is stamped, tokens are nulled, and the kit URL 404s. SQL + R2 `{user_id}/` purge still finishes within 24 hours when Hyperdrive is bound. Sign out is cookie-only. Anonymous weekly totals stay only if they cannot identify anyone.

---

## Stack (locked)

| Piece | Choice |
|---|---|
| App | Next.js App Router, TypeScript, Tailwind v4 |
| UI | WMDS (`@whatmatters/wmds`). No shadcn. Storybook stays in the WMDS repo. |
| Compute | Cloudflare Workers, official OpenNext (`@opennextjs/cloudflare`) |
| DB | Supabase Postgres via Hyperdrive |
| Files | R2 `pitchkit-media` |
| Auth | Instagram Login + httpOnly cookie |
| Charts | WMDS `Chart` (`@visx/visx` peer). No Nivo in this app. |

Install WMDS pinned to a main SHA:

```bash
npm install github:thewhatmatters/wmds#9f06fb63eae885803b1e8abdc35edecbbe0870d9
```

`prepare` builds `dist/`. Local `npm install ../wmds` still works after `npm run build` there. `postinstall` / `predev` / `prebuild` copy Geist font files into the WMDS `dist/files` path that `styles.css` expects (otherwise Next 500s on the font URLs). Chart needs the `@visx/visx` peer. Details: [PLAN.md](./PLAN.md#stack-locked), [ARCHITECTURE.md](./ARCHITECTURE.md), WMDS [`CONSUMING.md`](https://github.com/thewhatmatters/wmds/blob/main/CONSUMING.md).

Cloudflare and Support (for now): randy@whatmatters.so. Supabase region is chosen when we create the database. Hyperdrive uses the direct Postgres port (5432), not the 6543 pooler.

Env **names** only (see `.env.example`): `IG_APP_ID`, `IG_APP_SECRET`, `TOKEN_KEY`, `GRAPH_API_VERSION`, optional `IG_USER_TOKEN` / `IG_REDIRECT_URI`, plus Hyperdrive binding notes and optional `HYPERDRIVE_LOCAL_CONNECTION_STRING`. Never commit values.

---

## Run it

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Routes: `/`, `/?error=personal`, `/?error=persist`, `/?error=oauth_state`, `/?error=oauth_exchange`, `/?error=oauth_me`, `/?error=oauth_poll`, `/auth/instagram` (stub or live OAuth), `/auth/sign-out`, `/auth/disconnect`, `/insights`, `/insights?refresh=1`, `/insights?grid=pulling`, `/insights?grid=retrieving`, `/settings`, `/k/demo`, `/k/nope` (404), `POST /api/media/hide`, `POST /api/media/restore`, `POST /api/kit/profile`, `/privacy`, `/delete`.

```bash
npm test
```

Tests cover six-post rank (saves → reach → likes), Engagement rate hide when Insights reach is missing (sum÷sum of reach, not ÷ followers), owner `reach_series` shape, public `/k/demo` omitting the series (insufficient empty well), live public kits receiving Graph KPIs + compact reach, kit `theme` persist, Chart surface rules (insufficient-reach empty band vs graph-unavailable omit; occupant well + in-well paint gate), date-tick helper usage, owner Pattern shell (hug SegmentedControl + in-page Pattern — owner PitchKit, no AppShell), creator identity nameplate + Settings card, AppFrame landing class SoT `OWNER_GRID_CLASS` with Tailwind `[--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]` (WHA-309; not React `style`), Insights chrome (no duplicate tabs, Engagement rate label + Stat info `Tooltip` formula, four-up `Stat` `col-span-2 md:col-span-4 lg:col-span-3` not `Stat.Group`, Recent proof sort keys, private copy, Pattern Card well + `Chart.Cartesian.Tooltip`, post dates with year, seed demo never uses `IG_USER_TOKEN`), shareable kit freeze (no Edit/MoreMenu), past-brand hide-empty, live/empty audience never painting EXAMPLE mixes (insufficient Audience Card stays), hide/restore persistence (`hidden_from_kit_at`, public exclude-before-six, owner include + Insights partition so **"N shown"** / rank use `hidden_from_kit_at == null` only, KV `HIDDEN_KIT` SoT + httpOnly `pitchkit_hidden` owner mirror, no localStorage), Hide-from-kit WMDS `AlertDialog` confirm exposing accessible dialog semantics (`role=dialog` / `alertdialog`), set/clear of the Pitchkit session cookie plus the Insights gate, Hyperdrive binding detection (fail-closed without a live database), SQL users/media/hide/disconnect contracts against a mocked client, and Graph snapshot KV fallback when a Hyperdrive SQL upsert fails. Fail-closed rails: `lib/owner-grid-tokens.test.ts`, `lib/kit-visibility.test.ts` shown partition, `lib/alert-dialog-role.test.ts`, `lib/creator-identity.test.ts`.

Production-shaped local Workers runtime (official OpenNext):

```bash
npm run preview
```

Build only:

```bash
npm run build
```

Deploy to Workers (needs Cloudflare auth and bindings):

```bash
npm run deploy
```

Workers Builds: dashboard non-prod deploy is `npx wrangler versions upload` (no OpenNext step). `wrangler.jsonc` `build.command` runs `npx opennextjs-cloudflare build` so `.open-next/worker.js` exists before upload. Seed deploy does not need `TOKEN_KEY` / Hyperdrive / R2. Production last succeeded with `npm run deploy` (OpenNext build + deploy).
