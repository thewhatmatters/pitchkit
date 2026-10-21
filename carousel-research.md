# Pitchkit — "Selected posts" mobile carousel research
Tue Oct 13, 2026 · Product Designer · research only, no mockups

Context: a brand views a creator kit at 390px. Each card is a 4:5 post image with reach and saves stats under it. Randy's last call was "stack on mobile, not 2 across"; this checks whether a carousel serves brands better, and whether the WMDS Carousel fits.

## 1. Examples
Mobbin examples were checked against their screenshots. The "Known pattern" rows come from how those apps behave today and were not screenshotted on Mobbin in this pass, so verify them before quoting.

| # | Example | Peek | Snap | Indicator | Stats on/under | Tap |
|---|---|---|---|---|---|---|
| 1 | [Bumble — Recommended for you](https://mobbin.com/screens/328120b3-9e91-435d-b8ac-162f25bc98f7) | Centered card, ~10% peek on both sides | Per card, centered | None | Under (name, verified tick, action) | Opens profile |
| 2 | [LinkedIn — Trending employee content](https://mobbin.com/screens/3e3cb3f8-fff7-4d86-8a64-848efadc6f99) | Centered, ~8% on both sides | Per card, centered | "1/2" counter on the image (inner carousel) | Under (reactions · comments) | Opens post |
| 3 | [Grab — profile "Posts"](https://mobbin.com/screens/8e869839-7341-41c1-b42c-a556bf93129a) | Left-aligned, ~2.3 cards visible | Leading edge | None; → arrow in the header goes to see-all | Under (views · likes), closest to Pitchkit | Opens post |
| 4 | [Givingli — card shelves](https://mobbin.com/screens/af61dba2-5bd8-40bf-afff-71982ee4c15e) | Left-aligned, ~2.3 portrait cards | Leading edge | None; "View All" link | Under (maker plus heart) | Opens item |
| 5 | [Lloyds — Speed reads](https://mobbin.com/screens/df9b77da-1d8f-4cad-883b-5bc2d98bf363) | Left-aligned, ~12% peek | Per card | Dots with ‹ › arrows | Under (title, CTA) | Opens article |
| 6 | [Tripadvisor — Traveler photos](https://mobbin.com/screens/2c3a3b0e-dfea-4fe4-b76f-ea70f63689ec) | Left-aligned, ~2.3 visible | Free scroll | None | n/a | Opens photo |
| 7 | [Substack — note with media](https://mobbin.com/screens/49db91f0-0f7f-4b86-8148-6ccae650a5d5) | Leading card ~75%, next card peeks | Per card | None | Under the note | Opens media |
| 8 | Instagram feed carousel post (known pattern) | None, full bleed | Per page | "1/10" counter top-right on the image, plus dots under it | Under (likes) | Double-tap likes, tap shows tags |
| 9 | App Store screenshots / Today shelves (known pattern) | Left-aligned, ~15–20% peek | Leading edge | None | Under (app name, Get) | Opens detail |
| 10 | Airbnb listing card photos (known pattern) | None inside the card | Per photo | Dots on the image | Under (price, rating) | Opens listing |
| 11 | Spotify home shelves (known pattern) | ~2.4 visible | Free scroll | None | Under (title) | Plays or opens |

Creator tools: Beacons and Linktree media kits mostly show posts in a static grid or list with stats under each item, with no carousel. Treat that as general knowledge; it was not checked on Mobbin this pass.

What the examples share:
- Stats always sit **under** the image, never on it. The one overlay is a counter.
- The leading-edge snap with a ~15–20% peek is the native "there's more" cue, and it needs no indicator.
- A counter shows up when the exact position matters (Instagram, LinkedIn). Dots show up for short sets (Lloyds, Airbnb).

## 2. WMDS Carousel (thewhatmatters/wmds)
Files: `src/components/organisms/Carousel/Carousel.tsx` and `docs/adr/0043-carousel.md` (Accepted, Oct 7 2026), plus the pattern `docs/patterns/components-carousel--image-carousel.tsx`.

API: `<Carousel aria-label|aria-labelledby itemWidth snap bleed fade progress labels className><Carousel.Item>…</Carousel.Item></Carousel>`
- `itemWidth`: a percentage of the row, either one number or `{ base, sm, md, lg }`, resolved with container query units so it's the same on the server. The gap is the grid gutter.
- `snap`: default true. Mandatory CSS snap to each item's **leading edge**, turned off while a drag or animation moves the row.
- `bleed`: the row runs to the page edges while items still start on the grid, with no sideways page scroll.
- `fade`: `scroll-fade-x` edge fades, cleared on an edge with nothing clipped.
- `progress`: `center` (default), `start`, `full` or `none`. This is a draggable 4px scrubber track under the row with a 44px hit area. It's aria-hidden and not a tab stop, and it keeps its space even when everything fits.
- `labels.item(position, count)`: each item is `role="group"` named like "2 of 4". The row is a labelled region and the tab stop, with ←/→ and Home/End keys.
- Native scroller (touch, trackpad, RTL), Motion pointer drag with inertia and a soft overscroll stop, and reduced-motion support.
- Not included: prev/next buttons (the ADR says they can be added later as a prop), a visible counter, dots, center snap, and loop or autoplay (fine, we don't want those).

## 3. Recommendation
**Pattern: left-aligned peek carousel with a visible "1 of 6" counter. Stats sit under each card, and tapping opens the post.**
- `itemWidth={{ base: 82 }}`: one 4:5 card at ~300px wide, with ~16% of the next card peeking.
- Leading-edge snap, which WMDS already does. `bleed` on, so the peek runs to the screen edge.
- Under each image: **Reach** and **Saves** in tabular numerals, each with a Verified / Creator-reported source tag from the trust layer, plus the post date.
- In the section header: "Selected posts · 6" on the left and a live "1 of 6" counter on the right, with an optional "See all" that switches to the stacked list Randy asked for.
- Tap opens the post detail or the IG permalink. No double-tap, no autoplay, no loop.

Why it helps brands judge credibility:
- The peek shows there's more than one hero post without spending vertical space, so the kit doesn't feel like one cherry-picked post.
- The counter ("1 of 6") is an honest, fixed denominator. Brands know the set size and can see the creator isn't hiding posts. A scrubber only shows how far along you are.
- Keeping stats under the image, never on it, keeps the numbers readable and separate from the creator's own content. That matches every example above and the trust-layer rule that numbers show where they come from.
- A consistent card width means each post is compared on equal footing.

Fit/gap vs WMDS: **extend, don't build new.** The row, snap, bleed, fade, keys and a11y labels all fit as they are. Gaps:
1. No visible counter. Add `progress="counter"`, or expose an `onIndexChange` / current-index callback so the header can render "1 of 6". The data is already there via `labels.item`.
2. The scrubber is the only indicator, and it's aria-hidden. A counter should be text that sighted users can see (its live updates can be polite or off for screen readers).
3. No prev/next buttons, which only matters for desktop. Use the planned prop, or show a 2-up or 3-up grid at ≥md instead.
4. No "see all" or stack switch. That's composition on the kit side, not a component change.
5. Minor: `progress` keeps its space even when hidden. Use `progress="none"` alongside the counter.

Open question for Randy: this goes against his "stack on mobile" call from earlier today. Options: (a) carousel as above, (b) stacked list as currently mocked, or (c) carousel with "See all" opening the stack.
