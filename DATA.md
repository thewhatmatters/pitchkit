# Pitchkit data

Canonical list of Postgres tables and columns. Product rules: [plan.md](./plan.md).

Photos live in object storage (R2). SQL stores keys, not image bytes.

**Rule:** only Instagram Login + Insights. If Graph does not send it under public posts + Insights, do not add a column.

---

## `users`

One row per creator.

| Column | Type / notes | Source | Refresh |
|---|---|---|---|
| `id` | our primary key | us | never |
| `ig_user_id` | unique | Instagram Login | never (stable) |
| `handle` | unique, frozen Pitchkit slug | from IG username at signup | never |
| `name` | display name | Graph | login / refresh |
| `avatar_r2_key` | file key; bytes in R2 | Graph profile photo URL → R2 | if photo URL changed |
| `followers` | live count | Graph | login / refresh |
| `media_count` | live count | Graph | login / refresh |
| `token_encrypted` | Instagram access token | OAuth | on new token |
| `refresh_encrypted` | Instagram refresh token | OAuth | on new token |
| `token_expires_at` | | OAuth | on new token |
| `connected_at` | | us | once |
| `disconnected_at` | null while live | us | on disconnect |
| `consent_index` | bool, **default false** | us | when they opt into anonymized rollups. **Not** the connect-screen disclosure |
| `ig_account_type` | e.g. Business / Media_Creator | Graph, if returned | login / refresh |
| `disclosure_version` | int, currently `1` | us | when connect-screen copy changes |

---

## `media`

One row per post we actually fetched. First kit: **one page**, not the archive.

| Column | Type / notes | Source | Refresh |
|---|---|---|---|
| `id` | our primary key; future CV joins `detections.media_id` | us | never |
| `user_id` | → `users.id` | us | never |
| `ig_media_id` | unique | Graph | never |
| `permalink` | | Graph | if Graph sends an update |
| `posted_at` | | Graph | never |
| `media_type` | `IMAGE` / `VIDEO` / `CAROUSEL` | Graph | never |
| `product_type` | `FEED` / `REELS` / etc. | Graph, if returned | never |
| `caption` | nullable; public | Graph | optional |
| `r2_key` | canonical image or poster; never bytes in SQL | Graph media URL → R2 | if we re-download |
| `like_count` | public | Graph | login / refresh |
| `comments_count` | public | Graph | login / refresh |
| `reach` | nullable until Insights | Insights | when Insights fetch succeeds |
| `saves` | nullable until Insights | Insights | when Insights fetch succeeds |
| `shares` | nullable until Insights | Insights | when Insights fetch succeeds |
| `impressions` | or `views` / `plays` — use the name Graph sends; nullable | Insights | when Insights fetch succeeds |
| `fetched_at` | last media pull | us | each media pull |
| `insights_fetched_at` | last Insights pull | us | each Insights pull |

---

## `detections`

Create now. **Leave empty** until computer vision exists.

| Column | Type / notes |
|---|---|
| `media_id` | → `media.id` |
| `label` / SKU | |
| `confidence` | |
| `model_version` | |
| `detected_at` | |

---

## `weekly_counts`

Create now. **Leave empty** until rollups exist.

Hashed / anonymous aggregates only. Write only when `users.consent_index` is true. **No** `user_id`, handle, or `ig_user_id`.

Column list TBD when we define a rollup that cannot identify a person. Do not invent identifying columns in the meantime.

---

## Do not collect

No columns for:

- DMs
- following or follower graphs
- `follows_count`
- unfollowers
- emails
- industry / category
- bio
- website
- location beyond the public profile
- Stories (unless we add them to kit consent later)
- other people’s accounts
- scrape-derived panels
- `profile_snapshots` or a second database

---

## Files (not SQL)

| What | Where |
|---|---|
| Profile photo | R2, key on `users.avatar_r2_key` |
| Post image or video poster | R2, key on `media.r2_key` |
| Prefix on disconnect | R2 `{user_id}/` |

---

## Disconnect

Delete `users` + `media` + R2 `{user_id}/`.

`weekly_counts` rows stay only if they cannot identify anyone.

---

## TikTok

Not in this file yet. When we persist it: new tables from TikTok Display API only. Do not add Instagram columns for TikTok.
