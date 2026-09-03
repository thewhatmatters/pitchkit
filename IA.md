# Pitchkit IA

Design + User Research. 2026-09-03. Re-review. Not a layout lock. Interviews unrun.

Bench SoT with `GLOSSARY.md`, `PLAN.md`, `AGENTS.md`, `SWOT.md`, `LIGHTS-ON.md`. Terms live in `GLOSSARY.md`. This file is the page tree plus need and entry. States are not pages. Do not invent screens.

Linear: [WHA-303](https://linear.app/whatmatters/issue/WHA-303/pitchkit-ia-grayscale-mocks-for-storybook).

Paid SKU is one rec (not a lock): PDF + custom domain + strip badge — see `LIGHTS-ON.md`. Both-URLs later; not a chapter.

```text
/                         Continue
/insights                 Insights (owner)
  └ settings              Settings
/k/[handle]               Public kit (full when sourced)
unknown / disconnected    404
```

## Pages

### Continue `/`

- **Need:** start Instagram. Disclosure + Professional note + support before the button. This is the Instagram door.
- **Entry:** open pitchkit.app. Cookie missing → `/`.
- **Not:** a dashboard.

### Insights owner `/insights`

- **Need:** creator-before-share. Same numbers as `/k/[handle]`, labeled. Whatever Graph returned — hide missing objects. Auto six, ranked saves → reach → likes. Hide/swap later (not this dump).
- **Entry:** after Continue. Cookie required; missing → `/`.
- **Not:** a second Connect. Do not restage Continue here.

### Settings

- **Need:** typed contact, typed past brands, reconnect / sign out / disconnect. Paid SKU rec (not lock) if shown.
- **Entry:** from Insights (owner chrome).
- **Not:** rates. Not a featured-upload gallery.

### Public kit `/k/[handle]` (full)

- **Need:** brand spend or pass in ~30s. Same objects as Insights when sourced.
- **Entry:** shared `pitchkit.app/k/[handle]`. Public on first successful connect.
- **Not:** a second kit. Insights is not a second page of numbers for the brand.

### 404

- **Need:** unknown or disconnected handle.
- **Entry:** `/k/[handle]` when missing or disconnected.

## States (not pages)

- **Token dead** — public kit stays on last snapshot. Owner sees Reconnect on Insights / Settings. Not a second first-run Connect.
- **No media** — empty six, not a picker. Empty kit if they pick from scratch is a fail. Hide when missing. No zeros.
- **Insights missing** — hide typical reach, saves, chart, mix. Dash, not zeros. Still Insights owner, not a thin-kit page.
- **Thin kit** — `/k/[handle]` with public-only objects (ER + Followers). A state of the public kit, not its own page.
- **Field missing** — hide that object. Dash, not zeros. Not a page.

## Killed

- Second Connect on `/insights` (Randy 2026-09-02). Continue on `/` is the door.
- Personal / no Insights as its own Insights page. Copy on Home or a line on Insights. Not a second OAuth.
- Hide-missing as a page. It is a rule on every surface.

## Never screens

- Rates
- Stories
- Pick-from-scratch empty kit
- Featured / uploaded highlights
- Map
- Vanity metrics
- Ads on the kit

## Structure (WMDS grid)

IA grayscales sit on the WMDS app grid spine (main `64c995a` / Foundation → Grid). Wrap `grid-page` + band. Place by column line. Desktop 12 / mobile 4. Baseline 8 / leading-base 24. `--spacing` stays 4px. `g` overlay same content box. Copy from WMDS — no Pitchkit Grid molecule. Structure only; look in Storybook. Kit layout held until Design locks Stat / Empty / Avatar / Chart.

### Surfaces

- **Continue `/`** — cols 3–10.
- **Insights** — header 1–6, Share 10–12; four Stats ×3; Chart full; posts + audience split.
- **`/k/`** — mobile 4-col: identity → stats 2+2 → chart → 2-up posts → audience → contact / brands.
- **Settings** — cols 3–10.

## Past brands (UR + Design 2026-09-03)

Typed proof slot. Not Graph. Hide when empty. No `GLOSSARY.md` Past brands term yet.

- **Public `/k/`** — wrap row of typed name chips. Display-only. Hide when empty. 1–4 one line; 5+ wrap. No marquee in v1.
- **Settings** — name + optional one proof line (campaign / year — not quote, rate, or logo URL). Hide proof if empty. Order = Settings list order. Not a new URL.
- **Never:** logo scrape, logo upload, marquee, testimonials-as-past-brands.
- **Peers (note):** Later typed; Beacons logos skip; OwlScran no section.

## Related

- `GLOSSARY.md` — terms, hide-when-missing, Graph. No Past brands term.
- `SWOT.md` — public kit contract.
- `LIGHTS-ON.md` — free `/k/`, paid SKU rec not lock.
- `PLAN.md` / `AGENTS.md` — point here for IA. Structure: this section.
