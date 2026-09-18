# Pitchkit

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Creator media kits at **pitchkit.app**. Humans start at [README.md](./README.md). Spec: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md). Columns: [DATA.md](./DATA.md). Stats vocabulary: [GLOSSARY.md](./GLOSSARY.md).

## Product lock

- Kit URL: `pitchkit.app/k/[handle]`. Public on first successful connect. Handle frozen by default; IG rename does not move our URL unless they opt in on reconnect (WHA-313: **Update kit URL to @{new}**; default = keep; old `/k/…` 404s; collision `-2`; keep `.` `_`). Missing/disconnected → 404.
- Instagram is login (Professional only — Business **or** Creator; Personal cannot power Insights; `/?error=personal` + PROFESSIONAL copy). Pitchkit session = httpOnly cookie (`pitchkit_session`). Stub Continue GET/POST `/auth/instagram` sets it for seed `demo` (not an Instagram token; seed tokens stay null). `/insights` without the cookie → `/`. Sign out `/auth/sign-out` clears it. Reconnect re-sets the same seed session (no WHA-313 rename UI on the stub). Disconnect control does not live-delete yet. `/k/[handle]` is public (no cookie).
- Connect **before** the button (`disclosure_version` = 1):

  > We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

  Landing CTA is disclosure + Professional note + **Continue with Instagram**. One quiet demo-session line under the button is OK (`DEMO_SESSION_NOTE`). Do not lead with stub-token / “no Instagram token” language. Stub `/auth/instagram` still sets the seed `demo` session — no live OAuth.

- After login: **Insights**. Chrome copies WMDS Pattern — creator Insights **live Storybook canvas** (`pitchKitStyles.ts`; Show code is stale): `<main className="grid-page min-h-screen bg-body [--grid-column-gap:8px] [--grid-max:1140px] [padding-bottom:44px]">`, header `band pb-4` with three-column `grid-cols-[1fr_auto_1fr]` (PitchKit label + default hug `SegmentedControl` + Avatar in a `justify-self-end` span), body `band pt-6 sm:pt-8` / inner `band min-w-0 gap-y-6 sm:gap-y-8`. Cookie-gated owner `/k/[handle]` uses the same header. No `layout="stretch"`, no `w-full` on the control, no AppFrame `min-h-dvh py-6` surface on those pages. `GridOverlay` and `ExampleGridControls` stay Storybook-only. One `<Toaster position="bottom-right" />` at `app/layout.tsx`. Insights body matches the canvas: `PageHeader`, four-up `Stat` (`col-span-2 md:col-span-4 lg:col-span-3`, no `w-full min-w-0`), outlined `Chart.Cartesian` + `Chart.RankedBars`, **Recent proof** via `Tab.Group`, `MoreMenu` + `AlertDialog` hide + `toast.add()` Undo through `hideFromKit(mediaId)` / `restoreToKit(mediaId)` (`POST /api/media/hide` + `POST /api/media/restore`). Spell **Engagement rate** (never “ER”). No invented trends. Hide empty chart series and empty audience mixes. No AppShell. Account is a quiet footer link to `/settings`. Brands never see Insights. Public `/k/demo` omits `reach_series`. Owner demo includes seed/example Insights + `reach_series`. Settings / landing / public kit stay on `AppFrame` (`OWNER_GRID_CLASS` still forces `[--grid-gutter:8px]`).
- `/k/[handle]` (and `/k/demo`) is the public kit. Owner Edit is a toggle on that same URL when the session cookie owns the handle (contact + past brands). Share link stays view. Past brands = wrap WMDS `Chip` names; hide empty; no marquee. Settings (`/settings`) is account only.
- Six posts: last 30 days, **saves then reach then likes**. ER: `(likes + comments) / followers` on those six; if Insights missing, still show ER, hide reach/saves/chart.
- Hide from kit: `media.hidden_from_kit_at`. Public kit excludes hidden **before** `selectSixPosts`. Owner Insights includes all rows with the timestamp. ProofPosts partitions on init and when `posts` change: **"N shown"** + rank = `hidden_from_kit_at == null`; Hidden rows stay with Restore. `POST /api/media/hide` and `/api/media/restore` `{ mediaId }`, owner session only. Seed SoT is KV `HIDDEN_KIT` until Neon; httpOnly `pitchkit_hidden` is the owner reload mirror (public kit reads KV with no visitor cookie). No localStorage.
- Carousel: first frame. Video: poster only. R2 public read for kit images.
- Disconnect: delete SQL + R2 `{user_id}/` within 24 hours. `consent_index` default off.
- Scopes: `instagram_business_basic` + `instagram_business_manage_insights` only.
- Postgres: [DATA.md](./DATA.md). Empty `detections` and `weekly_counts`. Stub and live OAuth use the same schema. SQL in `db/`. Until Hyperdrive exists, `/k/demo` and `/insights` read `lib/seed.ts` (same types). Handle `demo` is frozen.
- `TOKEN_KEY` is a Workers secret. Never git. Not required for the seed (tokens stay null). Disconnect columns exist; no live delete yet.
- Cloudflare and Support (for now): **randy@whatmatters.so**. Neon region: pick when we create the database.
- **UI:** `@whatmatters/wmds` (pattern-first, import `styles.css`). Layout Tailwind only (`grid-page` + `band` from CONSUMING). Cookie-gated Insights / owner kit copy Pattern — creator Insights live Storybook canvas (hug `SegmentedControl` in a three-column header). Settings / public `AppFrame` still uses Tailwind `[--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]`. Do not mount `GridOverlay` in product chrome. Do not invent a Pitchkit Grid atom. Do not compose AppShell. Lucide via WMDS. No shadcn. No Storybook in this repo. Pin `github:thewhatmatters/wmds#73277bab5bd3ffc8dff678c12d4cdbc415b07a35`. After install, copy Geist into `node_modules/@whatmatters/wmds/dist/files`.
- **App:** Next.js App Router, TypeScript, Tailwind v4, official OpenNext on Workers. Workers Builds non-prod is `npx wrangler versions upload`; `wrangler.jsonc` `build.command` runs `npx opennextjs-cloudflare build` first. Charts: WMDS `Chart` only (`@visx/visx` peer). No Nivo in this `package.json`.
- **Verify:** project-local skill [`.cursor/skills/verify-pitchkit/`](./.cursor/skills/verify-pitchkit/SKILL.md). Feature map in `features/`. Prefer live https://pitchkit.app. Dry-run: `control-pitchkit doctor` → drive `insights-overview` → evidence under `artifacts/insights-overview/`.

## Do not build

CV, TikTok, PDF, brand dashboard, kit-view analytics for sale, Browser Run, D1, Vercel, shadcn, Storybook here, bio/website/rates/contact/geo on the kit.

Do not add Graph columns we do not get from public posts + Insights. Do not invent rules that contradict [PLAN.md](./PLAN.md). Do not invent WMDS atoms here.

## After each turn

Locks → [PLAN.md](./PLAN.md). Picture → [ARCHITECTURE.md](./ARCHITECTURE.md). Columns → [DATA.md](./DATA.md). Stats words → [GLOSSARY.md](./GLOSSARY.md). Humans → [README.md](./README.md).
