# Connect session

Connect session lets a creator read the collection note, tap **Continue with Instagram**, and land on private Insights with a Pitchkit session for seed handle `demo`.

## Sub-features

- `connect-disclosure` shows the locked collection note before the button.
- `connect-continue` submits **Continue with Instagram** and sets `pitchkit_session`.
- `connect-insights` lands on `/insights` (not `/`).
- `connect-gate` keeps `/insights` off-limits without that cookie.

## How to get to it (user POV)

- Open https://pitchkit.app (or `/`) and choose **Continue with Instagram**.
- Reconnect from Insights via **Reconnect Instagram** (same stub path).
- GET or POST `/auth/instagram` in a browser (same cookie + 303). Prefer the button.

## Driving it with control-pitchkit

Preconditions:

- `control-pitchkit doctor` reports Pitchkit identity at the base URL.
- Disposable context has no session yet (fresh `.run/` or after `cleanup`).

- **Open landing.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /`. Title is `Pitchkit`. The heading reads `Pitchkit`. Body includes the disclosure: we only use public posts and Instagram Insights; we don’t read DMs, who you follow, or unfollowers.
- **See the button.** Snapshot. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs snapshot --aria --path artifacts/connect-session/landing.aria.txt` and `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs screenshot --path artifacts/connect-session/landing.png`. The artifacts show **Continue with Instagram** and the Professional-account note.
- **Continue.** Choose the button. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --role button --name "Continue with Instagram"`. The URL path becomes `/insights`.
- **Session present.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs cookies --name pitchkit_session`. `present` is `true` and `httpOnly` is `true`.
- **Doctor with session.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs doctor --require-session`. `ok` is `true`.
- **Gate without cookie.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /insights --fresh`. The URL is `/` (307), not Insights chrome.
- **Proof.** Capture Insights after connect. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs screenshot --path artifacts/connect-session/insights.png` and `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs snapshot --aria --path artifacts/connect-session/insights.aria.txt`. Artifacts show PageHeader **Insights** and nav **Insights** / **PitchKit**.

## Gotchas

- Without `IG_APP_ID` / `IG_APP_SECRET` the path is still the seed stub (not an Instagram token). Seed tokens stay null. A live Meta dialog on production means those secrets are set — that is Phase 2 Auth, not a regression.
- `/insights` without `pitchkit_session` redirects home. Do not treat a landing screenshot as a connected session.
- Reconnect re-sets the same seed session. It does not create a second handle. WHA-313 optional URL update is live OAuth only.
- `GET /auth/instagram` also sets the cookie. Using that URL skips the disclosure — do not call the disclosure sub-feature verified.
- Sign out (`/auth/sign-out`) clears the session. A later owner recipe must `connect` again.
