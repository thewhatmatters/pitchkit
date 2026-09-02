# Pitchkit glossary

Desk research, interviews unrun. Locked with Design 2026-09-02. User Research owns the meanings; Design owns look. Tooltip = first sentence. Longer help can sit under the chart. Graph names below are UR-sourced and unsourced until Backend confirms the live IG version.

## v1 Stat row (ordered)

**Engagement rate (ER)** — always, `primary`.
Share of followers who interact with a typical post. Brands use this first: is the audience real, or a quiet list? Average recent posts: interactions ÷ followers. With Insights, interactions are likes + comments + saves + shares. Without Insights, likes + comments only — the tooltip must say which. A smaller account with a high ER often beats a big one that nobody talks to.
- Brand ~30s: hire or pass — is the audience real?
- Hide: never (public kit still has it).
- Graph: none; computed. Insights: (likes + comments + saves + shares) ÷ followers. Public only: (likes + comments) ÷ followers. Denominator is followers until Randy/UR change it. Later uses ÷ reach; tooltip must print ours.

**Typical reach** — Insights only; hide if missing.
Unique accounts that usually see a post. This is what a brand is buying — not the follower total, not one viral. Median of recent posts, not a best-ever spike. If the public grid shows ~20k and the kit says 60k, the deal dies. Never paint 0.
- Brand ~30s: how many unique accounts usually see a post (what they buy).
- Hide: until Insights. Never paint 0.
- Graph: media `reach` (estimated unique accounts). Typical = median of recent posts, not a spike, not account-level 30-day unique, not `followers_count`.

**Followers** — always, context.
Accounts following this profile right now. Scale only. Not how many people saw the last post. Read next to typical reach: a big follow with tiny reach is a warning.
- Brand ~30s: scale context / sanity vs reach.
- Hide: never.
- Graph: user `followers_count`. Not who saw the last post.

**Saves** — Insights only; hide if missing.
People who bookmarked a typical post to come back. Intent, not applause. Stronger commercial signal than a like. Never paint 0.
- Brand ~30s: was the post worth keeping (intent > likes).
- Hide: until Insights. Never paint 0.
- Graph: media `saved` (typical/median). Account-level `saves` exists; don’t swap it in for typical-per-post.

**30-day chart** — Insights only; trend object, not a fifth Stat.
Reach over the last 30 days, same unit as typical reach, so a brand (and the creator before they share) can see typical vs a spike. Never paint an empty chart as zeros.
- Brand ~30s: typical vs a spike before they share.
- Hide: until Insights. Empty > zeros.
- Graph: user insights `reach` `time_series` `period=day`. Same unit as typical reach.

**Six posts** — ranked saves → reach → likes.
Recent work a brand can match to the public grid. Likes-first would look like a vanity kit.
- Brand ~30s: proof that matches the grid.
- Hide: never if we have media.
- Graph: rank media `saved` → `reach` → `like_count`. `like_count` is public; `saved`/`reach` need Insights.

Row length follows the data: 2 without Insights (ER + Followers), 4 + chart with Insights. Don’t pad to five.

## Own objects (not Stats)

Randy unlocked 2026-09-02. Insights only. Hide until connected. Empty > zeros. Later’s kit Top Countries bar is the visual cousin; do not add UI here.

**Country mix** — own object, not a fifth Stat. Graph: `follower_demographics` / `country`. Hide until Insights. Empty > zeros. City still later — do not paint city even if Later/Mobbin show it.

**Age mix** — own object, not a Stat. Graph: `follower_demographics` / `age` (UR to confirm exact breakdown). Hide until Insights. Empty > zeros.

**Gender mix** — own object, not a Stat. Graph: `follower_demographics` / `gender`. Hide until Insights. Empty > zeros.

**Bio** — IG profile biography if present; hide if empty. Not a Stat. Only if sourced.

**Location** — only if a sourced profile or city-mix field exists; don’t invent. Not a Stat.

**Industry** — Later form field, not Graph. Do not add as a v1 field unless UR sources it.

## Not v1 (do not paint on the Stat row)

**Shares** — people who sent the post onward. Same intent family as saves. Fifth Stat only if Insights return it and the row has room. Empty > zeros. Graph: media `shares` / account `shares`.

**Views** — times content played or displayed. Not unique people. Graph: `views`. Replaced impressions. Not a Stat; don’t use as typical reach.

**Impressions** — total times a post was shown, including repeat views. Not the same as reach. Duplicate in a 30s skim. Deprecated account metric v22 / all versions 2025-04-21; media `impressions` gone for objects after 2024-07-02. Do not paint.

**Interactions / engagements (count)** — sum of actions. Graph: media `total_interactions`. Duplicate of ER’s numerator. Not a Stat.

**Comments** — conversation on a post. Lives on the six posts, not a top-line Stat. Graph: `comments_count` / media comments.

**Likes** — low-intent applause. Last rank on posts, never a Stat. Graph: `like_count`.

**Conversion / likes-conversion** — campaign, pixel, or case study. Not native Insights. Later.

**Media count** — how many posts exist. Weak 30s signal. The six posts already show volume.

**New followers** — growth. Graph: user `follower_count` insight (needs 100+ followers) or media `follows`. Chart already covers momentum. Later.

**Profile visits** — later. Graph: `profile_views` (confirm live; older docs still list it).

**Bio-link / outbound clicks** — later. Bio only if sourced from IG (hide if empty). Graph: `website_clicks` if live.

**Audience mix (followers vs non)** — later. Graph: `reach` breakdown `follow_type`.

**Insights** — Instagram account analytics the creator connected. Typical reach, saves, the chart, and country / age / gender mix require this. Public-only kits still show ER + Followers.

Country / age / gender mix are v1 objects (not Stats). Bio / location only if sourced from IG. Industry is a Later form field, not Graph — don’t add unless sourced. Skip rates. Table stories. Do not paint impressions unless Backend confirms a live field. Empty > zeros. Don’t file city / rates / Stories as a Stat even if Later/Mobbin show them.
