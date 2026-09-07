# Pitchkit

A hosted **media kit** for Instagram creators. They sign in with Instagram, see their numbers, and send brands a link. Live site: **pitchkit.app**. Public kit: `https://pitchkit.app/k/[handle]`.

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

GitHub: [thewhatmatters/pitchkit](https://github.com/thewhatmatters/pitchkit).

---

## How it works

1. Creator opens pitchkit.app and reads the collection note.
2. They tap **Continue with Instagram** (Professional accounts only — Business or Creator). That is login and sign-up. No email, no password.
3. We pull public posts and Insights (not DMs, not who they follow).
4. They land on **Insights** (private). SegmentedControl nav is Insights / Pitch. **Pitch** is the shareable `/k/[handle]` page. Account is a quiet footer link.
5. Brands open `https://pitchkit.app/k/[handle]`. They do not sign in.

Handle is taken from the Instagram username at signup and **does not change**. Local/demo kit: `/k/demo`.

If they rename on Instagram, this URL stays put. TikTok, PDF, and extra profile fields are written in the plan as later — not v1.

On the connect screen, before they tap Instagram:

> We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

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
| `components/` | WMDS composition: owner SegmentedControl + 960 grid, AppFrame GridOverlay, Insights headline + four-up Stat tiles on the band spine, chart/Top-performing posts, public kit + owner Edit |
| `db/` | Postgres schema from [DATA.md](./DATA.md) (`users`, `media`, empty `detections` + `weekly_counts`) |
| `lib/` | Schema types, in-repo seed, kit math (six-post rank + ER), `reach_series` hide rules |
| `public/demo/` | Placeholder kit images (`r2_key` maps here until R2) |

Until Hyperdrive exists, `/k/demo` and `/insights` read the in-repo seed (`lib/seed.ts`). Same `User` / `Media` types as live. `TOKEN_KEY` is not required for seed. Unknown handle (`/k/nope`) is 404. No Neon or Instagram token yet.

Owner Insights kit (`loadOwnerKit`) includes seed/example `reach_series: { day, reach }[]` (`day` = YYYY-MM-DD UTC). `/insights` reads `owner.reach_series` for one WMDS Chart; hide when the field is omitted or empty. Never zero-fill. Public `/k/demo` (`loadPublicKit`) has no Insights and omits `reach_series`. Not a SQL table. No Graph poll in the seed.

Stub login: **Continue with Instagram** POST/GET `/auth/instagram` sets an httpOnly Pitchkit session for handle `demo` and redirects to `/insights`. `/insights` without that cookie redirects `/`. Sign out clears the cookie. `/k/demo` stays public (no cookie). Owner Edit on `/k/demo` only when that session owns `demo`.

`/insights` is the real owner layout (WMDS `SegmentedControl` Insights / Pitch, `grid-page` + `band` at 960px, WMDS `GridOverlay` on by default — press **g** to toggle, headline Typical reach + four-up Stat tiles on the page spine — `lg:col-span-3` each, not nested `Stat.Group` — one Chart when `owner.reach_series` is present **and** the area can paint, Top-performing posts). Hide the entire Chart band if the series is omitted/`[]` or the plot has no ink — never a header-only empty slot. Public seed Insights stay null — Engagement rate still shows; reach, saves, and the Chart hide. Owner demo seed has post Insights plus the example series. Audience mixes hide until Graph data exists. Contact and past brands are typed holes on `/k/[handle]` only. No new Postgres columns.

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
npm install github:thewhatmatters/wmds#a80b2b99a7d2ca91bdc46c7fa6b860bf5e0ce42a
```

`prepare` builds `dist/`. Local `npm install ../wmds` still works after `npm run build` there. `postinstall` / `predev` / `prebuild` copy Geist font files into the WMDS `dist/files` path that `styles.css` expects (otherwise Next 500s on the font URLs). Chart needs the `@visx/visx` peer. Details: [PLAN.md](./PLAN.md#stack-locked), [ARCHITECTURE.md](./ARCHITECTURE.md), WMDS [`CONSUMING.md`](https://github.com/thewhatmatters/wmds/blob/main/CONSUMING.md).

Cloudflare and Support (for now): randy@whatmatters.so. Neon region is chosen when we create the database.

Env **names** only (see `.env.example`): `IG_APP_ID`, `IG_APP_SECRET`, `TOKEN_KEY`, plus Hyperdrive notes. Never commit values.

---

## Run it

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Routes: `/`, `/?error=personal`, `/auth/instagram` (stub connect), `/auth/sign-out`, `/insights`, `/insights?grid=pulling`, `/settings`, `/k/demo`, `/k/nope` (404), `/privacy`, `/delete`.

```bash
npm test
```

Tests cover six-post rank (saves → reach → likes), ER when Insights are missing, owner `reach_series` shape, public kit omitting the series, Chart hide rules (entire band — no header alone), date-tick helper usage, owner SegmentedControl Insights / Pitch + 960 grid (no AppShell), AppFrame mounting WMDS `GridOverlay` before `band` with band children as grid items (no `col-span-full flex` wrap), Insights chrome (no duplicate tabs, Engagement rate label, four-up `lg:col-span-3` tiles not `Stat.Group`, Top-performing posts sort keys, private copy, Card + `Chart.Cartesian.Tooltip`), past-brand chip hide-empty, and set/clear of the Pitchkit session cookie plus the Insights gate.

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
