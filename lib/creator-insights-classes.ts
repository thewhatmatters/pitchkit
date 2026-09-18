/**
 * WMDS Examples/PitchKit live Storybook canvas (`pitchKitStyles.ts`).
 * `typographyClass` is not a package export — use the pin's `type-*` utilities.
 * Show code on the Pattern story is stale; these tokens win when they differ.
 */

export const CREATOR_INSIGHTS_PAGE_CLASS =
  "grid-page min-h-screen bg-body [--grid-column-gap:8px] [--grid-max:1140px] [padding-bottom:44px]";

/** Canvas `pitchKitTopbarBandClasses`. */
export const CREATOR_INSIGHTS_HEADER_BAND_CLASS = "band pb-4";

/** Canvas `pitchKitContentBandClasses`. */
export const CREATOR_INSIGHTS_BODY_BAND_CLASS = "band pt-6 sm:pt-8";

/** Canvas `pitchKitContentClasses`. */
export const CREATOR_INSIGHTS_BODY_INNER_CLASS = "band min-w-0 gap-y-6 sm:gap-y-8";

/** Canvas `pitchKitSupportingClasses` — body role is `type-body`. */
export const CREATOR_INSIGHTS_SUPPORTING_CLASS = "type-body text-muted";

/** Canvas `pitchKitFormulaClasses` — caption role maps to `type-supporting`. */
export const CREATOR_INSIGHTS_FORMULA_CLASS = "type-supporting text-muted";

/** Canvas `pitchKitStatClasses`. Do not add `w-full` / `min-w-0`. */
export const CREATOR_INSIGHTS_STAT_CLASS = "col-span-2 md:col-span-4 lg:col-span-3";

/** Canvas `pitchKitTopbarEndClasses` — wrap Avatar; do not put this on Avatar. */
export const CREATOR_INSIGHTS_TOPBAR_END_CLASS = "justify-self-end";
