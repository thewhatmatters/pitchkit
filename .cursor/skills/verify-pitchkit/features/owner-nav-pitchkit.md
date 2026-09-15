# Owner nav ↔ PitchKit

Owner primary navigation is a SegmentedControl — **Insights** / **PitchKit** — on the 1140 owner grid. PitchKit is the shareable `/k/demo` page; Insights stays private.

## Sub-features

- `nav-insights` keeps Insights selected on `/insights`.
- `nav-pitchkit` switches to `/k/demo` and shows the kit card.
- `nav-back` returns from PitchKit to `/insights`.
- `nav-grid` uses owner `--grid-max:1140px` and 8px gutters on both owner views (WHA-309).
- `nav-absent-anon` hides this chrome on a brand `/k/demo`.

## How to get to it (user POV)

- After connect, use the top SegmentedControl on Insights.
- After connect, open `/k/demo` (owner session) and use the same control.
- Account (`/settings`) is a footer link — not a third nav item.

## Driving it with control-pitchkit

Preconditions:

- `control-pitchkit connect` and `doctor --require-session` succeeded.
- Start on `/insights`.

- **See nav.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /insights`. A control named **PitchKit primary navigation** contains **Insights** and **PitchKit**. Insights is the current view. Footer has a quiet **Account** link, not a third segment.
- **Open PitchKit.** Choose PitchKit. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --role radio --name "PitchKit"`. Path is `/k/demo`. Title is `Demo Creator (@demo) · Pitchkit`. The kit card shows **Demo Creator**, `@demo`, Followers, and Engagement rate. Owner **Edit** switch may be present; Insights PageHeader / Recent proof / Share kit are absent on this page.
- **Owner grid on kit.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs eval --js "getComputedStyle(document.querySelector('.grid-page')).getPropertyValue('--grid-max').trim()"`. `value` is `1140px`. `--grid-column-gap` and `--grid-gutter` are `8px`.
- **Return to Insights.** Choose Insights. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --role radio --name "Insights"`. Path is `/insights`. PageHeader **Insights** returns.
- **Anon has no nav.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /k/demo --fresh`. There is no **PitchKit primary navigation** and no **Edit** switch.
- **Proof.** Capture both owner views. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /insights` then `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs screenshot --path artifacts/owner-nav-pitchkit/insights.png` and `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs snapshot --aria --path artifacts/owner-nav-pitchkit/insights.aria.txt`. Repeat after `click --name "PitchKit"` into `artifacts/owner-nav-pitchkit/pitchkit.png` and `pitchkit.aria.txt`.

## Gotchas

- SegmentedControl items expose as **radio** in radiogroup **PitchKit primary navigation** (observed on live). If `--role radio` misses after a WMDS change, retry `--name "PitchKit"` (auto roles).
- Share link / a brand opening `/k/demo` must stay view — do not treat owner Edit as the public kit.
- Settings is account only. Do not expect Insights / PitchKit on `/settings`.
- Public (non-owner) `AppFrame` does not set `--grid-max:1140px`. Assert 1140 only on owner views.
- `GridOverlay` is Storybook-only. Product chrome must not show grid-debug controls.
