# Pitchkit glossary

Desk research, interviews unrun. Locked with Design 2026-09-02. User Research owns the meanings; Design owns look. Tooltip = first sentence. Longer help can sit under the chart. Graph names below are **Backend-confirmed against Instagram Login Graph v25** (not Facebook Login), except Insights ER numerator (pending Randy). Graph returns empty, not 0. Empty > zeros.

## v1 Stat row (ordered)

**Engagement rate (ER)** — always, `primary`.
Share of followers who interact with a typical post. Brands use this first: is the audience real, or a quiet list? Average recent posts: interactions ÷ followers. A smaller account with a high ER often beats a big one that nobody talks to.
- Brand ~30s: hire or pass — is the audience real?
- Hide: never (public kit still has it).
- Formula (do not overwrite until Randy says): public ER is `(likes + comments) ÷ followers`. Insights ER is **pending Randy** — UR wants likes + comments + saves + shares in the numerator, still ÷ followers. Later uses ÷ reach. Tooltip must print the formula we actually use (ours is ÷ followers).
- Graph (v25, Instagram Login): none; computed. Likes/comments are media `like_count` / `comments_count` — not insights. Followers denominator is user `followers_count` (store `followers`).

**Typical reach** — Insights only; hide if missing.
Unique accounts that usually see a post. This is what a brand is buying — not the follower total, not one viral. Median of recent posts, not a best-ever spike. If the public grid shows ~20k and the kit says 60k, the deal dies. Never paint 0.
- Brand ~30s: how many unique accounts usually see a post (what they buy).
- Hide: until Insights. Never paint 0.
- Graph (v25, Instagram Login): media insights `reach` (lifetime, unique). Typical = median of recent posts. Not account 30-day unique. Not `followers_count`. Different number from the 30-day chart.

**Followers** — always, context.
Accounts following this profile right now. Scale only. Not how many people saw the last post. Read next to typical reach: a big follow with tiny reach is a warning.
- Brand ~30s: scale context / sanity vs reach.
- Hide: never.
- Graph (v25, Instagram Login): user `followers_count` (store `followers`). Not who saw the last post.

**Saves** — Insights only; hide if missing.
People who bookmarked a typical post to come back. Intent, not applause. Stronger commercial signal than a like. Never paint 0.
- Brand ~30s: was the post worth keeping (intent > likes).
- Hide: until Insights. Never paint 0.
- Graph (v25, Instagram Login): media insights `saved` (FEED/REELS). Typical/median. Not account insights `saves`. Not `saved_count` (Facebook Login only).

**30-day chart** — Insights only; trend object, not a fifth Stat.
Reach over the last 30 days so a brand (and the creator before they share) can see typical vs a spike. Never paint an empty chart as zeros. This is **not** the same number as typical post reach.
- Brand ~30s: typical vs a spike before they share.
- Hide: until Insights. Empty > zeros.
- Graph (v25, Instagram Login): `GET /{ig-user-id}/insights?metric=reach&period=day&metric_type=time_series` — account unique reach (includes stories/ads). **Different number** from typical post media insights `reach`.

**Six posts** — ranked saves → reach → likes.
Recent work a brand can match to the public grid. Likes-first would look like a vanity kit.
- Brand ~30s: proof that matches the grid.
- Hide: never if we have media.
- Graph (v25, Instagram Login): rank insights `saved` → insights `reach` → field `like_count`. `like_count` is public (not insights); `saved`/`reach` need Insights.

Row length follows the data: 2 without Insights (ER + Followers), 4 + chart with Insights. Don’t pad to five. Lead pair is **Followers (context) + ER (hire)** as numbers, not Later’s prose sentence.

## Later steal vs skip (UR + Randy, 2026-09-02)

**Steal**
- Followers (context) + ER (hire) as the lead pair. Numbers, not Later’s prose sentence. Don’t overwrite ER until Randy answers the widget. Shipped: `(likes + comments) ÷ followers`.
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

## Own objects (not Stats)

Randy unlocked country, age, and gender mix 2026-09-02 (city mix is the finer country job). Insights only. Hide until Insights. Later/IG: need ≥100 followers to see audience data; empty copy, not zeros. Tooltip = first sentence. Percents are of the located demographic sample, not of all followers. Graph is names + counts, not lat/lng. Do not geocode. Do not paint a map. BE confirms live Graph names. Later’s kit Top Countries bar is the visual cousin; do not add UI here.

**Country mix** — own object, not a Stat.
Are they in my market?
- Brand ~30s: are they in my market?
- Hide: until Insights. Empty > zeros.
- Paint: ranked % bars (or a short ranked list). **Not a map.**
- Graph: `follower_demographics` breakdown `country`. ≥100 followers, top 45, % of located sample (bars can sum under `followers_count`).

**City mix** — own object, not a Stat.
Which cities, same job finer. Audience city ≠ hometown. Do not label this as the creator’s hometown.
- Brand ~30s: which cities (same job, finer).
- Hide: until Insights. Empty > zeros.
- Paint: ranked % bars (or a short ranked list). **Not a map.**
- Graph: `follower_demographics` breakdown `city`. Names + counts, not lat/lng. Do not geocode.

**Age mix** — own object, not a Stat.
Are they the buying age?
- Brand ~30s: are they the buying age?
- Hide: until Insights. Empty > zeros.
- Paint: API brackets as bars. Don’t invent bands.
- Graph: `follower_demographics` breakdown `age`.

**Gender mix** — own object, not a Stat.
Does the split match the customer?
- Brand ~30s: does the split match the customer?
- Hide: until Insights. Empty > zeros.
- Paint: what Meta returns. Don’t add buckets.
- Graph: `follower_demographics` breakdown `gender`.

**Bio** — only if sourced from IG profile. IG User `biography` if present; hide if empty. Not a Stat. Not a typed Later blurb.

**Website** — sourced if you need a link. Not a Stat.
- Hide: if empty.
- Graph: IG User `website`.

## Not v1 (do not paint on the Stat row)

**Shares** — people who sent the post onward. Same intent family as saves. Fifth Stat only if Insights return it and the row has room. Empty > zeros. Graph (v25, Instagram Login): media insights `shares`. Not `shares_count` (Facebook Login only).

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

Country / city / age / gender mix are v1 objects (not Stats): ranked % bars or a short ranked list — not a map; no geocode; not “countries only.” Bio / creator location only if sourced from IG; hide if empty. Industry unless sourced (Later form). Skip rates / From $100 / Contact Me, Stories as a kit section, profile views + bio-link clicks in the overview, average likes as a Stat, stats as a prose paragraph, gallery/themes/colors, impressions (deprecated). ER stays `(likes + comments) ÷ followers` until Randy answers the widget. Empty copy, not zeros.
