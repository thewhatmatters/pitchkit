/**
 * Pattern — creator Insights Show code tokens at WMDS `55944ed`.
 * Re-exports the interpolated literals from `components/pattern-tokens.ts`.
 * `.grid-page` is max-width + centered — paint full-bleed `bg-body min-h-screen`
 * on `<body>` in `app/layout.tsx` so the column is not a gray island on white.
 */

export {
  CREATOR_INSIGHTS_BODY_BAND_CLASS,
  CREATOR_INSIGHTS_BODY_INNER_CLASS,
  CREATOR_INSIGHTS_HEADER_BAND_CLASS,
  CREATOR_INSIGHTS_PAGE_CLASS,
  PATTERN_FORMULA_CLASS as CREATOR_INSIGHTS_FORMULA_CLASS,
  PATTERN_STAT_CLASS as CREATOR_INSIGHTS_STAT_CLASS,
  PATTERN_SUPPORTING_CLASS as CREATOR_INSIGHTS_SUPPORTING_CLASS,
  PATTERN_TOPBAR_END_CLASS as CREATOR_INSIGHTS_TOPBAR_END_CLASS,
} from "@/components/pattern-tokens";
