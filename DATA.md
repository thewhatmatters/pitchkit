# Pitchkit data

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [glossary](./GLOSSARY.md) · [AGENTS](./AGENTS.md)

Canonical list of Postgres tables and columns. Product rules: [PLAN.md](./PLAN.md). Picture: [ARCHITECTURE.md](./ARCHITECTURE.md).

SQL: `db/001_users.sql`, `db/002_media.sql`, `db/003_detections.sql`, `db/004_weekly_counts.sql`, `db/005_media_hidden_from_kit.sql`. Types: `lib/schema.ts`. Query rows from postgres.js are `SqlQueryRow` (`lib/postgres.ts`); OpenNext typecheck asserts them through `unknown` (`asQueryRows`) — do not `as T[]`. Host is **Supabase Postgres via Hyperdrive**. Client: `postgres` (postgres.js) over `env.HYPERDRIVE.connectionString` when the binding is present (`lib/postgres.ts`, `lib/sql-store.ts`) — not `@supabase/supabase-js` and not a Neon/Supabase serverless driver. Hyperdrive origin is the Supabase **direct** DB URI (port 5432), not the transaction pooler (6543). In-repo seed (same columns, not Graph): `lib/seed.ts`. Handle `demo` is frozen. Live kits freeze `users.handle` at first successful connect **by default**; optional update on reconnect if the Instagram username differs (WHA-313). Until Hyperdrive exists the Worker reads that seed and KV `graph:` snapshots. When `HYPERDRIVE` / `HYPERDRIVE_PREVIEW` is bound (non-empty `connectionString`), SQL is SoT for `users` / `media` / `hidden_from_kit_at`. Apply once: `HYPERDRIVE_LOCAL_CONNECTION_STRING='…' npm run db:apply`. `TOKEN_KEY` is not required for seed rows (tokens stay null). The Pitchkit session is an httpOnly cookie (`pitchkit_session` = handle), not a Graph column and not the Instagram token.

Photos live in object storage (R2), **publicly readable** for kit objects (already public posts). Do not use expiring signed URLs for the kit. SQL stores keys, not image bytes.

**Rule:** only Instagram Login + Insights. If Graph does not send it under public posts + Insights, do not add a column.

---

## `users`

One row per creator.

| Column | Type / notes | Source | Refresh |
|---|---|---|---|
| `id` | our primary key | us | never |
| `ig_user_id` | unique | Instagram Login | never (stable) |
| `handle` | unique Pitchkit slug, frozen at first connect by default | from IG username (keep `.` `_`; `-2` if taken) | first connect; optional reconnect update (WHA-313) |
| `name` | display name | Graph | login / refresh. Identity strip hides the heading when blank — never invent a name or bio |
| `avatar_r2_key` | file key; bytes in R2 | Graph profile photo URL → R2 | if photo URL changed. Identity Avatar falls back when missing |
| `followers` | live count | Graph | login / refresh. Identity strip uses this as context; kit Stat stays on the shareable freeze |
| `media_count` | live count | Graph | login / refresh |
| `token_encrypted` | Instagram access token | OAuth | on new token |
| `refresh_encrypted` | Instagram refresh token | OAuth | on new token |
| `token_expires_at` | | OAuth | on new token |
| `connected_at` | | us | once |
| `disconnected_at` | null while live | us | on disconnect |
| `consent_index` | bool, **default false** | us | when they opt into anonymized rollups. **Not** the connect-screen disclosure |
| `ig_account_type` | e.g. Business / Media_Creator | Graph, if returned | login / refresh. Identity Professional chip labels Business or Creator; hide when missing |
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
| `reach` | nullable until Insights; Engagement rate denominator (hide ER when missing/0) | media insights `reach` | when Insights fetch succeeds |
| `saves` | nullable until Insights; Instagram Login media insights `saved` (not Facebook `saved_count`) | Insights | when Insights fetch succeeds |
| `shares` | nullable until Insights; Instagram Login media insights `shares` (not Facebook `shares_count`) | Insights | when Insights fetch succeeds |
| `impressions` | or `views` / `plays` — use the name Graph sends; nullable | Insights | when Insights fetch succeeds |
| `fetched_at` | last media pull | us | each media pull |
| `insights_fetched_at` | last Insights pull | us | each Insights pull |
| `hidden_from_kit_at` | timestamptz, null = on the public kit | us (hide / restore) | hide / restore |

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
- bio, website, rates, “contact for collab,” geo, email, past brands (not on the kit in v1; `/insights` Design inventory uses in-file objects / typed holes in `lib/inventory.ts`, not columns. Name / handle / avatar / media `fetched_at` already exist and the inventory reads those when present.)
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

When Hyperdrive is bound, stamp `users.disconnected_at` and null `token_encrypted` / `refresh_encrypted` / `token_expires_at` on the SQL row. Until then, stamp the same fields on the KV Graph snapshot. `assemblePublicKit` then 404s `/k/[handle]`. Session cookies clear. SQL delete of `users` + `media` + R2 `{user_id}/` still finishes within 24 hours.

`weekly_counts` rows stay only if they cannot identify anyone.

Sign out does not write `disconnected_at`.

---

## Kit payload (not SQL)

`reach_series` is assembled onto the kit payload from the Insights poll (`user insights` `reach` `time_series` — account day buckets, stories + ads). Shape: `{ day: string /* YYYY-MM-DD UTC */, reach: number | null }[]`. Insights missing → omit the field (graph-unavailable). Empty or all-zero with Insights → `[]` and the insufficient-reach empty band. Do not zero-fill 30 days just to paint. Partial calendar holes in a plottable window become `null` for Chart.Cartesian `noData` hatch (`0` is plotted). **Not a SQL table for v1.** Do not invent `weekly_counts` columns for this. Audience mixes from `follower_demographics` are the same payload (no extra Graph columns). Empty / 0 rows (typical under ~100 followers) keep the owner Audience Card with State — insufficient audience data (`No audience data yet`). Never EXAMPLE percents. Never `audience ?? SEED_AUDIENCE` on live Insights. Never omit the Audience band.

Owner demo seed (`loadOwnerKit`) includes ~30 labeled example points when no token. A live OAuth token polls Graph and persists users/media (SQL when Hyperdrive is bound; else KV `graph:` keys). Operator `IG_USER_TOKEN` is fallback for live (non-demo) rows without an encrypted token — never for seed `demo`. `reach_series` + audience stay payload extras (`graph:payload:` when SQL owns the rows) — not a SQL table. Public `/k/demo` (`loadPublicKit`) stays seed and omits `reach_series`. Frontend: one WMDS Chart on `/insights` from `owner.reach_series` only; keep the Reach Card empty band when Insights exist but the series is unusable; omit when Graph never returned Insights. Never zero-fill. Public kit never paints the Chart. No period-over-period KPI deltas in the payload — do not invent Stat `trend`s.

## Hide from kit (WHA-312)

Stamped contract. Not a Graph column.

| | |
|---|---|
| Hide | `hideFromKit(mediaId)` → `POST /api/media/hide` body `{ mediaId }` |
| Restore | `restoreToKit(mediaId)` → `POST /api/media/restore` body `{ mediaId }` |
| Success 200 | `{ mediaId, hiddenFromKitAt }` — ISO string when hidden, `null` when visible |
| Failures | `401 unauthenticated`, `400 invalid_body`, `404 not_found`, `403 forbidden`, `500 persist_failed` |
| Idempotent | hide-already-hidden keeps the first timestamp; restore-already-visible returns `null` |
| Schema | `media.hidden_from_kit_at` |
| Public kit | filter `hidden_from_kit_at != null` **before** `selectSixPosts` |
| Owner Insights | keep the row (`hidden_from_kit_at` set). FE partitions: **"N shown"** + rank = `null` only; Hidden rows stay for MoreMenu **Restore to kit** / toast Undo. Hide, restore, and Share kit toasts pass title + description. `npm test` fail-closes this partition. |

**Seed path:** until Hyperdrive, seed SoT is KV `HIDDEN_KIT` (`hidden:<userId>` → JSON `Record<mediaId, ISO>`). httpOnly `pitchkit_hidden` (`{ userId, hidden }`) is the owner reload mirror. Public `/k/[handle]` reads KV for the kit owner, not the visitor cookie. **Hyperdrive path:** write `media.hidden_from_kit_at` on the SQL row. Binding detection is explicit (`lib/hyperdrive.ts`); missing / empty connection strings stay on KV. FE calls the routes only — no localStorage. Do not invent Graph columns.

## Optional kit URL update (WHA-313)

Stamped product lock. Same `users.handle` column — no new Graph field.

| | |
|---|---|
| Default | frozen at first successful connect; IG rename does not move `/k/[handle]` |
| Offer | on reconnect only, if Instagram username ≠ `users.handle`: **Update kit URL to @{new}** |
| Warning | old `/k/…` links will 404 / stop working |
| Keep | default choice; **no redirect** from the old path |
| Collision | `-2` suffix if the new slug is taken |
| Slug | preserve `.` and `_` from the IG username; do not hyphenate periods |
| Stub | no-op until live OAuth; seed `demo` stays frozen |

## Graph hygiene (not extra columns)

On poll: if Instagram no longer returns a post, delete that `media` row and its R2 object. Token revoke does not delete the kit; owner reconnects. Reconnect may offer WHA-313 handle update when the Instagram username differs.

## TikTok

Do not build. No tables in this file until we persist Display API data.
