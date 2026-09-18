# Pitchkit architecture

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Living picture of v1. Product: [PLAN.md](./PLAN.md). Columns: [DATA.md](./DATA.md).

The Phase 0 diagram is **mostly right**: Next.js on Cloudflare Workers, Instagram Login + Graph, Neon through Hyperdrive, photos in R2, public kit at `/k/[handle]`, never put image bytes in SQL.

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
  PG[(Neon Postgres via Hyperdrive)]
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
            → Neon via Hyperdrive        = rows
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
- **Install WMDS:** pin `github:thewhatmatters/wmds#dc813326028c0fe1cc5f3719466a32607bab4504` (CI cannot use `../wmds`). Local `../wmds` still works; `prepare` builds `dist/`. `@visx/visx` is the Chart peer. Cookie-gated Insights copies Pattern — creator Insights Show code (`examples-pitchkit--creator-insights`: `CREATOR_INSIGHTS_PAGE_CLASS` + hug `SegmentedControl` in a three-column PitchKit / control / Avatar header; PitchKit segment is an in-page Coming soon placeholder). Public `/k/[handle]` copies Pattern — shareable PitchKit (`examples-pitchkit--shareable-pitchkit`). Settings / landing keep `AppFrame` `OWNER_GRID_CLASS` with Tailwind `[--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]`. `GridOverlay` is Storybook-only. One root `Toaster`. Product toasts pass title + description. Insights body consumes Examples/PitchKit creator Insights (`PageHeader`, `Stat`, `Chart.Cartesian`, `Chart.RankedBars`, `Tab.Group`, `MoreMenu`, `AlertDialog`, `toast`). `npm test` fail-closes Pattern shell + owner gap tokens, owner proof `hidden_from_kit_at == null` partition, and Hide-from-kit `AlertDialog` dialog role. No AppShell / NavRail. Do not invent a Pitchkit Grid atom.
- **Charts:** WMDS `Chart` (visx peer). One 30-day account-reach area on `/insights` from `owner.reach_series` only. Insights + unusable series → State — insufficient reach data empty band (keep the Card; **No reach data yet**). Graph-unavailable → omit the optional region. First connect / `?grid=pulling` is Pattern — creator Insights (loading). Retrieving after chrome is up is Header + `Chart.Loading`. Daily reach plus a constant Typical reach reference from the existing `typicalReach` median + `Chart.Legend` (Pattern ReachCard). No Stat `trend` deltas. Audience uses `Chart.RankedBars`; empty mixes keep the Audience Card with an insufficient-data well (Reach empty tokens until WMDS ships a dedicated Pattern). Never EXAMPLE percents. Never zero-fill. Public kit never receives the series. No Nivo in Pitchkit `package.json`.
- **Seed:** In-repo rows match [DATA.md](./DATA.md). `TOKEN_KEY` not required (seed tokens are null). Disconnect columns exist; no live delete yet. Public `/k/demo` has no Insights (`reach_series` omitted). Owner Insights seed includes example `reach_series` when no token (not a SQL table). Live token replaces that with a Graph poll.

---

## What each box does

| Piece | Role |
|---|---|
| Workers / OpenNext | All HTML and APIs. Sets the httpOnly session cookie. Encrypts tokens with `TOKEN_KEY` before SQL (or KV snapshot until Hyperdrive). `/auth/instagram` is Instagram Business Login when app secrets exist; otherwise stub `pitchkit_session` for seed `demo`. Landing shows the quiet demo-session line only on the stub path. `/auth/sign-out` clears the session and `pitchkit_hidden`. Hide/restore: `POST /api/media/hide` and `POST /api/media/restore` (`{ mediaId }` → `{ mediaId, hiddenFromKitAt }`). Seed SoT is KV `HIDDEN_KIT` until Neon; Graph snapshots reuse that binding under `graph:` keys. httpOnly `pitchkit_hidden` is the owner reload mirror so anon `/k/[handle]` sees hides across isolates. FE calls the routes only (no localStorage). Owner Insights partitions `hidden_from_kit_at` so reload **"N shown"** excludes hidden rows; Hidden + Restore chrome stay. Workers Builds non-prod is `npx wrangler versions upload`; `wrangler.jsonc` `build.command` is `npx opennextjs-cloudflare build` so `.open-next/worker.js` exists. |
| Instagram | Login and Graph **only while the creator is connecting or we are polling**. Host `graph.instagram.com`. Pin `GRAPH_API_VERSION` (v25.0). No webhooks in v1. Stub connect does not call Graph. Poll: `GET /me`, one `/media` page, per-media `/insights` (`reach,views,saved,shares`), user `reach` `time_series`, `follower_demographics`. |
| Hyperdrive → Neon | `users`, `media`, empty `detections` and `weekly_counts`. Bindings: `HYPERDRIVE` / `HYPERDRIVE_PREVIEW`. Until Hyperdrive exists, `/k/demo` and `/insights` read `lib/seed.ts` — same types as live. Schema SQL: `db/*.sql`. |
| R2 `pitchkit-media` | Bytes. Public read for kit objects. Keys on `avatar_r2_key` / `r2_key`. Prefix `{user_id}/`. |
| `/k/[handle]` | Last stored snapshot. Handle frozen at first connect by default. Optional WHA-313 URL update on reconnect if the Instagram username differs (default = keep; old path 404s, no redirect). If the token is dead, this page still works. |
| Cloudflare / Support | randy@whatmatters.so until we change it |

---

## What is not in this picture (on purpose)

D1, Vercel, shadcn, queues, Browser Run, Workers AI, Storybook in Pitchkit, a second database, TikTok, PDF, signed URLs for kit images, live Graph on the public kit.

---

## Delete

Owner disconnect → Worker deletes Neon rows for that creator and R2 `{user_id}/` within 24 hours. Public kit 404s. Anonymous `weekly_counts` may remain.
