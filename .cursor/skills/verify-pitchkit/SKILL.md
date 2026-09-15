---
name: verify-pitchkit
description: Drive Pitchkit (pitchkit.app web UI) in a disposable browser to prove connect, Insights, owner nav, hide/restore proof, and the public kit. Use when verifying Pitchkit, proving a UI change, or running the project-local verification skill.
---

# Verify Pitchkit

Agent-facing control skill. Drive the **real web UI** the way a creator or brand does. Do not substitute unit tests, Storybook, or internal setters for a mapped feature.

Surface: Next.js App Router on Cloudflare Workers. Live: https://pitchkit.app. Public kit `/k/[handle]`. Owner Insights `/insights` behind httpOnly `pitchkit_session`. Seed handle `demo`.

Read [features/README.md](./features/README.md) before driving. Use the matching feature file as the recipe.

## Launch

Prefer the **live** site. House verification matches production, including KV `HIDDEN_KIT`.

Ready when `GET https://pitchkit.app` returns 200 and the document title is `Pitchkit`.

No local server to tear down when using live.

Local fallback (seed only; **no** Cloudflare KV — hide/restore may `persist_failed`):

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Ready when Next prints `localhost:3000`. Then set `PITCHKIT_BASE_URL=http://localhost:3000`. Tear down only the `next dev` PID you started.

Stub auth: **Continue with Instagram** POST/GET `/auth/instagram` sets `pitchkit_session` for `demo` and 303s to `/insights`. `/insights` without the cookie → `/`. `/k/demo` is public.

## Doctor

Read-only check. Run first whenever anything looks off.

```bash
node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs doctor
```

Must report `ok: true` with:

- reachable URL (live default `https://pitchkit.app`)
- `title` / identity **Pitchkit** (landing `h1` Pitchkit and/or **Continue with Instagram**)
- `session: false` is fine for public recipes

Owner recipes also need the cookie:

```bash
node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs connect
node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs doctor --require-session
```

`--require-session` fails unless `pitchkit_session` is present in the disposable context. It does not connect by itself.

## Drive

Harness: `control-pitchkit` (Playwright). Every command opens a **disposable** persistent context under `.cursor/skills/verify-pitchkit/.run/chrome` — never the user's main Chrome profile.

Install once (scoped helper; **not** the app `package.json`):

```bash
cd .cursor/skills/verify-pitchkit/helpers && npm install
```

System Google Chrome is preferred (`channel: "chrome"`). If launch fails:

```bash
cd .cursor/skills/verify-pitchkit/helpers && npx playwright install chromium
```

Exact invocations (from repo root):

```bash
H=node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs

$H doctor
$H doctor --require-session
$H connect
$H goto /
$H goto /insights
$H goto /k/demo
$H goto /k/demo --fresh
$H click --role button --name "Continue with Instagram"
$H click --name "PitchKit"
$H click --name "Insights"
$H click --name "Manage ranked post 1"
$H click --role menuitem --name "Hide from kit"
$H click --role button --name "Hide from kit"
$H click --name "Undo"
$H click --name "Restore to kit"
$H fill --role textbox --name "Contact" --value "brand@example.com"
$H screenshot --path artifacts/insights-overview/overview.png
$H screenshot --path artifacts/public-kit/demo.png --fresh --goto /k/demo
$H snapshot --aria --path artifacts/insights-overview/overview.aria.txt
$H snapshot --aria --path artifacts/public-kit/demo.aria.txt --fresh --goto /k/demo
$H eval --js "getComputedStyle(document.querySelector('.grid-page')).getPropertyValue('--grid-max').trim()"
$H cookies --name pitchkit_session
$H restore-seed
$H cleanup
$H cleanup --restore-hidden
```

`--fresh` is a one-shot context with **no** cookies (anon / incognito). Use it for brand `/k/demo`. It does not overwrite the owner session.

`click --name` without `--role` tries button / tab / radio / link / menuitem. Prefer an explicit `--role` when the map names one.

Stable handles already in product:

| Surface | Handle |
|---|---|
| Owner nav | `aria-label="PitchKit primary navigation"` · items **Insights** \| **PitchKit** |
| Stats | `aria-label="Instagram performance summary"` · Followers / **Engagement rate** / Typical reach / Saves |
| Reach chart | `aria-label="30-day account reach"` · Card title **Reach over 30 days** |
| Proof tabs | `aria-label="Rank recent proof posts by"` · Reach / Engagement / Saves |
| MoreMenu | `Manage ranked post N` / `Manage hidden post` |
| Hide confirm | AlertDialog **Hide from kit** (title: Hide this post from PitchKit?) |
| Connect | button **Continue with Instagram** |

Spell **Engagement rate**. Never assert “ER”.

Prefer read-only mapped features first (`insights-overview`, `public-kit`, `owner-nav-pitchkit` after connect). `hide-restore-proof` mutates shared live KV — restore in the same recipe.

## Evidence

Proof artifacts: `.cursor/skills/verify-pitchkit/artifacts/<feature>/` (gitignored except `.gitkeep`). Paths that start with `artifacts/` resolve there.

Standards:

- Exercise the real user path (landing button, nav items, MoreMenu, AlertDialog). Do not POST hide/restore as the proof — `restore-seed` is cleanup only.
- Capture the **action** and the **resulting state** (screenshot + ARIA/text snapshot). A final screen alone is not enough for a mutation.
- Side effects: after hide, a `--fresh` `/k/demo` must drop the post (KV SoT). After restore, that anon view must show it again.
- Mocks: none. Live seed is the fixture. Local `next dev` is seed without KV.

## Cleanup

```bash
node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs cleanup
```

Closes leftover Playwright contexts and deletes `.run/` (disposable profile). **Never deletes** `artifacts/`.

If this run hid a proof post (or you are unsure):

```bash
node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs cleanup --restore-hidden
```

That POSTs `/api/media/restore` for all six seed media IDs, then removes `.run/`. Still leaves evidence on disk.

Do not kill `chrome` / `next` by process name. Kill only what this run started.

## Helpers

Executable: [helpers/control-pitchkit.mjs](./helpers/control-pitchkit.mjs). Playwright lives in [helpers/package.json](./helpers/package.json) so the app lockfile stays clean.

Env: `PITCHKIT_BASE_URL` (default `https://pitchkit.app`), `PITCHKIT_VERIFY_DIR` (default `<skill>/.run`), `PITCHKIT_HEADED=1`, `PITCHKIT_VIEWPORT=1280x800`.

## Dry-run

Doctor → drive **insights-overview** → evidence path:

```bash
H=node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs
$H doctor
$H connect
$H doctor --require-session
# then features/insights-overview.md
# evidence: .cursor/skills/verify-pitchkit/artifacts/insights-overview/
$H cleanup
```

## Isolate

Live `demo` is a **shared** seed. Hide/restore writes KV `HIDDEN_KIT`. Two agents hiding at once will fight. Prefer restoring already-hidden posts; never leave `/k/demo` permanently missing a post without Restore. Owner cookie `pitchkit_hidden` is a reload mirror only — brands read KV.

## Maintain

`/maintain-verification-skill` keeps this map honest as the app changes.
