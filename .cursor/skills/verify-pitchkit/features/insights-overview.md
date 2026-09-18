# Insights overview

Insights overview is the owner home after connect: PageHeader **Insights**, a four-up performance summary, the 30-day Reach chart Card when a series exists, and Audience RankedBars when mixes are present.

## Sub-features

- `insights-header` shows PageHeader title Insights plus private cue.
- `insights-stats` shows Followers, Engagement rate, Typical reach, and Saves on the four-up.
- `insights-reach-chart` shows the outlined Reach Card and `30-day account reach` plot (WHA-310 well).
- `insights-audience` shows Audience fit RankedBars when mixes are non-empty.
- `insights-empty-hide` hides empty chart series and empty audience mixes (do not invent zeros).

## How to get to it (user POV)

- After **Continue with Instagram**, land on `/insights`.
- From owner PitchKit, choose **Insights** in primary navigation.
- Open `/insights` while `pitchkit_session` owns `demo`.

## Driving it with control-pitchkit

Preconditions:

- Live (or local) Pitchkit is healthy.
- `control-pitchkit connect` succeeded and `doctor --require-session` is `ok`.
- Prefer a complete seed kit (restore hidden posts first if a prior hide-restore left rows Hidden).

- **Open Insights.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /insights`. Path is `/insights`. Heading **Insights**. Copy includes **Private to you** and **Engagement rate = (likes + comments) ÷ followers.**
- **Four-up Stats.** The group `Instagram performance summary` lists **Followers**, **Engagement rate**, **Typical reach**, and **Saves**. Seed complete-kit values: Followers `10,000`, Engagement rate `9.9%`, Typical reach `2,175`, Saves `42`. Live may already have a Hidden proof post (`N shown` < 6); typicals stay on the six-or-fewer still shown. Still require the four labels and no “ER”.
- **Reach chart.** A Card titled **Reach over 30 days** is present (`[data-chart-slot="reach"]`). The plot waits for a real host width inside the occupant well (WHA-310). Screenshot/snapshot/eval settle for `[aria-label="30-day account reach"]` in the **same** process — a standalone `wait` cannot help the next command. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs eval --js "document.querySelector('[aria-label=\"30-day account reach\"]') !== null"` (expect `true`) and `data-x-ticks` not `"0"`. Occupant well plus painted area both visible.
- **Audience.** When mixes exist, **Audience fit** is visible with RankedBars named **Audience by countries**, **Audience by cities**, **Audience by age**, and **Audience by gender**. If a mix is empty, that section is absent (no zero bars).
- **Gap tokens.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs eval --js "getComputedStyle(document.querySelector('.grid-page')).getPropertyValue('--grid-max').trim()"` (expect `1140px`) and the same for `--grid-column-gap` (expect `8px`). Pattern canvas does not set `--grid-gutter` on this `<main>`.
- **Page surface.** `document.body` class list includes `bg-body` and `min-h-screen`. Body and `.grid-page` share the same computed background — no white margins around a gray column.
- **Proof.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs screenshot --path artifacts/insights-overview/overview.png` and `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs snapshot --aria --path artifacts/insights-overview/overview.aria.txt`. Both identify Pitchkit, Insights, the four Stat labels, and the reach chart name.

## Gotchas

- Brands never see this page. A `--fresh` `/insights` redirects to `/`.
- Public `/k/demo` omits `reach_series`. Do not expect this chart on the public kit.
- Hide the whole Reach band when the series is empty — a title-only Card is a fail.
- Spell **Engagement rate**. A label “ER” is a fail.
- `/insights?grid=pulling` is a loading variant. Default dry-run uses `/insights` with seed ready.
- Do not invent period-over-period trends. Seed has none.
- Each harness command is a new browser. `goto` then a later `wait` does not keep the painted page. Screenshot/snapshot/eval settle the Reach plot themselves when `[data-chart-slot="reach"]` is present. Pass `--wait-selector` for anything else.
- Live `demo` may already show a Hidden proof row (observed: **5 shown** + **Manage hidden post**). That is leftover KV, not a failed overview. Do not hide another post from this recipe.
- Owner nav items are **radio**s in radiogroup **PitchKit primary navigation**. Proof rank controls are **tab**s.
