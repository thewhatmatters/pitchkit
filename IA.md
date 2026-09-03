# Pitchkit IA

Design + User Research. 2026-09-02. Not a layout lock. Grayscale mocks later for Storybook — not this file.

Bench SoT with `GLOSSARY.md`, `PLAN.md`, `AGENTS.md`, `SWOT.md`, `LIGHTS-ON.md`. Terms live in `GLOSSARY.md`. This file is every surface, who it is for, and the entry path. Do not invent screens.

Linear: [WHA-303](https://linear.app/whatmatters/issue/WHA-303/pitchkit-ia-grayscale-mocks-for-storybook).

## Surfaces

### Home `/`

- **Who:** anyone, not logged in.
- **Entry:** open pitchkit.app. Disclosure + Professional note + support before Continue with Instagram.
- **Job:** start connect. Not a dashboard.

### Connect fail

- **Who:** creator whose Instagram login failed (personal account or cancel).
- **Entry:** Home `/` → Continue with Instagram → fail.
- **Job:** land back on Home with the Professional message, or unchanged Home. No blank Insights.

### Insights connected

- **Who:** owner cookie. Insights exist.
- **Entry:** successful connect, or cookie return to `/insights`.
- **Job:** creator-before-share. Same numbers as `/k/[handle]`, labeled. Last-updated. Hide/swap later (not this dump). Auto six, ranked saves → reach → likes.

### Insights no Insights

- **Who:** owner cookie. Public likes/comments only — Graph Insights missing.
- **Entry:** same as Insights connected.
- **Job:** still show ER + Followers. Hide typical reach, saves, 30-day chart, and mix objects. Dash, not zeros. Empty kit if they have to pick posts from scratch is a fail.

### Settings

- **Who:** owner cookie.
- **Entry:** from Insights (owner chrome).
- **On it:** contact (typed), past brands (typed), reconnect / sign out / disconnect. Paid SKU rec (not a lock): PDF + custom domain + strip badge — see `LIGHTS-ON.md`.
- **Not on it:** rates.

### Public kit `/k/[handle]`

- **Who:** brand. No account.
- **Entry:** shared `pitchkit.app/k/[handle]`. Public on first successful connect.
- **Job:** spend or pass in ~30s. Same objects as Insights when sourced. Hide when missing. Dash, not zeros.

### Public kit thin

- **Who:** brand. Insights not connected or objects missing.
- **Entry:** same `/k/[handle]`.
- **Job:** still name/handle, Followers, ER (likes + comments) ÷ followers. Hide Insights objects. Dash, not zeros. Auto six from public likes if we have media.

### Custom host later, same kit

- **Who:** brand on `their.domain` `/`.
- **Entry:** paid SKU item 2 (rec, not lock). Not built this round. Painting hostnames later. Cloudflare for SaaS already ON.
- **Job:** **same** public kit as `pitchkit.app/k/[handle]`. No redirect either way. Insights stays on pitchkit.app (cookie never on their host). Not a paywall of `/k/`. Diagram: `ARCHITECTURE.md` / [WHA-302](https://linear.app/whatmatters/issue/WHA-302).

## Not screens

Do not invent these:

- Rates
- Stories
- Uploaded highlights (Later Featured Media)
- Map
- Vanity metrics (profile views, bio-link clicks, impressions, average likes)
- Marketplace
- Ads on the kit

## Related

- `GLOSSARY.md` — terms, hide-when-missing, Graph.
- `SWOT.md` — public kit contract.
- `LIGHTS-ON.md` — free `/k/`, paid SKU rec not lock.
- `PLAN.md` / `AGENTS.md` — point here for IA.
