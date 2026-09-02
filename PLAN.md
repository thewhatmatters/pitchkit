# Pitchkit MVP plan

Product lives on **pitchkit.app**.

**IA (locked from mocks):** signed-in home is **Insights**, then **Media kit**. Brands never see Insights.

**Public lookbook:** `pitchkit.app/k/[handle]`.

**Account = Instagram.** Continue with Instagram is login and sign-up. TikTok (and later networks) attach from signed-in chrome (Insights), not a second front door. No email, no password, no magic link.

**Handle is immutable.** Set once from the Instagram username (slugified; `-2` if taken). Never edited.

**Seed slug:** `demo` → Insights + `/k/demo` from seed data while OAuth is stubbed.

Mocks are Atelier cream / serif / oxblood. Ship as **Pitchkit**. This is the build brief, not a full PRD.

---

## What we offer (basic MVP)

Two audiences. Two surfaces. Same ingest.

### Creator (signed in)

| Experience | What they get |
|---|---|
| Sign in | Continue with Instagram (Professional account). That is the account. |
| Insights (home) | After OAuth, land here. Last-30-days stats, CSS reach chart, six top posts, CTA into the kit. |
| Media kit | Shareable page with live stats. Copy link, native share on mobile, **export PDF**. |
| Optional TikTok | Connect from Insights chrome, not a post-signup wizard. |
| Stay in control | Reconnect a dead token. Disconnect TikTok (unlink). Disconnect Instagram (deletes the account and `/k/[handle]`). |

No multi-step onboarding and no extra data form after login. Instagram ingest is enough to render Insights. Dismissible “Add TikTok” on Insights is fine.

### Brand / anyone with the link

| Experience | What they get |
|---|---|
| Open `/k/[handle]` | The media kit card only (name, handle, stats, six pieces). No Insights tab. |
| No account | They do not sign in. |

**Responsive:** landing, Insights, Media kit, and `/k/[handle]` work on a phone. Owner tabs stay usable with a thumb. Export must work on iOS Safari (download or Share sheet), not desktop-only.

### What the mocks show that is **not** basic MVP

| Mock | MVP |
|---|---|
| “Posts with a bag in-frame…” | Computer vision. Cut. Insights ships without that banner. |
| Download PDF | **In.** Export of the kit card (see Export). |
| Generate media kit as a pipeline | No render job. Ingest already built the kit. Button = go to Media kit tab. |
| Bio + “New York” as typed fields | Skip. No bio/website columns until they appear on the kit. |
| `@mara.studio` in chrome | Seed/demo copy. Real chrome uses the Pitchkit handle. |

We are still not offering inbox, CRM, scheduling, or unfollowers.

---

## Goal

A creator signs in with Instagram, we ingest recent public work, they land on **Insights**, then share **Media kit**. TikTok is optional from Insights.

**Success:** `wrangler`/dev Continue with Instagram → Insights for `demo` (Postgres + R2). Media kit tab and `/k/demo` show the public card. TikTok connect stubbed on Insights. Real OAuth stubbed until App Review.

---

## Exclusive social auth — issues

### 1. One identity provider (locked)

Instagram OAuth creates and recovers the Pitchkit user. TikTok is never a login. Connecting TikTok while signed in attaches to that user.

Tradeoff: TikTok-only creators cannot sign up until we add TikTok as a login later.

### 2. Instagram will refuse personal accounts

Instagram Login only works for **Professional** (Business/Creator) accounts. Personal IG is a hard fail. Landing and error copy must say that before they hit Meta.

Insights **reach / saves** need Insights-capable scopes on that professional account. Followers + ER from public-ish media can still show if Insights fields are null. Hide reach/saves/chart until those columns exist.

### 3. App Review is on the calendar

Meta (signup + Insights). TikTok (link only). Each wants a demo, screencasts, privacy policy, data-deletion URL.

**MVP rule:** Instagram and TikTok-from-Insights both exist; each is `live \| stub`. Seeded `demo` proves both tabs. TikTok review does not block Instagram signup.

### 4. Token death locks Insights, not the public kit

`/k/[handle]` keeps serving R2 + Postgres. Insights and reconnect need a session. Expired Instagram → “Reconnect Instagram” on Insights. Expired TikTok → “Reconnect TikTok.” Dead Instagram also means they cannot sign in from a fresh browser until they OAuth again.

### 5. Disconnect

Disconnect Instagram: delete `users` + `media` + R2 prefix `{user_id}/`. Kit URL goes away. `weekly_counts` rows stay only if they were designed with no user id or handle. No fallback login.

### 6. No email

No password reset. Recovery is Continue with Instagram. Privacy + data-deletion URLs still on the site (review requirement).

### 7. Handle is ours, and frozen

`/k/[handle]` copied from Instagram username at signup. Instagram can rename later; we do not follow. Collisions get `-2`. No rename UI.

### 8. Brand and ToS

Official login button guidelines. Consent: public posts + Insights (IG); Display API profile + public videos (TikTok). No DMs, no following list. TikTok: covers + official embed, not rehosted MP4s.

---

## Auth and first-run (locked)

```text
Landing
  → Continue with Instagram
  → OAuth (or stub)
  → lookup (instagram, ig_user_id)
       exists → session
       new    → create users row, ingest one media page, freeze handle
  → redirect to Insights (signed-in home)

Insights (owner)
  → tabs: Insights | Media kit
  → Connect TikTok, reconnect, disconnect
  → CTA: Media kit tab (not a generate pipeline)

Media kit tab (owner)
  → preview of the public card
  → Copy link / Share → pitchkit.app/k/[handle]
  → Export PDF

Public
  → /k/[handle]  (card only)
```

Session: httpOnly cookie on `pitchkit.app` (and localhost). Session is the Pitchkit user, not a platform token.

Secrets: `IG_APP_ID`, `IG_APP_SECRET`, `TT_CLIENT_KEY`, `TT_CLIENT_SECRET`, `TOKEN_KEY`, Hyperdrive. Tokens encrypted at rest.

---

## Product surface

| Route | Who | What |
|---|---|---|
| `/` | anyone | Pitch, collection disclosure, Continue with Instagram, Professional-account note |
| `/insights` (name TBD) | owner session | Insights mock: period, name, followers, ER, reach, saves, reach chart, six top posts, CTA |
| `/kit` or Media kit tab | owner session | Kit card + Copy link + Share + Export PDF |
| `/k/[handle]` | public | Same card, no owner nav. Responsive. |
| `/privacy`, `/delete` | public | Review requirement |

Six top pieces: **like_count, then recency** until saves exist; then **saves, then recency** to match the mock. IG VIDEO/CAROUSEL: cover/first frame. TikTok: cover on R2, play via embed/permalink.

ER (v0): `(likes + comments) / followers` when followers > 0; hide otherwise. Reach/saves/chart: Insights fields; omit if null.

Charts: CSS bars (mock).

Owner chrome: Pitchkit wordmark, **Insights | Media kit**, handle on the right (as in the Atelier mock). On small screens: wordmark + two tabs + handle overflow menu (Sign out, disconnect, Add TikTok).

---

## Responsive

Phone-first for Insights and the kit; desktop matches the mocks.

- Insights metrics: four-across on desktop, 2×2 on phone.
- Reach chart: full width, not a horizontal squeeze.
- Top posts: six-across on desktop, **2×3** on phone (not a sideways scroller).
- Media kit card: same document, narrower type and 2×3 grid on phone.
- Landing: one column, Instagram button not cropped by iOS safe area.
- Public kit: no owner chrome; sticky “Open in Instagram” is out of scope.

---

## Export

The shareable kit is a URL **and** a file. Export = **PDF of the media kit card** (what’s on `/k/[handle]`), not Insights.

- Owner Media kit tab: **Export PDF** (mock’s Download PDF).
- Public page: no export button in MVP (brands use the link; creator sends the file).
- Contents: name, handle, stats, six stills.
- Filename: `pitchkit-[handle].pdf`.
- Mobile: Share sheet if `navigator.share` + file; else download.
- Implementation default: print-quality PDF from the kit layout (`@react-pdf/renderer` or equivalent), generated on request. If Workers cannot run it, a small Node/PDF route — do not ship “Print this page.”
- Snapshot of current Postgres/R2, not a live Insights dump.

---

## What else (locked defaults)

These were the holes. Defaults below so we do not rediscover them in build.

**Sign out.** Owner overflow: Sign out (clears cookie). Required on a shared phone.

**First-load ingest.** After OAuth, Insights may exist before R2 stills finish. Show the shell + “Pulling your grid…” then swap in posts. Never a blank Insights.

**Empty and error.** Personal IG rejected (copy + link to switch to Professional). OAuth cancel → landing. No media → kit with stats and empty grid, not a crash. Unknown `/k/…` → 404. Insights reach/saves missing → hide those figures and the chart; keep followers/ER if we have them.

**Refresh.** On Insights load, if `fetched_at` older than 6 hours, re-pull one media page + Insights fields. Manual “Refresh” in overflow. Instagram long-lived token refresh before expiry; if refresh fails, Reconnect banner. Public kit never blocks on a live Graph call.

**Share unfurl.** `/k/[handle]` has OG title (`Name · Pitchkit`), description (followers + ER), image (avatar or first still). iMessage/Slack should look like a kit.

**Native share.** Media kit tab: Copy link on desktop; on mobile prefer `navigator.share` for the URL (PDF share is extra).

**App Review pack.** `/privacy`, `/delete`, data-deletion that actually deletes, screencast script (login → Insights → Media kit → copy link), tester Professional account, button brand guidelines.

**Consent (locked copy).** On the connect screen, **before** they tap Continue with Instagram. Not after OAuth. Not a terms dump. Meta’s permission list still appears on Instagram’s screen.

Next to the button:

> We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

Shorter, under the button if space is tight:

> Public posts and Insights only. No DMs. No following list. Disconnect deletes everything we stored.

`disclosure_version` is the connect-screen copy (currently `1`). Separate from `consent_index` (see Data). Not legal advice.

**Security.** OAuth `state` CSRF. Tokens encrypted. Public kits are enumerable by handle — that is the product. Rate-limit ingest and PDF generate per user. No tokens in the client.

**Logout + disconnect placement.** Overflow on Insights, not a settings app.

---

## Stack (from Phase 0)

| Piece | Choice |
|---|---|
| Compute | Cloudflare Workers (OpenNext Next.js) |
| Domain | pitchkit.app |
| DB | Neon Postgres + Hyperdrive (not D1) |
| Files | R2 (bytes). SQL = index cards only |
| Public kit | `/k/[handle]` |

UI: cream / serif / oxblood from the mocks.

---

## Data

Canonical columns: [data.md](./data.md). Do not list columns only here.

One Postgres for the kit and a later trend layer. Only Instagram Login + Insights. First kit: one page of `media`. Photos in R2. Disconnect deletes `users` + `media` + R2 `{user_id}/`; anonymous `weekly_counts` may remain. `consent_index` default off (rollups). Connect-screen copy is `disclosure_version` = 1.

---

## Sequences

**Instagram (creates the account)**

1. OAuth → token (or stub).
2. `GET /me` → `users` (handle frozen). Refresh followers + media_count.
3. One page of `GET /me/media` → `media` + R2 posters. Insights columns nullable.
4. Redirect to **Insights**.

**TikTok** — UI stub only until we add Display-API tables. No Instagram columns for it.

---

## Build order

1. Repo + OpenNext on Workers + Neon/Hyperdrive + R2 + env README.
2. Schema: `users`, `media`, empty `detections` + `weekly_counts`. Seed `demo`.
3. Insights UI from seed (no CV banner), responsive.
4. Media kit tab + public `/k/demo` + OG tags, responsive.
5. Session + stub Continue with Instagram → Insights (ingest loading state).
6. Export PDF of the kit card (desktop + iOS).
7. Owner overflow: TikTok stub, refresh, reconnect, sign out, disconnect.
8. Real Instagram Login + Graph + Insights fields (dev-mode testers).
9. Real TikTok from Insights.
10. Privacy + delete pages. Landing uses the locked disclosure (`disclosure_version` = 1). `consent_index` defaults false.

---

## Out of scope (MVP)

Email/password, magic link, Google/Apple. TikTok as login. Automatic account merge. Editable handle. Computer vision / object insights. Full archive crawl. Post-login data wizard. Kit view analytics. Custom domain. Cross-network single ER as a marketing claim. Webhooks. Queues. Workers AI.

---

## Open questions

- Exact owner path names (`/insights` vs `/app`).
- PDF engine if the host cannot generate PDFs in-process.
- Cloudflare stay vs Vercel if the first host fights us.
