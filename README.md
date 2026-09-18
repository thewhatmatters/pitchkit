# Pitchkit

A hosted **media kit** for Instagram creators. They sign in with Instagram, see their numbers, and send brands a link. Live site: **pitchkit.app**. Public kit: `https://pitchkit.app/k/[handle]`.

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

GitHub: [thewhatmatters/pitchkit](https://github.com/thewhatmatters/pitchkit).

---

## How it works

1. Creator opens pitchkit.app and reads the collection note.
2. They tap **Continue with Instagram** (Professional accounts only — Business or Creator). That is login and sign-up. No email, no password.
3. We pull public posts and Insights (not DMs, not who they follow).
4. They land on **Insights** (private). Pattern header is PitchKit + hug SegmentedControl (Insights / PitchKit) + Avatar. **PitchKit** is an in-page Coming soon placeholder. Account is a quiet footer link.
5. Brands open `https://pitchkit.app/k/[handle]`. They do not sign in.

Handle is taken from the Instagram username at first successful connect and is **frozen by default**. Keep `.` and `_` (do not hyphenate periods); `-2` if taken. Local/demo kit: `/k/demo`.

If they rename on Instagram, this URL stays put unless they opt in on reconnect ([WHA-313](https://linear.app/whatmatters/issue/WHA-313/optional-kit-url-update-when-ig-username-changes-on-reconnect)): **Update kit URL to @{new}**, with a warning that old `/k/…` links will 404 / stop working. Default is keep the existing URL (no redirect). Collision: `-2` if taken. Stub Connect does not offer this yet. TikTok, PDF, and extra profile fields are written in the plan as later — not v1.

On the connect screen, before they tap Instagram:

> We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

Landing stays product copy: disclosure, Professional note, **Continue with Instagram**. A quiet demo-session line may sit under the button. Do not lead with stub-token language.

---

## Where things live

| File | What it is |
|---|---|
| [PLAN.md](./PLAN.md) | Product and build brief |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How the pieces connect (Workers, Graph, Neon, R2) |
| [DATA.md](./DATA.md) | Database tables and column names |
| [GLOSSARY.md](./GLOSSARY.md) | What each kit number means (first sentence is the Insights inventory definition) |
| [AGENTS.md](./AGENTS.md) | Short lock list for coding agents |
| `app/` | Next.js App Router routes |
| `components/` | WMDS composition: Pattern — creator Insights shell (hug SegmentedControl + in-page PitchKit Coming soon), Insights body (`PageHeader`, Stat, Chart, Recent proof), shareable kit freeze |
| `db/` | Postgres schema from [DATA.md](./DATA.md) (`users`, `media`, empty `detections` + `weekly_counts`) |
| `lib/` | Schema types, in-repo seed, kit math (six-post rank + ER), `reach_series` chart / empty / omit surfaces |
| `public/demo/` | Placeholder kit images (`r2_key` maps here until R2) |

Until Hyperdrive exists, `/k/demo` and tokenless `/insights` read the in-repo seed (`lib/seed.ts`). Same `User` / `Media` types as live. A Graph poll (OAuth token or operator `IG_USER_TOKEN`) persists a snapshot on KV `HIDDEN_KIT` under `graph:` keys. `TOKEN_KEY` encrypts tokens at rest when present; not required for seed. Unknown handle (`/k/nope`) is 404. Hide/restore seed SoT is KV `HIDDEN_KIT` until Neon; httpOnly `pitchkit_hidden` mirrors for owner reload. Brands hitting `/k/demo` see hides from KV without that cookie. When Hyperdrive exists, write `users` / `media` / `hidden_from_kit_at` instead.

Owner Insights kit (`loadOwnerKit`) includes seed/example `reach_series: { day, reach }[]` (`day` = YYYY-MM-DD UTC) when no token. A live token polls `graph.instagram.com` (`GRAPH_API_VERSION`, start `v25.0`) on Insights load if stale (&gt;6h) or Refresh. `/insights` reads `owner.reach_series` for one WMDS Chart; keep the Reach Card empty band when Insights exist but the series is empty, all-zero, or too short; omit when Graph never returned Insights. Never zero-fill. Public `/k/demo` (`loadPublicKit`) has no Insights and omits `reach_series`. Not a SQL table.

Login: **Continue with Instagram** POST/GET `/auth/instagram`. With `IG_APP_ID` + `IG_APP_SECRET`, that is Instagram Business Login (scopes `instagram_business_basic`, `instagram_business_manage_insights`; redirect `https://pitchkit.app/auth/instagram`). Without secrets it sets an httpOnly seed session for handle `demo`. `/insights` without that cookie redirects `/`. Sign out clears the cookie. `/k/demo` stays the public shareable freeze (no owner Edit / Coming soon, even with a cookie). The Insights PitchKit segment is Coming soon.

`/insights` is the real owner layout (WMDS Pattern — creator Insights Show code `examples-pitchkit--creator-insights`: hug `SegmentedControl` in a three-column PitchKit / control / Avatar header on `grid-page min-h-screen … [--grid-column-gap:8px] [--grid-max:1140px] [padding-bottom:44px]`, body `band pt-6 sm:pt-8`, then `PageHeader`, four-up Stat, `Chart.Cartesian` + `Chart.RankedBars`, Recent proof with `Tab.Group`). PitchKit segment stays on this page and shows Coming soon. Public `/k/[handle]` copies Pattern — shareable PitchKit (`examples-pitchkit--shareable-pitchkit`). `GridOverlay` is Storybook-only. One `<Toaster position="bottom-right" />` at the app root. Full-bleed `<body className="bg-body min-h-screen">`. Hide-from-kit goes through `hideFromKit(mediaId)` / `restoreToKit(mediaId)` → `POST /api/media/hide` and `POST /api/media/restore` (`AlertDialog` + toast Undo). Restore and Share kit toasts also pass title + description. Public kit filters `hidden_from_kit_at` before the six; owner Insights keeps the row and partitions so reload **"N shown"** excludes hidden (Restore chrome stays). Insufficient `reach_series` keeps the Reach Card empty band; Graph-unavailable omits the optional chart. Empty audience mixes keep the Audience Card with **No audience data yet** / **Connect Instagram Insights demographics when available.** (never EXAMPLE percents). Both empties can show at once. Public seed Insights stay null — Engagement rate, reach, and saves hide, and the Chart is omitted (no ÷ followers). Owner demo seed has post Insights plus the example series; audience stays empty. Contact and past brands stay hidden on the public kit when blank. Kit Stat label is **Engagement rate**, never “ER”.

---

## Data, in one sentence

Postgres holds creator rows and the posts we fetched. Photos go in file storage, not in SQL. We only store what Instagram Login and Insights already give us. Full column list: [DATA.md](./DATA.md).

Disconnect deletes the creator, their posts, and their files. Anonymous weekly totals stay only if they cannot identify anyone.

---

## Stack (locked)

| Piece | Choice |
|---|---|
| App | Next.js App Router, TypeScript, Tailwind v4 |
| UI | WMDS (`@whatmatters/wmds`). No shadcn. Storybook stays in the WMDS repo. |
| Compute | Cloudflare Workers, official OpenNext (`@opennextjs/cloudflare`) |
| DB | Neon Postgres + Hyperdrive |
| Files | R2 `pitchkit-media` |
| Auth | Instagram Login + httpOnly cookie |
| Charts | WMDS `Chart` (`@visx/visx` peer). No Nivo in this app. |

Install WMDS pinned to a main SHA:

```bash
npm install github:thewhatmatters/wmds#70da6a4c50d8efc1e687b20f231c6e4f1f6190c6
```

`prepare` builds `dist/`. Local `npm install ../wmds` still works after `npm run build` there. `postinstall` / `predev` / `prebuild` copy Geist font files into the WMDS `dist/files` path that `styles.css` expects (otherwise Next 500s on the font URLs). Chart needs the `@visx/visx` peer. Details: [PLAN.md](./PLAN.md#stack-locked), [ARCHITECTURE.md](./ARCHITECTURE.md), WMDS [`CONSUMING.md`](https://github.com/thewhatmatters/wmds/blob/main/CONSUMING.md).

Cloudflare and Support (for now): randy@whatmatters.so. Neon region is chosen when we create the database.

Env **names** only (see `.env.example`): `IG_APP_ID`, `IG_APP_SECRET`, `TOKEN_KEY`, `GRAPH_API_VERSION`, optional `IG_USER_TOKEN` / `IG_REDIRECT_URI`, plus Hyperdrive notes. Never commit values.

---

## Run it

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Routes: `/`, `/?error=personal`, `/auth/instagram` (stub or live OAuth), `/auth/sign-out`, `/insights`, `/insights?refresh=1`, `/insights?grid=pulling`, `/insights?grid=retrieving`, `/settings`, `/k/demo`, `/k/nope` (404), `POST /api/media/hide`, `POST /api/media/restore`, `/privacy`, `/delete`.

```bash
npm test
```

Tests cover six-post rank (saves → reach → likes), Engagement rate hide when Insights reach is missing (sum÷sum of reach, not ÷ followers), owner `reach_series` shape, public kit omitting the series, Chart surface rules (insufficient-reach empty band vs graph-unavailable omit; occupant well + in-well paint gate), date-tick helper usage, owner Pattern shell (hug SegmentedControl + in-page PitchKit Coming soon, no AppShell), AppFrame settings/landing class SoT `OWNER_GRID_CLASS` with Tailwind `[--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]` (WHA-309; not React `style`), Insights chrome (no duplicate tabs, Engagement rate label, four-up `Stat` `col-span-2 md:col-span-4 lg:col-span-3` not `Stat.Group`, Recent proof sort keys, private copy, Pattern Card well + `Chart.Cartesian.Tooltip`), shareable kit freeze (no Edit/MoreMenu), past-brand hide-empty, live/empty audience never painting EXAMPLE mixes (insufficient Audience Card stays), hide/restore persistence (`hidden_from_kit_at`, public exclude-before-six, owner include + Insights partition so **"N shown"** / rank use `hidden_from_kit_at == null` only, KV `HIDDEN_KIT` SoT + httpOnly `pitchkit_hidden` owner mirror, no localStorage), Hide-from-kit WMDS `AlertDialog` confirm exposing accessible dialog semantics (`role=dialog` / `alertdialog`), and set/clear of the Pitchkit session cookie plus the Insights gate. Fail-closed rails: `lib/owner-grid-tokens.test.ts`, `lib/kit-visibility.test.ts` shown partition, `lib/alert-dialog-role.test.ts`.

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
