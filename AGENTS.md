# Pitchkit

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [AGENTS](./AGENTS.md)

Creator media kits at **pitchkit.app**. Humans start at [README.md](./README.md). Spec: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md). Columns: [DATA.md](./DATA.md).

## Product lock

- Kit URL: `pitchkit.app/k/[handle]`. Public on first successful connect. Handle frozen; IG rename does not move our URL. Missing/disconnected → 404.
- Instagram is login (Professional only). Pitchkit session = httpOnly cookie.
- Connect **before** the button (`disclosure_version` = 1):

  > We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

- After login: **Insights**, then Media kit tab. Brands never see Insights.
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

Do not add Graph columns we do not get from public posts + Insights. Do not invent rules that contradict [PLAN.md](./PLAN.md).

## After each turn

Locks → [PLAN.md](./PLAN.md). Picture → [ARCHITECTURE.md](./ARCHITECTURE.md). Columns → [DATA.md](./DATA.md). Humans → [README.md](./README.md).
