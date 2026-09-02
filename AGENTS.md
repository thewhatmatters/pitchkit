# Pitchkit

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Creator media kits at **pitchkit.app**. Humans start at [README.md](./README.md). Spec: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md). Columns: [DATA.md](./DATA.md). Stats vocabulary: [GLOSSARY.md](./GLOSSARY.md).

## Product lock

- Kit URL: `pitchkit.app/k/[handle]`. Public on first successful connect. Handle frozen; IG rename does not move our URL. Missing/disconnected → 404.
- Instagram is login (Professional only). Pitchkit session = httpOnly cookie.
- Connect **before** the button (`disclosure_version` = 1):

  > We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

- After login: **Insights**, then Media kit tab. Brands never see Insights.
- **v1 stats (User Research + Design, 2026-09-02; Graph v25 Instagram Login):** [GLOSSARY.md](./GLOSSARY.md) is the vocabulary. Name/handle is the headline; followers are scale. Stat row: ER (always, `primary`), typical reach (Insights), Followers (always), Saves (Insights), then 30-day reach chart (not a Stat). **2** without Insights (ER + Followers), **4 + chart** with Insights. Don’t pad to five. ER stays `(likes + comments) ÷ followers`. Tooltip of followers. Insights ER **pending Randy** (UR wants +saves+shares in the numerator, still ÷ followers; Later uses ÷ reach). Followers: user `followers_count` (store `followers`). Likes/comments: media `like_count` / `comments_count` — not insights. Typical reach: media insights `reach` (lifetime, unique; median). Typical saves: media insights `saved` (FEED/REELS) — not account `saves`, not `saved_count`. Rank: insights `saved` → insights `reach` → field `like_count`. Chart: `GET /{ig-user-id}/insights?metric=reach&period=day&metric_type=time_series` — account unique reach (includes stories/ads), **different number** from typical post `reach`. Shares: media insights `shares` (not `shares_count`). `impressions` deprecated v22+ (21 Apr 2025) — don’t paint. `views` ≠ `reach`. Graph returns empty, not 0. Empty > zeros. Six posts: last 30 days, **saves → reach → likes**. Posts stay **2×3**. Own objects, Insights only, hide if missing: country + city mix = ranked % bars or a short ranked list — **not a map**; Graph is names + counts, not lat/lng; do not geocode; sample is top 45 and can sum under `followers_count`; % of located sample, not of all followers. Age = API brackets as bars (don’t invent bands). Gender = what Meta returns (don’t add buckets). Audience city ≠ hometown. Bio locked: IG User `biography` if present, hide if empty — not a typed Later blurb. Industry and creator location still unsourced. Website only if sourced (`website`, hide if empty). Skip rates. Table stories. Brand on `/k/[handle]`: spend or pass in ~30s. Creator: same numbers, labeled, survive a grid check.
- Carousel: first frame. Video: poster only. R2 public read for kit images.
- Disconnect: delete SQL + R2 `{user_id}/` within 24 hours. `consent_index` default off.
- Scopes: `instagram_business_basic` + `instagram_business_manage_insights` only.
- Postgres: [DATA.md](./DATA.md). Empty `detections` and `weekly_counts`. Stub and live OAuth use the same schema.
- `TOKEN_KEY` is a Workers secret. Never git.
- Cloudflare and Support (for now): **randy@whatmatters.so**. Neon region: pick when we create the database.
- **UI:** `@whatmatters/wmds` (pattern-first, import `styles.css`). Layout Tailwind only. Lucide via WMDS. No shadcn. No Storybook in this repo. Install from `../wmds` or `github:thewhatmatters/wmds`; build WMDS `dist/` first.
- **App:** Next.js App Router, TypeScript, Tailwind v4, official OpenNext on Workers. Charts: CSS — Randy overwrote this with Nivo in WMDS (Chart ships in WMDS first; do not implement Nivo here).

## Do not build

CV, TikTok, PDF, brand dashboard, kit-view analytics for sale, Browser Run, D1, Vercel, shadcn, Storybook here, rates/contact, creator location, industry, Stories, map/geocode, impressions (deprecated v22+; don’t paint) on the kit.

Do not add Graph columns we do not get from public posts + Insights. Do not invent rules that contradict [PLAN.md](./PLAN.md) or [GLOSSARY.md](./GLOSSARY.md).

## After each turn

Locks → [PLAN.md](./PLAN.md). Picture → [ARCHITECTURE.md](./ARCHITECTURE.md). Columns → [DATA.md](./DATA.md). Stats words → [GLOSSARY.md](./GLOSSARY.md). Humans → [README.md](./README.md).
