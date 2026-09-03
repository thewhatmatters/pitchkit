# Pitchkit

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Creator media kits at **pitchkit.app**. Humans start at [README.md](./README.md). Spec: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md). Columns: [DATA.md](./DATA.md). Stats vocabulary: [GLOSSARY.md](./GLOSSARY.md). Kit-space SWOT SoT: [SWOT.md](./SWOT.md). Free-promise / lights-on SoT: [LIGHTS-ON.md](./LIGHTS-ON.md).

## Product lock

- Kit URL: `pitchkit.app/k/[handle]`. Public on first successful connect. Handle frozen; IG rename does not move our URL. Missing/disconnected → 404.
- Instagram is login (Professional only). Pitchkit session = httpOnly cookie.
- Connect **before** the button (`disclosure_version` = 1):

  > We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

- After login: **Insights**, then Media kit tab. Brands never see Insights.
- **v1 stats (User Research + Design, 2026-09-02; Graph v25 Instagram Login):** [GLOSSARY.md](./GLOSSARY.md) + [PLAN.md](./PLAN.md) are the bench. Lead pair: **Followers (context) + ER (hire)** as numbers, not Later’s prose sentence. ER locked: `(likes + comments) ÷ followers` (Insights or not). Tooltip: **of followers**, **likes + comments only**. Do not use ÷ reach. Do not add saves/shares to the numerator. **Later vs us (note, not a lock flip):** Later kit period is 90 days — we locked a 30-day reach chart. Later ER is `(likes+comments+saves+shares) ÷ (reel reach + post reach)` — we do not use that. Later labels “Average” but docs say median for post/story stats; our typical reach is already median. Later lists profile views, avg impressions, stories, reels as sections — we skip those. No posts in 90 days → Later omits (not zeros); same: empty > zeros. **Live Graph (Backend confirmed, Instagram Login):** do not use media object `saved_count` / `shares_count` (Facebook Login only). Post kit: media insights `saved` / `shares` / `reach`. Account chart: user insights `reach` `time_series` (stories + ads) ≠ typical post `reach`. Account-level saves, if ever labeled: user insights `saves`, not `saved`. Empty dataset over zeros. Don’t pad to five. Stat row: ER (always, `primary`), typical reach (Insights), Followers (always), Saves (Insights), then 30-day reach chart (not a Stat). **2** without Insights, **4 + chart** with Insights. Surface typical reach, saves, 30-day chart (Later buries these; we don’t). Analytics only after Insights. 30-day chart, not Later’s 3-month overview. Chart = account unique reach (includes stories/ads) ≠ typical post `reach`. Six posts: **saves → reach → likes**, auto-selected from recent media (empty kit if they pick from scratch is a fail; no likes-first re-rank; no uploaded highlights gallery in v1). Hide when missing. No zeros. `follower_demographics` (`country` / `city` / `age` / `gender`) is live v25/v26 Insights. ≥100 followers or metric omitted — hide the object; don’t paint zeros. Empty dataset: hide. Top 45. Graph counts in `total_value.breakdowns.results.value`, not percents. Our % = `value / sum(results)` of the located sample — **never** % of `followers_count`. Age + gender still v1 (Randy; not skipped). City mix is the finer country job. IG User `biography` / `website` are Public; hide if empty. No IG User location. No industry. Impressions stay off. Backend persists demo counts as objects; no extra Graph columns. **Skip:** Rates / From $100 / Contact Me; Stories as a kit section; profile views + bio-link clicks in the overview; average likes as a Stat; stats as a prose paragraph; gallery/themes/colors; impressions (deprecated); industry unless sourced; bio / creator location only if sourced from IG (hide if empty). Brand on `/k/[handle]`: spend or pass in ~30s. Creator: same numbers, labeled, survive a grid check.
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

Locks → [PLAN.md](./PLAN.md). Picture → [ARCHITECTURE.md](./ARCHITECTURE.md). Columns → [DATA.md](./DATA.md). Stats words → [GLOSSARY.md](./GLOSSARY.md). Kit-space SWOT → [SWOT.md](./SWOT.md). Free promise → [LIGHTS-ON.md](./LIGHTS-ON.md). Humans → [README.md](./README.md).
