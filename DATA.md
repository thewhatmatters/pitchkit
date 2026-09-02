# Pitchkit data

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [AGENTS](./AGENTS.md)

Canonical list of Postgres tables and columns. Product rules: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md).

SQL: `db/001_users.sql`, `db/002_media.sql`, `db/003_detections.sql`, `db/004_weekly_counts.sql`. Types: `lib/schema.ts`. In-repo seed (same columns, not Graph): `lib/seed.ts`. Handle `demo` is frozen. Until Hyperdrive exists the Worker reads that seed. `TOKEN_KEY` is not required for seed rows (tokens stay null). The Pitchkit session is an httpOnly cookie (`pitchkit_session` = handle), not a Graph column and not the Instagram token.

Photos live in object storage (R2), **publicly readable** for kit objects (already public posts). Do not use expiring signed URLs for the kit. SQL stores keys, not image bytes.

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

Write only when `users.consent_index` is true.

**Allowed:** time bucket, metric name, hashed or global cohort, integer count.

**Forbidden:** `user_id`, `ig_user_id`, handle, name, tokens, captions, permalinks, or anything that identifies a creator.

Column names TBD when the first rollup exists. Empty table is enough for v1. Do not invent identifying columns. `db/004_weekly_counts.sql` uses a non-identifying `_placeholder` so Postgres can create the table; drop it when real columns land. No rows.

---

## Do not collect

No columns for:

- DMs
- following or follower graphs
- `follows_count`
- unfollowers
- emails
- industry / category
- bio, website, rates, “contact for collab,” geo, contact email, past brands (not on the public kit; no columns this round). `/insights` may paint **example** identity / bio / website / mix and **typed empty** contact + past-brands holes for Design. Mix percents are of the located sample, not of `followers`. Do not persist them until we store Graph values.
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
| Post image or video poster | R2, key on `media.r2_key` (carousel: first frame; video: poster only) |
| Prefix on disconnect | R2 `{user_id}/` — start immediately, finish within 24 hours |
| Bucket | `pitchkit-media` (planned name) |

---

## Disconnect

Delete `users` + `media` + R2 `{user_id}/`.

`weekly_counts` rows stay only if they cannot identify anyone.

---

## Graph hygiene (not extra columns)

On poll: if Instagram no longer returns a post, delete that `media` row and its R2 object. Token revoke does not delete the kit; owner reconnects.

## TikTok

Do not build. No tables in this file until we persist Display API data.
