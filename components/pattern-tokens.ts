/**
 * Interpolated Show code class strings from WMDS Examples/PitchKit at
 * `75f8a41e8b131906378b340a4106a486ddd5173f`.
 *
 * Stories:
 * - `examples-pitchkit--creator-insights` (Pattern — creator Insights)
 * - `examples-pitchkit--shareable-pitchkit` (Pattern — shareable PitchKit)
 *
 * Copy these literals. Do not import Storybook-only `pitchKitStyles`.
 */

export const PATTERN_PAGE_CLASS =
  "grid-page min-h-screen bg-body [--grid-column-gap:8px] [--grid-max:1140px] [padding-bottom:44px]";

export const PATTERN_TOPBAR_BAND_CLASS = "band pb-4";

export const PATTERN_TOPBAR_CLASS =
  "col-span-full grid grid-cols-[1fr_auto_1fr] items-center gap-3";

export const PATTERN_BRAND_CLASS = "type-label text-fg text-fg";

export const PATTERN_TOPBAR_END_CLASS = "justify-self-end";

export const PATTERN_CONTENT_BAND_CLASS = "band pt-6 sm:pt-8";

export const PATTERN_CONTENT_CLASS = "band min-w-0 gap-y-6 sm:gap-y-8";

export const PATTERN_HEADER_SECTION_CLASS = "col-span-full";

export const PATTERN_HEADER_COPY_CLASS = "flex max-w-2xl flex-col gap-1";

export const PATTERN_SUPPORTING_CLASS = "type-body text-fg text-muted";

export const PATTERN_FORMULA_CLASS = "type-supporting text-muted text-muted";

export const PATTERN_STATS_BAND_CLASS = "band gap-y-4";

export const PATTERN_STAT_CLASS = "col-span-2 md:col-span-4 lg:col-span-3";

export const PATTERN_METRICS_STACK_CLASS = "band gap-y-2";

export const PATTERN_DASHBOARD_GRID_CLASS = "band min-w-0 gap-y-6 [align-items:stretch]";

export const PATTERN_REACH_CARD_CLASS = "col-span-full min-w-0 lg:col-span-6";

export const PATTERN_AUDIENCE_CARD_CLASS = "col-span-full min-w-0 lg:col-span-6";

export const PATTERN_CARD_WELL_CLASS =
  "flex min-w-0 flex-col gap-4 bg-body px-3.5 py-4 rounded-[var(--radius-card-body)]";

export const PATTERN_AUDIENCE_WELL_CLASS =
  "grid min-w-0 gap-y-6 bg-body px-3.5 py-4 [column-gap:var(--grid-column-gap)] sm:grid-cols-2 rounded-[var(--radius-card-body)]";

export const PATTERN_AUDIENCE_SECTION_CLASS = "flex min-w-0 flex-col gap-3";

export const PATTERN_SECTION_EYEBROW_CLASS =
  "type-supporting font-medium uppercase tracking-wider text-muted text-muted";

export const PATTERN_POSTS_SECTION_CLASS = "band min-w-0 gap-y-4";

export const PATTERN_POSTS_HEADER_CLASS =
  "col-span-full flex flex-wrap items-end justify-between gap-3";

export const PATTERN_POSTS_TABS_CLASS = "col-span-full";

export const PATTERN_POSTS_PANEL_CLASS = "band col-span-full min-w-0 gap-y-4";

export const PATTERN_POST_CARD_CLASS = "col-span-full min-w-0 md:col-span-4 lg:col-span-4";

export const PATTERN_POST_IMAGE_CLASS =
  "aspect-[4/3] w-full bg-body object-cover rounded-[var(--radius-card-body)]";

export const PATTERN_POST_HEADER_START_CLASS = "flex items-center gap-2";

export const PATTERN_POST_METRICS_CLASS = "grid w-full grid-cols-3 gap-3";

export const PATTERN_POST_METRIC_CLASS = "flex min-w-0 flex-col gap-1";

export const PATTERN_POST_METRIC_LABEL_CLASS =
  "type-supporting font-medium uppercase tracking-wider text-muted text-muted";

export const PATTERN_POST_METRIC_VALUE_CLASS = "font-mono text-sm tabular-nums text-fg";

export const PATTERN_IDENTITY_SECTION_CLASS = "col-span-full";

export const PATTERN_IDENTITY_ROW_CLASS = "flex flex-wrap items-center gap-4";

export const PATTERN_IDENTITY_COPY_CLASS = "flex min-w-0 flex-col gap-1";

export const PATTERN_IDENTITY_TITLE_ROW_CLASS = "flex flex-wrap items-center gap-2";

export const PATTERN_IDENTITY_NAME_CLASS = "type-heading-2 text-fg";

export const PATTERN_KIT_STAT_CLASS = "col-span-2 md:col-span-4 lg:col-span-6";

export const PATTERN_KIT_POST_METRICS_CLASS = "grid w-full grid-cols-2 gap-3";

export const PATTERN_CONTACT_CARD_CLASS = "col-span-full";

export const PATTERN_CONTACT_ROWS_CLASS = "flex flex-col gap-3";

export const PATTERN_CONTACT_ROW_CLASS =
  "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3";

export const PATTERN_BRAND_BODY_CLASS = "type-body text-fg text-muted py-[16px] px-3.5";

/**
 * Owner PitchKit segment empty state — interpolated from WMDS `73277bab`
 * `pitchKitPlaceholder*` (`typographyClass` is not a package export).
 */
export const PATTERN_PLACEHOLDER_CLASS =
  "col-span-full flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center";

export const PATTERN_PLACEHOLDER_TITLE_CLASS = "type-heading-1 text-fg tracking-tight";

export const PATTERN_PLACEHOLDER_BODY_CLASS = "type-body text-fg max-w-md text-muted";

/** Owner Insights / owner workspace `<main>` — same as shareable Pattern page. */
export const CREATOR_INSIGHTS_PAGE_CLASS = PATTERN_PAGE_CLASS;

export const CREATOR_INSIGHTS_HEADER_BAND_CLASS = PATTERN_TOPBAR_BAND_CLASS;

export const CREATOR_INSIGHTS_BODY_BAND_CLASS = PATTERN_CONTENT_BAND_CLASS;

export const CREATOR_INSIGHTS_BODY_INNER_CLASS = PATTERN_CONTENT_CLASS;
