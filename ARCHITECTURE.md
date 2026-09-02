# Pitchkit architecture

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [AGENTS](./AGENTS.md)

Living picture of v1. Product: [PLAN.md](./PLAN.md). Columns: [DATA.md](./DATA.md).

The Phase 0 diagram is **mostly right**: Next.js on Cloudflare Workers, Instagram Login + Graph, Neon through Hyperdrive, photos in R2, public kit at `/k/[handle]`, never put image bytes in SQL.

Two fixes so we do not build the wrong thing:

1. **`pitchkit.app` is one Worker**, not a second app. `/`, `/insights`, `/privacy`, `/delete`, and `/k/[handle]` are routes on that Worker. The kit URL does not talk to Postgres by itself.
2. **The public kit needs photos.** Postgres has rows and R2 keys. The browser loads images from **public R2** (or a Worker URL in front of R2). A diagram that only arrows the kit at Postgres is incomplete. The kit **does not** call Instagram.

---

## Picture

```mermaid
flowchart TB
  C[Creator]
  B[Brand]
  W[Next.js on Cloudflare Workers]
  IG[Instagram Login + Graph]
  PG[(Neon Postgres via Hyperdrive)]
  R2[(R2 — public kit images)]

  C -->|cookie after OAuth| W
  B -->|GET /k/handle| W
  W <-->|OAuth and poll — owner paths only| IG
  W -->|users and media rows| PG
  W -->|image bytes| R2
  W -->|read rows| PG
  W -->|public image URLs| R2
```

```text
Creator → Workers (OpenNext)
            → Instagram Login + Graph   (connect, refresh, Insights poll)
            → Neon via Hyperdrive        = rows
            → R2                         = photos (public read)
         → /insights                     (owner, cookie)
         → /k/[handle]                   (anyone; Postgres + R2; no Graph)

Brand  → /k/[handle] → same Worker → rows + public photos
```

**Postgres = index cards. R2 = photos. Never store image bytes in SQL.**

---

## Stack (locked)

Same table as [PLAN.md](./PLAN.md#stack-locked). Short version:

- **UI:** `@whatmatters/wmds` pattern-first + `styles.css`. App owns layout Tailwind only. No shadcn. No Storybook here (copy from WMDS Storybook).
- **App:** Next.js App Router, TypeScript, Tailwind v4, official OpenNext on Workers.
- **Icons:** Lucide through WMDS props. **Motion:** `motion` peer when WMDS needs it.
- **Install WMDS:** `github:thewhatmatters/wmds` (CI cannot use `../wmds`). Local `../wmds` still works; `prepare` builds `dist/`.
- **Charts:** Nivo via WMDS Chart (not CSS, not in this app yet). Empty Insights slot; hide when Insights are missing.

---

## What each box does

| Piece | Role |
|---|---|
| Workers / OpenNext | All HTML and APIs. Sets the httpOnly session cookie. Encrypts tokens with `TOKEN_KEY` before SQL. |
| Instagram | Login and Graph **only while the creator is connecting or we are polling**. Pin `GRAPH_API_VERSION`. No webhooks in v1. |
| Hyperdrive → Neon | `users`, `media`, empty `detections` and `weekly_counts`. Bindings: `HYPERDRIVE` / `HYPERDRIVE_PREVIEW`. |
| R2 `pitchkit-media` | Bytes. Public read for kit objects. Keys on `avatar_r2_key` / `r2_key`. Prefix `{user_id}/`. |
| `/k/[handle]` | Last stored snapshot. If the token is dead, this page still works. |
| Cloudflare / Support | randy@whatmatters.so until we change it |

---

## What is not in this picture (on purpose)

D1, Vercel, shadcn, queues, Browser Run, Workers AI, Storybook in Pitchkit, a second database, TikTok, PDF, signed URLs for kit images, live Graph on the public kit.

---

## Delete

Owner disconnect → Worker deletes Neon rows for that creator and R2 `{user_id}/` within 24 hours. Public kit 404s. Anonymous `weekly_counts` may remain.
