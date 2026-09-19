# Owner nav ↔ PitchKit

Owner primary navigation is the Pattern — creator Insights three-column header: PitchKit label, a hug SegmentedControl — **Insights** / **PitchKit** — and Avatar. PitchKit is Pattern — owner PitchKit on `/insights` (shareable sections + hide/restore posts; Coming soon retired). The public kit stays on `/k/demo` without owner chrome. Insights stays private. Do not expect `layout="stretch"`, a full-width control, or a hard navigation to `/k/demo`.

## Sub-features

- `nav-insights` keeps Insights selected on `/insights`.
- `nav-pitchkit` switches the PitchKit segment in place and shows the owner kit (not Coming soon).
- `nav-back` returns from PitchKit to Insights without leaving `/insights`.
- `nav-grid` uses owner `--grid-max:1140px` and 8px gutters on both owner views (WHA-309).
- `nav-absent-anon` hides this chrome on a brand `/k/demo`.

## How to get to it (user POV)

- After connect, use the top SegmentedControl on Insights.
- Account settings opens from the header Avatar (Dialog) — not a third nav item or footer link.

## Driving it with control-pitchkit

Preconditions:

- `control-pitchkit connect` and `doctor --require-session` succeeded.
- Start on `/insights`.

- **See nav.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /insights`. The header shows a **PitchKit** brand label, a hug control named **PitchKit primary navigation** (**Insights** / **PitchKit**), and an Avatar that opens Account settings. Insights is the current view. No footer **Account** or **Delete** link.
- **Open PitchKit.** Choose PitchKit. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --role radio --name "PitchKit"`. Path stays `/insights`. Body shows the owner kit: PageHeader **PitchKit** + **Share kit**, **Demo Creator**, `@demo`, **Followers**, **Engagement rate**, **Selected posts**, and MoreMenu **Manage selected post N** / **Hide from kit**. No **Coming soon** badge. No bio / website / rates / Edit switch. Insights PageHeader / Recent proof stay on the Insights segment.
- **Owner grid on kit.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs eval --js "getComputedStyle(document.querySelector('.grid-page')).getPropertyValue('--grid-max').trim()"`. `value` is `1140px`. `--grid-column-gap` is `8px` (Pattern Show code). Do not require `--grid-gutter:8px` on this shell.
- **Return to Insights.** Choose Insights. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --role radio --name "Insights"`. Path is still `/insights`. PageHeader **Insights** returns.
- **Anon has no nav.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /k/demo --fresh`. There is no **PitchKit primary navigation** and no **Edit** switch or **Manage selected post**. The public kit (Demo Creator, Selected posts) is on this URL — no owner hide chrome.
- **Proof.** Capture both owner views. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /insights` then `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs screenshot --path artifacts/owner-nav-pitchkit/insights.png` and `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs snapshot --aria --path artifacts/owner-nav-pitchkit/insights.aria.txt`. Repeat after `click --name "PitchKit"` into `artifacts/owner-nav-pitchkit/pitchkit.png` and `pitchkit.aria.txt`.

## Gotchas

- SegmentedControl items expose as **radio** in radiogroup **PitchKit primary navigation** (observed on live). If `--role radio` misses after a WMDS change, retry `--name "PitchKit"` (auto roles).
- Each harness command relaunches the browser. In-page PitchKit state does not survive a later `goto` / `screenshot` unless that command starts from Insights and clicks PitchKit in the same process. Prefer `click` then `screenshot` only when the harness keeps the page; otherwise `goto /insights` shows Insights again.
- Share link / a brand opening `/k/demo` must stay the public freeze — no MoreMenu / hide.
- Settings is account only. Do not expect Insights / PitchKit on `/settings`.
- Public `/k/demo` copies the shareable Pattern (`--grid-max:1140px`). Assert 1140 on owner Insights and the public kit.
- `GridOverlay` is Storybook-only. Product chrome must not show grid-debug controls.
