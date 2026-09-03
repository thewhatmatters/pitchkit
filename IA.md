# Pitchkit IA

Design + User Research. 2026-09-02. Re-reviewed with Randy: every surface needs an entry path. Not a layout lock. Interviews unrun.

Two jobs: **Brand** on `/k/[handle]` (~30s spend/pass). **Creator** on `/insights` (trust, then share).

## Tree

```
pitchkit.app
└── /  Continue                         PAGE  only Instagram door
    ├── personal / deny → stay on Home  copy, not a page
    └── success → /insights             PAGE  creator reviews; brands never see this URL
        ├── kit-edit (same URL)         STATE  type contact + past brands inline on the preview
        ├── token dead → Reconnect      STATE  only later IG button
        ├── no media → empty six        STATE  not a picker
        ├── Insights missing            STATE  hide objects, same page
        ├── Settings                    PAGE  account only (reconnect / sign out / disconnect)
        └── Share → /k/[handle]         PAGE  brand 30s
              ├── full kit
              ├── thin kit              STATE  hide Insights objects, not zeros
              ├── a field missing       RULE   hide that object, not a page
              └── unknown → 404         PAGE  not someone else’s kit
```

## Pages (earn a surface)

| Surface | Need | Entry |
|---|---|---|
| `/` Continue | Only Instagram door. Signup = login. Professional copy lives here. | Logged out. `/insights` with no cookie. |
| `/insights` owner | Creator checks the kit before a brand. Brands never see this URL. | Continue succeeded. |
| Settings | Account only: reconnect / sign out / disconnect. Not showcase fields. | From Insights. Not a second product. |
| `/k/[handle]` full | Brand 30s spend/pass. Display-only. | Creator shares the link. |
| `/k/[handle]` 404 | Unknown is not someone else’s kit. | Bad or disconnected handle. |

## States (same URL, not a new page)

| State | Need | Lives on |
|---|---|---|
| Kit-edit | Type contact + past brands (and other showcase holes) **inline on the Insights preview**. Empty slots are holes on the preview — not a form that replaces it. Same job as hide/swap: make the kit ready before Share. | `/insights` |
| Token dead | Only later IG button. `/k/` keeps last snapshot. | `/insights` |
| No media | Empty six, not a picker. Followers still show if sourced. | `/insights` |
| Insights missing | Hide reach/saves/chart/geo. Never zeros. | `/insights` and `/k/` |
| Thin kit | Honest public kit when Insights never landed. | `/k/[handle]` |
| Field missing | Hide that object (no bio, <100 demo). | `/k/` / Insights |

## Killed (no door)

Second Connect on Insights. Personal Insights page (copy on Home). Hide-missing as its own page. Rates. Stories. Pick-from-scratch. Featured upload. Map. Vanity stats. Ads on `/k/`. `/edit` URL. `/settings/brands`. Past brands / contact inside Settings. Paid SKU rec is not a screen this round. Both-URLs later, same kit.

Linear: [WHA-303](https://linear.app/whatmatters/issue/WHA-303/pitchkit-ia-grayscale-mocks-for-storybook).

## Past brands (UR + Design 2026-09-03)

Lock. Interviews unrun. ENTRY hybrid (Randy + UR 2026-09-03).

- **Public `/k/`:** wrap row of typed **name chips**, display-only. Hide the section when empty. 1–4 one line; 5+ wrap. **No** auto-scroll marquee v1 (fights the 30s scan; names must stay screenshotable).
- **ENTRY (kit-edit on `/insights`):** type name + optional one **proof line** (campaign/year — not a quote, not a rate, not a logo URL) **inline on the Insights preview**. Hide the proof line if empty. Display order = Insights list order. Contact types here too. Do **not** invent `/edit` or `/settings/brands`.
- **Settings:** account only (reconnect / sign out / disconnect). **Not** where you list collaborations or contact.
- **Never:** logo scrape, logo upload, marquee, testimonials-as-past-brands, past brands in Settings.
- Peers (evidence 2026-09-03): **Later** public kit = one metadata row, comma-separated **plain text** names (omit if empty; no logos/chips/links) — Past Collaborations lives on the kit profile, not account settings. CollabKit / CreatorsJet / Beacons use **uploaded logos** (carousel / logo card / View) — do **not** steal. Infinite marquee not seen. OwlScran domain-logo scrape on case-study modal — skip. Connoisseur not a creator-kit product. Interviews unrun. **Wrap chips** still win for the 30s scan vs Later’s comma line (overflow-x can drop names off a screenshot).

## Structure (WMDS grid)

IA grayscales sit on the WMDS **app** grid spine (`64c995a` / Foundation → Grid):

- Wrap: `grid-page` + `band` (subgrid). Place by column line.
- Desktop: 12 cols. Mobile: 4 cols. Baseline 8px / `--leading-base` 24px. `--spacing` stays 4px.
- Press **g** overlay shares the `grid-page` content box (not the viewport).
- Copy from WMDS — do not invent a Pitchkit Grid molecule.
- Structure only. Look still designed in Storybook before engineering. Kit layout held until Design locks components (Stat, Empty, Avatar, Chart…).

Surfaces on the spine:

| Surface | Band sketch |
|---|---|
| `/` Continue | Content band cols 3–10 (desktop) |
| `/insights` | Header 1–6 + Share 10–12; four Stats ×3; Chart 1–12; posts + audience; **kit-edit holes** for contact + past brands inline on the preview; footer account link |
| `/k/[handle]` mobile | 4-col: identity → stats 2+2 → chart → 2-up posts → audience → contact/brands chips |
| Settings | Account actions only in cols 3–10 |
