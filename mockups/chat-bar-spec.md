# Pitchkit kit: "Ask this kit" bar (build spec)

The reference is the WhatMatters compact prompt bar. Mockups are `kit-390.png`, `kit-390-chat.png` and `kit-1440.png`, built from `src/kit.html`. All data is EXAMPLE DATA.

## Position
- `position: fixed` at the bottom of the viewport at every breakpoint. It shows from first paint, with no scroll trigger.
- It is centred: `left: 50%; transform: translateX(-50%)`.
- Bottom offset: `16px` below 900px wide and `24px` from 900px up, plus `env(safe-area-inset-bottom)`.
- There is no inline input under the provenance stamp and no question chips, because the reference has neither.

## Size
- Width: `calc(100% - 32px)`, max width `624px`.
- Height: `56px`.
- Radius: `999px` (a full pill).
- Padding: `0 8px`, with a `10px` gap between items.

## Contents, left to right
1. **Creator badge:** a 38px circle, white with a `1px #e3e3e3` border. It shows the creator's initials ("EC") in Inter 600, 13px, `#141414`.
2. **Placeholder:** "Ask about @example_creator", Inter 400, 14px, `#9a9a9a`. It stays on one line and ends in an ellipsis if it overflows.
3. **Send:** a 44×44 hit area holding a 38px circle in `#efefef`, with a 16px → arrow drawn in `#7a7a7a` at a 1.5px stroke.

## Colours and shadow
- Background `#fff` with a `1px solid #8a8a8a` border.
- Shadow: `0 4px 16px rgba(0,0,0,.08)`.

## Layering
- The bar is at `z-index: 50`.
- The chat scrim is at `55` (`rgba(20,20,20,.35)`) and the sheet is at `60`.

## Content bottom padding
On `body` (or the kit root), set `padding-bottom` to the bar height + its bottom offset + 24px + the safe-area inset:
- Below 900px: `calc(56px + 16px + 24px + env(safe-area-inset-bottom))`
- From 900px up: `calc(56px + 24px + 24px + env(safe-area-inset-bottom))`

This keeps the footer and the last card from ever sitting under the bar.

## Opening the chat (sheet)
- Tapping anywhere on the bar opens the sheet. The bar has `role="button"`, `aria-label="Ask about this kit"`.
- **Mobile:** a bottom sheet, full width, with an 18px top radius and max height `86vh`.
  - It has a grab handle and a header reading "Ask this kit · answers from this kit only".
  - A close button (44px) sits on the right.
  - Messages scroll inside the sheet.
  - The sheet has its own bar of the same style at the bottom (placeholder "Ask a follow-up", no shadow, inside its padding with the safe-area inset).
  - The fixed bar is hidden while the sheet is open.
- **Desktop:** the same panel, centred over the bar's position (max width 624px). Use the same scrim.
- **Closing:** the ✕ button, a tap on the scrim, Esc, or swiping the sheet down. Focus goes back to the bar.
- **Answers:** every fact carries a source pill.
  - Verified: green tint with a solid border and a ✓.
  - Creator-reported: white with a dashed border and a ✎.
  - Shape and label carry the meaning, not colour.
  - When something is missing, the answer says "…isn't in this kit."
  - There is no email gate, no lead capture and no contact path.
- The chat is shown only on paid-plan kits. Free kits render no bar and no bottom padding.

## Layout note (mobile-first): Selected posts
- **Below 900px:** a horizontal carousel built on the WMDS Carousel (`itemWidth={{ base: 82 }}`, `snap`, `bleed`, `progress="none"`). This replaces the earlier single-column stack.
  - Each 4:5 card is about 82% of the row, flush left, with the next card peeking in.
  - Cards snap to their leading edge, and the row runs to the screen edges.
  - Under each image: Reach and Saves in tabular numerals, each with a source tag (✓ Verified / ✎ Creator-reported), then the post type and date.
  - The header reads "Selected posts · 6" on the left and a live "1 of 6" counter on the right. The counter is visible text with `aria-live="off"`, since each item is already announced as "n of 6".
  - It uses the new opt-in counter and `onIndexChange` that Design Systems Manager is adding. **Prop names are TBD from them.**
  - No dots, no scrubber, no autoplay, no loop.
- **From 900px up:** a 3-across grid (2 rows for 6 posts) with no counter.
- The carousel must not cause sideways page scroll. Grid and flex parents need `min-width: 0`.

## Keyboard open (iOS)
- **Viewport meta:** `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">`.
- **Safari fallback:** Safari ignores `interactive-widget`, so listen to `visualViewport` `resize` and `scroll` events (throttle them with requestAnimationFrame).
  - Place the bar or sheet bottom at `visualViewport.height + visualViewport.offsetTop`, measured from the top of the layout viewport. In practice that means `bottom = innerHeight - (vv.height + vv.offsetTop)`.
  - The bar then sits directly on top of the keyboard, at roughly 336px including the suggestion row.
- **Safe area:** apply `env(safe-area-inset-bottom)` only while the keyboard is closed (toggle a `kb-open` class when `innerHeight - vv.height > 120`).
- **No zoom, no page jump:** the input font-size must be ≥ 16px, which stops iOS from zooming on focus.
  - The body never scrolls while the sheet is open: lock it with `overflow:hidden` and `position:fixed`, and restore `scrollY` on close.
  - Only the sheet's message list scrolls (`overflow-y:auto; overscroll-behavior:contain`).
- **Latest answer visible:** on input focus, and on every new message, scroll the last message into view (`scrollIntoView({block:"end"})`, run after the visualViewport resize settles).
- **Send button:** the tap target is ≥ 44×44. Call `preventDefault()` on `mousedown`/`pointerdown` so tapping send keeps focus and the keyboard stays open.
  - The button looks active (dark fill, white arrow) when the draft isn't empty and disabled (grey) when it is.
- **Enter sends** (with `enterkeyhint="send"`). The draft clears and focus stays in the input.
- **On blur** (keyboard dismissed): clear the inline offset and the `kb-open` class, so the bar goes back to its bottom position with the safe-area inset.
- **Testing:** test on real devices, iOS Safari and iOS Chrome (WebKit), in portrait and landscape, with and without the suggestion row and with a hardware keyboard. Simulators don't model the visualViewport accurately.

### WMDS Carousel counter props (from Design Systems Manager, draft PR)
- `counter?: boolean` (default false). Shows "1 of 6", announced politely, and hides when every item fits.
- `onIndexChange?: (index, count) => void`. The index starts at 0 and fires when an item comes to rest. Use it for the "1 of 6" in the section header.
- `activeIndex?: number` to jump to a given item. `labels.counter?: (position, count) => string` to change the counter text.
- Pitchkit: `<Carousel aria-label="Selected posts" itemWidth={{ base: 82 }} snap bleed progress="none" onIndexChange={...}>`, with the counter rendered in the header.
