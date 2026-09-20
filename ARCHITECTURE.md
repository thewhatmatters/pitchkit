# Pitchkit architecture

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Living picture of v1. Product: [PLAN.md](./PLAN.md). Columns: [DATA.md](./DATA.md).

The Phase 0 diagram is **mostly right**: Next.js on Cloudflare Workers, Instagram Login + Graph, Supabase Postgres through Hyperdrive, photos in R2, public kit at `/k/[handle]`, never put image bytes in SQL.

Two fixes so we do not build the wrong thing:

1. **`pitchkit.app` is one Worker**, not a second app. `/`, `/insights`, `/privacy`, `/delete`, and `/k/[handle]` are routes on that Worker. The kit URL does not talk to Postgres by itself.
2. **The public kit needs photos.** Postgres has rows and R2 keys. The browser loads images from **public R2** (or a Worker URL in front of R2). A diagram that only arrows the kit at Postgres is incomplete. The kit **does not** call Instagram.

---

## Picture

```mermaid
flowchart TB
  C[Creator]
  B[Brand]
  W[Next.js on Cloudflare Workers]
  IG[Instagram Login + Graph]
  PG[(Supabase Postgres via Hyperdrive)]
  R2[(R2 — public kit images)]

  C -->|cookie after OAuth| W
  B -->|GET /k/handle| W
  W <-->|OAuth and poll — owner paths only| IG
  W -->|users and media rows| PG
  W -->|image bytes| R2
  W -->|read rows| PG
  W -->|public image URLs| R2
```

```text
Creator → Workers (OpenNext)
            → Instagram Login + Graph   (connect, refresh, Insights poll)
            → Supabase via Hyperdrive    = rows
            → R2                         = photos (public read)
         → /insights                     (owner, cookie; Pattern — creator Insights shell + Graph layout)
         → /k/[handle]                   (anyone; Postgres + R2; no Graph)

Brand  → /k/[handle] → same Worker → rows + public photos
```

**Postgres = index cards. R2 = photos. Never store image bytes in SQL.**

---

## Stack (locked)

Same table as [PLAN.md](./PLAN.md#stack-locked). Short version:

- **UI:** `@whatmatters/wmds` pattern-first + `styles.css`. App owns layout Tailwind only. No shadcn. No Storybook here (copy from WMDS Storybook).
- **App:** Next.js App Router, TypeScript, Tailwind v4, official OpenNext on Workers.
- **Icons:** Lucide through WMDS props. **Motion:** `motion` peer when WMDS needs it.
- **Install WMDS:** pin `github:thewhatmatters/wmds#29bef582fd60bb2398014f1c797b34fcf30bc791` (CI cannot use `../wmds`). Local `../wmds` still works; `prepare` builds `dist/`. `@visx/visx` is the Chart peer. Cookie-gated Insights copies Pattern — creator Insights Show code (`examples-pitchkit--creator-insights`: `CREATOR_INSIGHTS_PAGE_CLASS` + hug `SegmentedControl` in a three-column PitchKit / control / Avatar header; PitchKit segment is Pattern — owner PitchKit (`examples-pitchkit--owner-pitch-kit`; Coming soon retired; selected-post MoreMenu in `Card.Header` `end`, which stays trailing via `ml-auto`)). Public `/k/[handle]` copies Pattern — shareable PitchKit (`examples-pitchkit--shareable-pitch-kit`) plus State — shareable insufficient reach (`examples-pitchkit--shareable-insufficient-reach`) plus Pattern — creator identity (public) (`examples-pitchkit--creator-identity-public`) for the nameplate; unsigned visitors see Create your Pitchkit (`showCreateBand`). Owner PitchKit tab copies Pattern — theme picker (owner) (`examples-pitchkit--theme-picker-owner`) and mounts that same shareable composition flush under Theme (no nested Public kit preview / second PitchKit wordmark). Account settings copies Pattern — account settings (owner) (`examples-pitchkit--account-settings-owner`). Landing / legal keep `AppFrame` `OWNER_GRID_CLASS` with Tailwind `[--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]`. `GridOverlay` is Storybook-only. One root `Toaster`. Product toasts pass title + description. Insights body consumes Examples/PitchKit creator Insights (`PageHeader`, `Stat` + Engagement rate info `Tooltip`, `Chart.Cartesian`, `Chart.RankedBars`, `Tab.Group`, `MoreMenu`, `AlertDialog`, `toast`). `npm test` fail-closes Pattern shell + owner gap tokens, identity nameplate / Settings card, owner proof `hidden_from_kit_at == null` partition, and Hide-from-kit `AlertDialog` dialog role. No AppShell / NavRail. Do not invent a Pitchkit Grid atom.
- **Charts:** WMDS `Chart` (visx peer). One 30-day account-reach area on `/insights` from `owner.reach_series` only. Insights + unusable series → State — insufficient reach data empty band (keep the Card; muted **Badge** “No data” → **No reach data yet**, title↔subtext `gap-2`). Partial calendar holes in a plottable window use Chart.Cartesian `noData` hatch (`null` / omitted days; `0` is plotted) — wire the Show-code `noData` label through `ComponentProps` so OpenNext typecheck does not depend on cached `ChartCartesianProps` including that key; do not invent hatch UI. Graph-unavailable → omit the optional region. First connect / `?grid=pulling` is Pattern — creator Insights (loading). Retrieving after chrome is up is Header + `Chart.Loading`. Daily reach plus a constant Typical reach reference from the existing `typicalReach` median + `Chart.Legend` (Pattern ReachCard). No Stat `trend` deltas. Audience uses `Chart.RankedBars`; empty mixes keep the Audience Card with State — insufficient audience data (muted **Badge** “No data” → `No audience data yet`, title↔subtext `gap-2`). Both empties can show at once. Never EXAMPLE percents. Never zero-fill. Live public kits receive `reach_series` + audience for the compact shareable Reach Card and top 3 countries; `/k/demo` still omits the series (insufficient empty well). No Nivo in Pitchkit `package.json`.
- **Seed:** In-repo rows match [DATA.md](./DATA.md). `TOKEN_KEY` not required (seed tokens are null). Disconnect stamps `disconnected_at` + nulls tokens on the KV Graph snapshot (`writeGraphSnapshot`); SQL + R2 purge still waits on Hyperdrive. Public `/k/demo` has no Insights (`reach_series` omitted) and stays the shared seed (no snapshot → persist is a no-op). Owner Insights seed includes example `reach_series` when no token (not a SQL table). Never operator `IG_USER_TOKEN` for seed `demo`. Live OAuth token replaces that with a Graph poll.

---

## What each box does

| Piece | Role |
|---|---|
| Workers / OpenNext | All HTML and APIs. Sets the httpOnly session cookie. Encrypts tokens with `TOKEN_KEY` before SQL (or KV snapshot until Hyperdrive). Postgres client is `postgres` (postgres.js) on `env.HYPERDRIVE.connectionString` — fresh client per request, parameterized `$1` queries, no ORM (`lib/postgres.ts`). OpenNext typecheck asserts those rows through `unknown` (`asQueryRows`) because postgres.js `Row & Iterable<Row>` does not overlap a caller `T extends SqlQueryRow`. `/auth/instagram` is Instagram Business Login when app secrets exist; otherwise stub `pitchkit_session` for seed `demo`. When live secrets exist, leftover seed `demo` is not a signed-in owner (`resolveSession` null). Failed OAuth finish clears that cookie. `writeGraphSnapshot` tries SQL then KV `graph:` (never refuse KV solely because Hyperdrive is bound; thrown SQL returns false and still takes KV); false does not set the cookie (`/?error=persist`). After a true write, set `pitchkit_session` to the in-memory handle on a single `Set-Cookie` — do not re-read via `resolveSession`. Live finish never assigns that handle as `demo` when `/me` username is not `demo` (escape a snapshot stuck on `demo`). Distinct landing errors: `oauth_state` / `oauth_exchange` / `oauth_me` / `personal` / `oauth_poll` / `persist`. Poll-fail after `/me` persists a minimal snapshot and still logs in. Landing shows the quiet demo-session line only on the stub path. A resolvable session on `GET /` redirects to `/insights`. `/auth/sign-out` clears the session and `pitchkit_hidden` (kit stays public). `/auth/disconnect` does that plus stamps `disconnected_at` and nulls token fields (SQL when Hyperdrive is bound; else the KV Graph snapshot) so we stop polling; `assemblePublicKit` then 404s `/k/[handle]`. Hide/restore: `POST /api/media/hide` and `POST /api/media/restore` (`{ mediaId }` → `{ mediaId, hiddenFromKitAt }`). Seed SoT is KV `HIDDEN_KIT` until Hyperdrive; Graph snapshots reuse that binding under `graph:` keys when Hyperdrive is absent. When the binding is present, SQL is preferred SoT for `users` / `media` / `hidden_from_kit_at` (`reach_series` + audience stay `graph:payload:` extras); a failed SQL upsert still writes the KV `graph:` snapshot so OAuth can persist. httpOnly `pitchkit_hidden` is the owner reload mirror so anon `/k/[handle]` sees hides across isolates. FE calls the routes only (no localStorage). Owner Insights partitions `hidden_from_kit_at` so reload **"N shown"** excludes hidden rows; Hidden + Restore chrome stay. Workers Builds non-prod is `npx wrangler versions upload`; `wrangler.jsonc` `build.command` is `npx opennextjs-cloudflare build` so `.open-next/worker.js` exists. |
| Instagram | Login and Graph **only while the creator is connecting or we are polling**. Host `graph.instagram.com`. Pin `GRAPH_API_VERSION` (v25.0). No webhooks in v1. Stub connect does not call Graph. Poll: `GET /me`, one `/media` page, per-media `/insights` (`reach,views,saved,shares`), user `reach` `time_series`, `follower_demographics`. |
| Hyperdrive → Supabase | Live SoT when bound: `users`, `media`, empty `detections` and `weekly_counts`. Host is **Supabase Postgres**. Bindings: `HYPERDRIVE` / `HYPERDRIVE_PREVIEW` (commented out in `wrangler.jsonc` until SQL persist is fixed; both use Hyperdrive config `pitchkit`, id `bf225442516d44f599e083b72df886cd`; same id for preview MVP). Origin URI is the Supabase **direct** connection (port 5432), not the transaction pooler (6543). Workers use postgres.js on `env.HYPERDRIVE.connectionString` — not `@supabase/supabase-js`. Detection is explicit (`lib/hyperdrive.ts`) — missing / empty `connectionString` keeps the KV + seed path. Until a request has a non-empty binding `connectionString`, `/k/demo` and `/insights` read `lib/seed.ts` — same types as live. Schema SQL: `db/*.sql` via `npm run db:apply`. |
| R2 `pitchkit-media` | Bytes. Public read for kit objects. Keys on `avatar_r2_key` / `r2_key`. Prefix `{user_id}/`. |
| `/k/[handle]` | Last stored snapshot. Handle frozen at first connect by default. Optional WHA-313 URL update on reconnect if the Instagram username differs (default = keep; old path 404s, no redirect). If the token is dead, this page still works. |
| Cloudflare / Support | randy@whatmatters.so until we change it |

---

## What is not in this picture (on purpose)

D1, Vercel, shadcn, queues, Browser Run, Workers AI, Storybook in Pitchkit, a second database, TikTok, PDF, signed URLs for kit images, live Graph on the public kit.

---

## Delete

Owner disconnect → Worker deletes Supabase rows for that creator and R2 `{user_id}/` within 24 hours. Public kit 404s. Anonymous `weekly_counts` may remain.
