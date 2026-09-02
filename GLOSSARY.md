# Pitchkit glossary

Desk research, interviews unrun. Locked with Design 2026-09-02. User Research owns the meanings; Design owns look. Tooltip = first sentence. Longer help can sit under the chart. Graph names below are **Backend-confirmed live** against Instagram Login Graph v25 (not Facebook Login). Empty dataset over zeros is correct.

**Live Graph stamp (Backend confirmed):**
- Media object `saved_count` / `shares_count` are **Facebook Login only** — Pitchkit uses Instagram Login; do not use those fields.
- Post kit: media insights `saved` / `shares` / `reach`.
- Account chart: user insights `reach` `time_series` (includes stories + ads). Different from typical post `reach`.
- If we ever label account-level saves: user insights `saves`, not `saved`.
- `follower_demographics` breakdowns `country` / `city` / `age` / `gender` are live (v25/v26 Insights, Instagram Login). ≥100 followers or the metric is omitted — hide the object; don’t paint zeros. Top 45 only. Graph returns integer counts in `total_value.breakdowns.results.value`, not percents. Our math: % of located sample = `value / sum(results)`. **Never** % of `followers_count` (sums can be less than followers because Meta only counts people with demo data). Empty dataset: hide the object. Backend persists those counts as objects when Insights lands; no extra Graph columns.
- IG User `biography` and `website` are Public. Hide if empty. No IG User location field. No industry. Impressions stay off.
- ER is locked: `(likes + comments) ÷ followers`, Insights or not. Tooltip: of followers, likes + comments only.

## v1 Stat row (ordered)

**Engagement rate (ER)** — always, `primary`.
Share of followers who interact with a typical post. Brands use this first: is the audience real, or a quiet list? Average recent posts: (likes + comments) ÷ followers. A smaller account with a high ER often beats a big one that nobody talks to.
- Brand ~30s: hire or pass — is the audience real?
- Hide: never (public kit still has it).
- Formula (locked): `(likes + comments) ÷ followers` on the six, when followers > 0. Same formula with or without Insights. Tooltip: **of followers**, **likes + comments only**. Do not use ÷ reach. Do not add saves/shares to the numerator.
- Graph (v25, Instagram Login): none; computed. Likes/comments are media `like_count` / `comments_count` — not insights. Followers denominator is user `followers_count` (store `followers`).

**Typical reach** — Insights only; hide if missing.
Unique accounts that usually see a post. This is what a brand is buying — not the follower total, not one viral. Median of recent posts, not a best-ever spike. If the public grid shows ~20k and the kit says 60k, the deal dies. Never paint 0.
- Brand ~30s: how many unique accounts usually see a post (what they buy).
- Hide: until Insights. Never paint 0.
- Graph (live, Instagram Login): media insights `reach` (post kit). Typical = median of recent posts. Not account 30-day unique. Not `followers_count`. Different number from the account chart (user insights `reach` `time_series`).

**Followers** — always, context.
Accounts following this profile right now. Scale only. Not how many people saw the last post. Read next to typical reach: a big follow with tiny reach is a warning.
- Brand ~30s: scale context / sanity vs reach.
- Hide: never.
- Graph (v25, Instagram Login): user `followers_count` (store `followers`). Not who saw the last post.

**Saves** — Insights only; hide if missing.
People who bookmarked a typical post to come back. Intent, not applause. Stronger commercial signal than a like. Never paint 0.
- Brand ~30s: was the post worth keeping (intent > likes).
- Hide: until Insights. Never paint 0.
- Graph (live, Instagram Login): media insights `saved`. Typical/median. Not user insights `saves`. Not media object `saved_count` (Facebook Login only).

**30-day chart** — Insights only; trend object, not a fifth Stat.
Reach over the last 30 days so a brand (and the creator before they share) can see typical vs a spike. Never paint an empty chart as zeros. This is **not** the same number as typical post reach.
- Brand ~30s: typical vs a spike before they share.
- Hide: until Insights. Empty > zeros.
- Graph (live, Instagram Login): user insights `reach` `time_series` (`GET /{ig-user-id}/insights?metric=reach&period=day&metric_type=time_series`) — account unique reach (includes stories + ads). **Different number** from typical post media insights `reach`.

**Six posts** — ranked saves → reach → likes.
Recent work a brand can match to the public grid. Likes-first would look like a vanity kit.
- Brand ~30s: proof that matches the grid.
- Hide: never if we have media.
- Graph (v25, Instagram Login): rank insights `saved` → insights `reach` → field `like_count`. `like_count` is public (not insights); `saved`/`reach` need Insights.

Row length follows the data: 2 without Insights (ER + Followers), 4 + chart with Insights. Don’t pad to five. Lead pair is **Followers (context) + ER (hire)** as numbers, not Later’s prose sentence.

## Later steal vs skip (UR + Randy, 2026-09-02)

**Steal**
- Followers (context) + ER (hire) as the lead pair. Numbers, not Later’s prose sentence. ER locked: `(likes + comments) ÷ followers` (Insights or not). Tooltip: of followers, likes + comments only — not Later’s ÷ reach.
- Country mix, age mix, gender mix: own objects, not Stats. Randy unlocked all three. Insights only. Hide until Insights. Later/IG: need ≥100 followers to see audience data; empty copy, not zeros. Country = top countries + %. Age/gender same Graph family (`follower_demographics`). City mix is the finer country job — not “countries only,” not “no geo in v1.”
- Six posts ranked saves → reach → likes. Surface typical reach, saves, and the 30-day chart (Later buries these; we don’t).
- Analytics only after Insights connect. 30-day chart, not Later’s 3-month overview.
- Chart is account unique reach (includes stories/ads) ≠ typical post reach.

**Skip**
- Rates / From $100 / Contact Me
- Stories as a kit section
- Profile views + bio-link clicks in the overview
- Average likes as a Stat
- Stats as a prose paragraph
- Look: gallery, themes, colors
- Impressions (deprecated)
- Industry unless sourced (Later form field, not Graph)
- Bio / creator location only if sourced from IG profile; hide if empty

## Later vs us (note, not a lock flip)

- Later public kit reporting period is last 90 days; we locked a **30-day** reach chart.
- Later Instagram kit ER is `(likes + comments + saves + shares) ÷ (reel reach + post reach)`. We do not use that. Ours is `(likes + comments) ÷ followers`.
- Later labels “Average” but their docs say they use a median that removes outliers for post/story stats. Typical reach for us is already median.
- Later kit also lists profile views, avg impressions, stories, reels as separate sections. We skip those.
- If no posts in 90 days, Later pulls no data for that profile (omit, not zeros). Same honesty: empty > zeros.

## Own objects (not Stats)

Randy unlocked country, age, and gender mix 2026-09-02 (city mix is the finer country job). Insights only. `follower_demographics` is live (v25/v26, Instagram Login). ≥100 followers or the metric is omitted — hide the object; don’t paint zeros. Empty dataset: hide the object. Top 45 only. Graph returns integer counts in `total_value.breakdowns.results.value`, not percents. Our math: % of located sample = `value / sum(results)`. **Never** % of `followers_count`. Tooltip = first sentence. Graph is names + counts, not lat/lng. Do not geocode. Do not paint a map. Later’s kit Top Countries bar is the visual cousin; do not add UI here.

**Country mix** — own object, not a Stat.
Are they in my market?
- Brand ~30s: are they in my market?
- Hide: until Insights connected, if <100 followers (metric omitted), or empty dataset. Don’t paint zeros.
- Paint: ranked % of located sample (bars or a short ranked list). **Not a map.**
- Graph: `follower_demographics` breakdown `country`. Top 45. Counts in `total_value.breakdowns.results.value`.

**City mix** — own object, not a Stat.
Which cities, same job finer. Audience city ≠ hometown. Do not label this as the creator’s hometown.
- Brand ~30s: which cities (same job, finer).
- Hide: until Insights, if omitted, or empty dataset. Don’t paint zeros.
- Paint: ranked % of located sample. **Not a map.**
- Graph: `follower_demographics` breakdown `city`. Same count path. Names + counts, not lat/lng. Do not geocode.

**Age mix** — own object, not a Stat.
Are they the buying age?
- Brand ~30s: are they the buying age?
- Hide: until Insights, if omitted, or empty dataset. Don’t paint zeros.
- Paint: API brackets as bars (% of located sample). Don’t invent bands.
- Graph: `follower_demographics` breakdown `age`. Same count path.

**Gender mix** — own object, not a Stat.
Does the split match the customer?
- Brand ~30s: does the split match the customer?
- Hide: until Insights, if omitted, or empty dataset. Don’t paint zeros.
- Paint: what Meta returns (% of located sample). Don’t add buckets.
- Graph: `follower_demographics` breakdown `gender`. Same count path.

**Bio** — IG User `biography` (Public). Hide if empty. Not a Stat. Not a typed Later blurb.

**Website** — IG User `website` (Public). Hide if empty. Not a Stat.

## Not v1 (do not paint on the Stat row)

**Shares** — people who sent the post onward. Same intent family as saves. Fifth Stat only if Insights return it and the row has room. Empty > zeros. Graph (live, Instagram Login): media insights `shares`. Not media object `shares_count` (Facebook Login only).

**Views** — times content played or displayed. Not unique people. Graph: `views`. `views` ≠ `reach`. Not a Stat; don’t use as typical reach.

**Impressions** — total times a post was shown, including repeat views. Not the same as reach. Duplicate in a 30s skim. Deprecated IG user insights v22+ (21 Apr 2025). Don’t paint. Graph returns empty, not 0. Empty > zeros.

**Interactions / engagements (count)** — sum of actions. Graph: media `total_interactions`. Duplicate of ER’s numerator. Not a Stat.

**Comments** — conversation on a post. Lives on the six posts, not a top-line Stat. Graph: `comments_count` / media comments.

**Likes** — low-intent applause. Last rank on posts, never a Stat. Graph: `like_count`.

**Conversion / likes-conversion** — campaign, pixel, or case study. Not native Insights. Later.

**Media count** — how many posts exist. Weak 30s signal. The six posts already show volume.

**New followers** — growth. Graph: user `follower_count` insight (needs 100+ followers) or media `follows`. Chart already covers momentum. Later.

**Profile visits** — do not add as a Stat. Graph: `profile_views` (confirm live; older docs still list it).

**Bio-link / outbound clicks** — do not add as a Stat. Graph: `website_clicks` if live. Website on the kit is IG User `website` (hide if empty), not a click Stat.

**Audience mix (followers vs non)** — later. Graph: `reach` breakdown `follow_type`.

**Insights** — Instagram account analytics the creator connected. Typical reach, saves, the chart, and country / city / age / gender mix require this. Public-only kits still show ER + Followers.

Country / city / age / gender mix are v1 objects (not Stats): % of located sample (`value / sum(results)`), never % of `followers_count`. Hide if omitted, <100 followers, or empty. No IG User location field. No industry. Impressions stay off. `biography` / `website` are Public; hide if empty. Backend persists demo counts as objects when Insights lands; no extra Graph columns. ER is `(likes + comments) ÷ followers` (Insights or not).
