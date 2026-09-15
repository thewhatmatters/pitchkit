# Pitchkit verification map

This directory is the maintained source for verifying the user-facing behavior of Pitchkit. Read the index before driving the app, then use the matching feature file as the recipe.

Grown from surfaces Randy still verifies by hand and from observed failures (WHA-309 gap tokens, WHA-310 chart well, WHA-311/312 hide reload + KV / cold Map). Not a catalog of every route.

## Baseline preconditions

- Prefer live `https://pitchkit.app`. Set `PITCHKIT_BASE_URL` only for local `npm run dev`.
- Seed handle is `demo`. Stub connect is **Continue with Instagram**.
- Run `control-pitchkit doctor` and require title/identity Pitchkit before any recipe.
- Owner recipes: `control-pitchkit connect` then `doctor --require-session`.
- Harness profile is `.cursor/skills/verify-pitchkit/.run/` — never the user's main Chrome profile.
- Brand / anon views use `goto --fresh` (or `screenshot` / `snapshot --fresh`).
- Live hide/restore mutates shared KV `HIDDEN_KIT`. Prefer read-only features first.

## Driving conventions

- Start every recipe from the baseline unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or coordinates.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions through `control-pitchkit` from the repo root.
- Restore hidden seed posts after any hide. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with Pitchkit identity visible.
- Mutation proof includes a second view: reload Insights and a `--fresh` `/k/demo`.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control-pitchkit` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Connect session](./connect-session.md) — landing → Continue with Instagram → `/insights` with a session.
- [Insights overview](./insights-overview.md) — PageHeader, four-up Stats, Reach chart, Audience bars. **Dry-run target.**
- [Owner nav ↔ PitchKit](./owner-nav-pitchkit.md) — SegmentedControl Insights / PitchKit on the 1140 owner grid.
- [Hide / restore proof](./hide-restore-proof.md) — MoreMenu hide → dialog → toast Undo; reload + anon kit; Restore. Mutates live KV.
- [Public kit](./public-kit.md) — `/k/demo` without a session: kit card, six-or-fewer posts, no Insights chrome.
