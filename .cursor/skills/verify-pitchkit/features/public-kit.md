# Public kit

The public kit is what a brand sees at `/k/demo` without a Pitchkit session: creator card, Followers + Engagement rate, six-or-fewer proof posts, no owner Insights chrome.

## Sub-features

- `kit-identity` shows Demo Creator, `@demo`, and the Instagram chip.
- `kit-stats` shows Followers and Engagement rate only (no Typical reach / Saves / chart).
- `kit-posts` shows at most six posts (fewer if some are hidden).
- `kit-no-insights` omits SegmentedControl, PageHeader Insights, Recent proof, Share kit, and reach series.
- `kit-404` unknown handles (`/k/nope`) are not found.

## How to get to it (user POV)

- Open https://pitchkit.app/k/demo in a signed-out / incognito window.
- Follow a shared kit link. Share stays view.
- From landing, do **not** connect.

## Driving it with control-pitchkit

Preconditions:

- `control-pitchkit doctor` is `ok` (session not required).
- Use `--fresh` so an owner session in `.run/` cannot leak Edit / nav.
- If a prior hide left posts out, this kit may show fewer than six — still valid. Do not hide more here.

- **Open signed out.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /k/demo --fresh`. Title is `Demo Creator (@demo) · Pitchkit`. Status 200.
- **Kit card.** Body shows **Demo Creator**, `@demo`, **Followers** (`10,000` on a complete seed), **Engagement rate** (not “ER”). Contact and past brands stay hidden when blank.
- **Posts.** A card grid of six-or-fewer posts. Public seed has no Insights on posts — likes/comments, not reach/saves.
- **No owner chrome.** There is no **PitchKit primary navigation**, no PageHeader **Insights**, no **Recent proof**, no **Share kit**, no **30-day account reach**, no **Private to you**, no **Edit** switch.
- **Unknown handle.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /k/nope --fresh`. Title is `Not found` (or the not-found page). Not a kit card.
- **Proof.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs screenshot --path artifacts/public-kit/demo.png --fresh` and `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs snapshot --aria --path artifacts/public-kit/demo.aria.txt --fresh`. Artifacts identify Demo Creator and omit Insights chrome.

## Gotchas

- An owner session on `/k/demo` adds nav + Edit. That is not this feature — use `--fresh`.
- Public kit omits `reach_series` even when owner Insights shows the chart.
- Hidden posts are excluded **before** the six. A missing tile can be a leftover hide, not a rank bug. Restore via the hide-restore recipe if the kit looks permanently short.
- Handle is frozen at `demo`. An Instagram rename would not move this URL.
- Do not look for bio, website, rates, or geo — those are not on the kit.
