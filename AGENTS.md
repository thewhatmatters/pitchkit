# Pitchkit

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Creator media kits at **pitchkit.app**. Humans start at [README.md](./README.md). Spec: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md). Columns: [DATA.md](./DATA.md). Stats vocabulary: [GLOSSARY.md](./GLOSSARY.md).

## Product lock

- Kit URL: `pitchkit.app/k/[handle]`. Public on first successful connect. Handle frozen; IG rename does not move our URL. Missing/disconnected → 404.
- Instagram is login (Professional only). Pitchkit session = httpOnly cookie (`pitchkit_session`). Stub Continue GET/POST `/auth/instagram` sets it for seed `demo` (not an Instagram token; seed tokens stay null). `/insights` without the cookie → `/`. Sign out `/auth/sign-out` clears it. Reconnect re-sets the same seed session. Disconnect control does not live-delete yet. `/k/[handle]` is public (no cookie).
- Connect **before** the button (`disclosure_version` = 1):

  > We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

- After login: **Insights** inventory (no Insights / Media kit tabs). Copy / share stay as buttons. Brands never see Insights. `/insights` dumps locked kit objects (WHA-299) as stacked Cards — not a look lock, not on `/k/[handle]`. Do not also paint StatsGrid / ChartSlot / a six-post grid above that dump. GLOSSARY first sentence only when the term exists. Example geo/age/gender/reach/saves stay in-file (`lib/inventory.ts`). Identity reads seed `name` / handle / avatar / `fetched_at`. Contact and past brands are empty typed holes. Seed Insights stay null.
- Six posts: last 30 days, **saves then reach then likes**. ER: `(likes + comments) / followers` on those six; if Insights missing, still show ER, hide reach/saves/chart.
- Carousel: first frame. Video: poster only. R2 public read for kit images.
- Disconnect: delete SQL + R2 `{user_id}/` within 24 hours. `consent_index` default off.
- Scopes: `instagram_business_basic` + `instagram_business_manage_insights` only.
- Postgres: [DATA.md](./DATA.md). Empty `detections` and `weekly_counts`. Stub and live OAuth use the same schema. SQL in `db/`. Until Hyperdrive exists, `/k/demo` and `/insights` read `lib/seed.ts` (same types). Handle `demo` is frozen.
- `TOKEN_KEY` is a Workers secret. Never git. Not required for the seed (tokens stay null). Disconnect columns exist; no live delete yet.
- Cloudflare and Support (for now): **randy@whatmatters.so**. Neon region: pick when we create the database.
- **UI:** `@whatmatters/wmds` (pattern-first, import `styles.css`). Layout Tailwind only. Lucide via WMDS. No shadcn. No Storybook in this repo. Install from `github:thewhatmatters/wmds` (CI cannot use `../wmds`); `prepare` builds `dist/`.
- **App:** Next.js App Router, TypeScript, Tailwind v4, official OpenNext on Workers. Charts: Nivo via WMDS Chart (not CSS, not in this app yet).

## Do not build

CV, TikTok, PDF, brand dashboard, kit-view analytics for sale, Browser Run, D1, Vercel, shadcn, Storybook here, bio/website/rates/contact/geo on the kit.

Do not add Graph columns we do not get from public posts + Insights. Do not invent rules that contradict [PLAN.md](./PLAN.md). The Insights inventory does not add bio/website/geo columns.

## After each turn

Locks → [PLAN.md](./PLAN.md). Picture → [ARCHITECTURE.md](./ARCHITECTURE.md). Columns → [DATA.md](./DATA.md). Stats words → [GLOSSARY.md](./GLOSSARY.md). Humans → [README.md](./README.md).
