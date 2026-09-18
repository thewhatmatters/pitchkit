# Insights ↔ Graph audit

**Tip:** Graph client + Insights poll + fail-soft Instagram Business Login.  
**Host:** `graph.instagram.com` (not `graph.facebook.com`). Pin: `GRAPH_API_VERSION` (default `v25.0`) via `lib/env.ts`.

Live dry-run facts (2026-09-18, @rxndy.dxniel) still apply: `MEDIA_CREATOR`, Insights 400 on pre-Professional media, sparse/zero account reach, `follower_demographics` 200 with 0 rows under ~100 followers.

---

## Auth

| Path | Behavior |
|---|---|
| Secrets missing | `stubConnect()` — `pitchkit_session=demo` |
| `IG_APP_ID` + `IG_APP_SECRET` | `https://www.instagram.com/oauth/authorize` → code → `POST api.instagram.com/oauth/access_token` → `GET graph.instagram.com/access_token` (long-lived) → poll → cookie |
| Personal | `/?error=personal` |
| Redirect URI | `IG_REDIRECT_URI` or `https://pitchkit.app/auth/instagram` (exact dashboard match; slash-aware) |
| WHA-313 | `update_handle=1` opts into a new slug; default keep; `demo` frozen |

Operator dry-run: `IG_USER_TOKEN` on Insights poll when the user row has no encrypted token. Public `/k/demo` stays seed.

---

## Graph calls (`https://graph.instagram.com/$GRAPH_API_VERSION`)

| # | Endpoint | Lands in |
|---|---|---|
| A | `GET /me?fields=user_id,username,name,account_type,profile_picture_url,followers_count,media_count` | `users.*` |
| B | `GET /{id}/media` one page (`CAROUSEL_ALBUM` → `CAROUSEL`) | `media.*` + public image URL on `r2_key` until R2 |
| C | `GET /{media-id}/insights?metric=reach,views,saved,shares` | `reach` / `saves` ← `saved` / `shares` / `impressions` ← `views`. HTTP 400 → skip Insights, keep likes/comments |
| D | `GET /{id}/insights?metric=reach&period=day&metric_type=time_series` | kit `reach_series` (hide empty / all-zero) |
| E | `GET /{id}/insights?metric=follower_demographics&…&breakdown=` | kit `audience` (% of located sample). Hide 0 rows |
| F | Insights load if `polled_at` &gt; 6h, or **Refresh** | A–E |

`TOKEN_KEY` encrypts `users.token_encrypted` (`v1.<iv>.<cipher>`). Snapshots persist on KV `HIDDEN_KIT` (`graph:id:`, `graph:handle:`, `graph:ig:`) until Hyperdrive.

---

## Hide rules

- Typical reach / saves / Engagement rate: posts with Insights `reach` &gt; 0 only. Pre-conversion 400s are omitted from medians.
- Chart: hide empty or all-zero. No “Graph data” badge.
- Audience: live demographics or empty. Never `EXAMPLE_*` percents.
- Public `/k/demo`: seed, no Insights.
