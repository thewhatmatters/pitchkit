# Pitchkit

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Creator media kits at **pitchkit.app**. Humans start at [README.md](./README.md). Spec: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md). Columns: [DATA.md](./DATA.md). Stats vocabulary: [GLOSSARY.md](./GLOSSARY.md).

## Product lock

- Kit URL: `pitchkit.app/k/[handle]`. Public on first successful connect. Handle frozen; IG rename does not move our URL. Missing/disconnected → 404.
- Instagram is login (Professional only). Pitchkit session = httpOnly cookie.
- Connect **before** the button (`disclosure_version` = 1):

  > We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

- After login: **Insights**, then Media kit tab. Brands never see Insights.
- **v1 stats (User Research + Design, 2026-09-02; Graph v25 Instagram Login):** [GLOSSARY.md](./GLOSSARY.md) + [PLAN.md](./PLAN.md) are the bench. Lead pair: **Followers (context) + ER (hire)** as numbers, not Later’s prose sentence. Don’t overwrite ER until Randy answers the widget. Shipped ER: `(likes + comments) ÷ followers`. Don’t pad to five. Stat row: ER (always, `primary`), typical reach (Insights), Followers (always), Saves (Insights), then 30-day reach chart (not a Stat). **2** without Insights, **4 + chart** with Insights. Surface typical reach, saves, 30-day chart (Later buries these; we don’t). Analytics only after Insights. 30-day chart, not Later’s 3-month overview. Chart = account unique reach (includes stories/ads) ≠ typical post `reach`. Six posts: **saves → reach → likes**. Randy unlocked country, age, gender mix as own objects (`follower_demographics`); city mix is the finer country job — not “no geo in v1,” not “countries only.” Insights only; ≥100 followers; empty copy, not zeros. Country = top countries + %. Age = API brackets. Gender = what Meta returns. **Skip:** Rates / From $100 / Contact Me; Stories as a kit section; profile views + bio-link clicks in the overview; average likes as a Stat; stats as a prose paragraph; gallery/themes/colors; impressions (deprecated); industry unless sourced; bio / creator location only if sourced from IG (hide if empty). Brand on `/k/[handle]`: spend or pass in ~30s. Creator: same numbers, labeled, survive a grid check.
- Carousel: first frame. Video: poster only. R2 public read for kit images.
- Disconnect: delete SQL + R2 `{user_id}/` within 24 hours. `consent_index` default off.
- Scopes: `instagram_business_basic` + `instagram_business_manage_insights` only.
- Postgres: [DATA.md](./DATA.md). Empty `detections` and `weekly_counts`. Stub and live OAuth use the same schema.
- `TOKEN_KEY` is a Workers secret. Never git.
- Cloudflare and Support (for now): **randy@whatmatters.so**. Neon region: pick when we create the database.
- **UI:** `@whatmatters/wmds` (pattern-first, import `styles.css`). Layout Tailwind only. Lucide via WMDS. No shadcn. No Storybook in this repo. Install from `../wmds` or `github:thewhatmatters/wmds`; build WMDS `dist/` first.
- **App:** Next.js App Router, TypeScript, Tailwind v4, official OpenNext on Workers. Charts: CSS — Randy overwrote this with Nivo in WMDS (Chart ships in WMDS first; do not implement Nivo here).

## Do not build

CV, TikTok, PDF, brand dashboard, kit-view analytics for sale, Browser Run, D1, Vercel, shadcn, Storybook here. Later skip: Rates / From $100 / Contact Me, Stories as a kit section, profile views + bio-link clicks, average likes as a Stat, stats as prose, gallery/themes/colors, impressions, industry unless sourced, map/geocode.

Do not add Graph columns we do not get from public posts + Insights. Do not invent rules that contradict [PLAN.md](./PLAN.md) or [GLOSSARY.md](./GLOSSARY.md).

## After each turn

Locks → [PLAN.md](./PLAN.md). Picture → [ARCHITECTURE.md](./ARCHITECTURE.md). Columns → [DATA.md](./DATA.md). Stats words → [GLOSSARY.md](./GLOSSARY.md). Humans → [README.md](./README.md).
