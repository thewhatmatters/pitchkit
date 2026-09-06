# Pitchkit

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Creator media kits at **pitchkit.app**. Humans start at [README.md](./README.md). Spec: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md). Columns: [DATA.md](./DATA.md). Stats vocabulary: [GLOSSARY.md](./GLOSSARY.md).

## Product lock

- Kit URL: `pitchkit.app/k/[handle]`. Public on first successful connect. Handle frozen; IG rename does not move our URL. Missing/disconnected → 404.
- Instagram is login (Professional only). Pitchkit session = httpOnly cookie (`pitchkit_session`). Stub Continue GET/POST `/auth/instagram` sets it for seed `demo` (not an Instagram token; seed tokens stay null). `/insights` without the cookie → `/`. Sign out `/auth/sign-out` clears it. Reconnect re-sets the same seed session. Disconnect control does not live-delete yet. `/k/[handle]` is public (no cookie).
- Connect **before** the button (`disclosure_version` = 1):

  > We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

- After login: **Insights**, then Media kit tab (same public card + copy/share). Brands never see Insights. `/insights` is Graph-only: WMDS Stat row (Followers + ER always; typical reach/saves only when present), one WMDS Chart from `owner.reach_series` when that field is non-empty and the area can paint. Hide the entire Chart band (title + slot) when omitted, `[]`, or no ink — never a header-only empty box. Never zero-fill. No contact/past-brands holes on Insights. Public `/k/demo` (`loadPublicKit`) omits `reach_series`. Owner demo (`loadOwnerKit("demo")`) includes seed/example post Insights + ~30 labeled `reach_series` points (not live Graph).
- `/k/[handle]` (and `/k/demo`) is the public kit. Owner Edit is a toggle on that same URL when the session cookie owns the handle (contact + past brands). Share link stays view. Past brands = wrap WMDS `Chip` names; hide empty; no marquee. Settings (`/settings`) is account only.
- Six posts: last 30 days, **saves then reach then likes**. ER: `(likes + comments) / followers` on those six; if Insights missing, still show ER, hide reach/saves/chart.
- Carousel: first frame. Video: poster only. R2 public read for kit images.
- Disconnect: delete SQL + R2 `{user_id}/` within 24 hours. `consent_index` default off.
- Scopes: `instagram_business_basic` + `instagram_business_manage_insights` only.
- Postgres: [DATA.md](./DATA.md). Empty `detections` and `weekly_counts`. Stub and live OAuth use the same schema. SQL in `db/`. Until Hyperdrive exists, `/k/demo` and `/insights` read `lib/seed.ts` (same types). Handle `demo` is frozen.
- `TOKEN_KEY` is a Workers secret. Never git. Not required for the seed (tokens stay null). Disconnect columns exist; no live delete yet.
- Cloudflare and Support (for now): **randy@whatmatters.so**. Neon region: pick when we create the database.
- **UI:** `@whatmatters/wmds` (pattern-first, import `styles.css`). Layout Tailwind only (`grid-page` + `band` from CONSUMING). Owner chrome: WMDS `AppShell` / `AppShell.Body` / `AppShell.Mobile` with explicit `PageHeader` (do not compose NavRail + header). Lucide via WMDS. No shadcn. No Storybook in this repo. Pin `github:thewhatmatters/wmds#<sha>` (CI cannot use `../wmds`); `prepare` builds `dist/`. Current pin: `266f19cd173216b31ac691ecd31063734f0265e0` (2026-09-06 main, AppShell export). After install, copy Geist into `node_modules/@whatmatters/wmds/dist/files` (`postinstall` / `predev` / `prebuild`).
- **App:** Next.js App Router, TypeScript, Tailwind v4, official OpenNext on Workers. Charts: WMDS `Chart` only (`@visx/visx` peer). No Nivo in this `package.json`.

## Do not build

CV, TikTok, PDF, brand dashboard, kit-view analytics for sale, Browser Run, D1, Vercel, shadcn, Storybook here, bio/website/rates/contact/geo on the kit.

Do not add Graph columns we do not get from public posts + Insights. Do not invent rules that contradict [PLAN.md](./PLAN.md). Do not invent WMDS atoms here.

## After each turn

Locks → [PLAN.md](./PLAN.md). Picture → [ARCHITECTURE.md](./ARCHITECTURE.md). Columns → [DATA.md](./DATA.md). Stats words → [GLOSSARY.md](./GLOSSARY.md). Humans → [README.md](./README.md).
