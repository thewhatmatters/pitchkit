# Pitchkit IA

Design + User Research. 2026-09-02. Re-reviewed with Randy: every surface needs an entry path. Not a layout lock. Interviews unrun.

Two jobs: **Brand** on `/k/[handle]` (~30s spend/pass). **Creator** on `/insights` (trust Graph, then share).

## Tree

```
pitchkit.app
└── /  Continue                         PAGE  only Instagram door
    ├── personal / deny → stay on Home  copy, not a page
    └── success → /insights             PAGE  Graph objects only; brands never see this URL
        ├── token dead → Reconnect      STATE  only later IG button
        ├── no media → empty six        STATE  not a picker
        ├── Insights missing            STATE  hide objects, same page
        ├── hide / swap                 STATE  same URL (Graph objects)
        ├── Settings                    PAGE  account only (reconnect / sign out / disconnect)
        └── Share → /k/[handle]         PAGE  opens in VIEW (creator grid-checks the real URL)
              ├── view                  STATE  default for everyone (brand + owner check)
              ├── edit (owner only)     STATE  same URL; Edit control toggles contact + past brands
              ├── thin kit              STATE  hide Insights objects, not zeros
              ├── a field missing       RULE   hide that object, not a page
              └── unknown → 404         PAGE  not someone else’s kit
```

## Pages (earn a surface)

| Surface | Need | Entry |
|---|---|---|
| `/` Continue | Only Instagram door. Signup = login. Professional copy lives here. | Logged out. `/insights` with no cookie. |
| `/insights` owner | Trust Graph objects before Share. **Stats only** — no contact / past brands. | Continue succeeded. Brands never see this URL. |
| Settings | Account only: reconnect / sign out / disconnect. Not showcase fields. | From Insights. Not a second product. |
| `/k/[handle]` full | Brand 30s spend/pass. Owner grid-checks what a brand will see. Showcase lives here. | Creator Share (opens **view**). Direct link. |
| `/k/[handle]` 404 | Unknown is not someone else’s kit. | Bad or disconnected handle. |

## States (same URL, not a new page)

| State | Need | Lives on |
|---|---|---|
| `/k/` view | Default for everyone. Brand 30s; owner checks the real share URL. | `/k/[handle]` |
| `/k/` edit | Owner session only. Edit control toggles **edit state on that same URL** for contact + past brands (name + optional proof). Not `/edit`. Not `?edit=` on the share link (brands must not land in edit). Brands never see edit chrome. | `/k/[handle]` |
| Token dead | Only later IG button. `/k/` keeps last snapshot. | `/insights` |
| No media | Empty six, not a picker. Followers still show if sourced. | `/insights` |
| Insights missing | Hide reach/saves/chart/geo. Never zeros. | `/insights` and `/k/` |
| Thin kit | Honest public kit when Insights never landed. | `/k/[handle]` |
| Field missing | Hide that object (no bio, <100 demo). | `/k/` / Insights |

## Killed (no door)

Second Connect on Insights. Personal Insights page (copy on Home). Hide-missing as its own page. Rates. Stories. Pick-from-scratch. Featured upload. Map. Vanity stats. Ads on `/k/`. `/edit` URL. `?edit` on the share link. `/settings/brands`. Past brands / contact on Insights. Past brands / contact inside Settings. Paid SKU rec is not a screen this round. Both-URLs later, same kit.

Linear: [WHA-303](https://linear.app/whatmatters/issue/WHA-303/pitchkit-ia-grayscale-mocks-for-storybook).

## Past brands (UR + Design 2026-09-03)

Lock. Interviews unrun. ENTRY = **kit view/edit** (Randy + UR re-lock 2026-09-03).

- **Public `/k/` view:** wrap row of typed **name chips**, display-only. Hide the section when empty. 1–4 one line; 5+ wrap. **No** auto-scroll marquee v1.
- **ENTRY (`/k/` edit, owner only):** type name + optional one **proof line** (campaign/year — not a quote, not a rate, not a logo URL) on the **kit** edit state. Hide proof if empty. Display order = kit list order. Contact types here too. Toggle via Edit on the same `/k/[handle]` URL. Do **not** invent `/edit` or `?edit` on the share link.
- **`/insights`:** Graph objects only (followers, ER, reach, saves, chart, posts, geo). Hide/swap stays here. **No** contact or past-brands holes.
- **Settings:** account only (reconnect / sign out / disconnect). **Not** collaborations or contact.
- **Share:** from Insights opens `/k/` in **view** so the creator does the grid check on the real URL.
- **Never:** logo scrape, logo upload, marquee, testimonials-as-past-brands, past brands on Insights or in Settings.
- Peers: **Later** = comma-separated plain text on the kit profile (not account settings). Beacons / CollabKit / CreatorsJet = uploaded logos — do **not** steal. OwlScran domain-logo scrape — skip. Connoisseur not a creator-kit product. Interviews unrun. **Wrap chips** still win for the 30s scan.

## Structure (WMDS grid)

IA grayscales sit on the WMDS **app** grid spine (`64c995a` / Foundation → Grid):

- Wrap: `grid-page` + `band` (subgrid). Place by column line.
- Desktop: 12 cols. Mobile: 4 cols. Baseline 8px / `--leading-base` 24px. `--spacing` stays 4px.
- Press **g** overlay shares the `grid-page` content box (not the viewport).
- Copy from WMDS — do not invent a Pitchkit Grid molecule.
- Structure only. Look still designed in Storybook before engineering.

Surfaces on the spine:

| Surface | Band sketch |
|---|---|
| `/` Continue | Content band cols 3–10 (desktop) |
| `/insights` | Header + Share; Graph Stats; Chart; posts + audience. **No** contact/past-brands holes. Footer → Settings |
| `/k/[handle]` view | 4-col mobile: identity → stats → chart → posts → audience → contact + brand chips |
| `/k/[handle]` edit | Same bands; owner Edit toggles inline holes for contact + past brands (name + proof) |
| Settings | Account actions only in cols 3–10 |
