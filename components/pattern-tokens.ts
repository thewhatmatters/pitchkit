/**
 * Interpolated Show code class strings from WMDS Examples/PitchKit at
 * `3b75f96e1ea78bffb1a533131502e44148a80c89`.
 *
 * Stories:
 * - `examples-pitchkit--account-settings-owner` (Pattern — account settings (owner))
 * - `examples-pitchkit--creator-insights` (Pattern — creator Insights)
 * - `examples-pitchkit--creator-insights-loading` (Pattern — creator Insights (loading))
 * - `examples-pitchkit--insufficient-reach-data` (State — insufficient reach data)
 * - `examples-pitchkit--insufficient-audience-data` (State — insufficient audience data)
 * - `examples-pitchkit--insufficient-reach-and-audience-data` (State — insufficient reach and audience data)
 * - `examples-pitchkit--graph-data-unavailable` (State — Graph data unavailable; omit optional regions)
 * - `examples-pitchkit--shareable-pitch-kit` (Pattern — shareable PitchKit)
 * - `examples-pitchkit--shareable-insufficient-reach` (State — shareable insufficient reach)
 * - `examples-pitchkit--owner-pitch-kit` (Pattern — owner PitchKit)
 * Post dates in product include the year (`Dec 17, 2024`); stories may omit year.
 * - `examples-pitchkit--creator-identity-public` (Pattern — creator identity (public))
 * - `examples-pitchkit--creator-identity-owner-settings` (Pattern — creator identity (owner settings))
 * - `examples-pitchkit--creator-identity-loading` (State — creator identity loading)
 * - `examples-pitchkit--creator-identity-missing-photo` (State — creator identity missing photo)
 * - `examples-pitchkit--creator-identity-missing-name` (State — creator identity missing name)
 * - `examples-pitchkit--intro-owner` (Pattern — intro (owner))
 * - `examples-pitchkit--intro-public` (Pattern — intro (public))
 * - `examples-pitchkit--past-brands-owner` (Pattern — past brands (owner))
 * - `examples-pitchkit--past-brands-owner-empty` (State — past brands owner empty)
 * - `examples-pitchkit--past-brands-owner-overflow` (State — past brands owner overflow)
 * - `examples-pitchkit--past-brands-public` (Pattern — past brands (public))
 * - `examples-pitchkit--past-brands-public-omit` (State — past brands public omit)
 * - `examples-pitchkit--past-brands-public-overflow` (State — past brands public overflow)
 * - `components-data-display-chart--cartesian-no-data-gaps` (in-series Reach hatch)
 *
 * Copy these literals. Do not import Storybook-only `pitchKitStyles`.
 */

export const PATTERN_PAGE_CLASS =
  "grid-page min-h-screen bg-body [--grid-column-gap:8px] [--grid-max:1140px] [padding-bottom:44px]";

export const PATTERN_TOPBAR_BAND_CLASS = "band pb-4";

export const PATTERN_TOPBAR_CLASS =
  "col-span-full grid grid-cols-[1fr_auto_1fr] items-center gap-3";

export const PATTERN_BRAND_CLASS = "type-heading-4 text-fg";

export const PATTERN_TOPBAR_END_CLASS = "justify-self-end";

export const PATTERN_CONTENT_BAND_CLASS = "band pt-6 sm:pt-8";

export const PATTERN_CONTENT_CLASS = "band min-w-0 gap-y-6 sm:gap-y-8";

export const PATTERN_HEADER_SECTION_CLASS = "col-span-full";

export const PATTERN_HEADER_COPY_CLASS = "flex max-w-2xl flex-col gap-1";

export const PATTERN_SUPPORTING_CLASS = "type-body text-fg text-muted";

export const PATTERN_FORMULA_CLASS = "type-supporting text-muted text-muted";

export const PATTERN_STATS_BAND_CLASS = "band gap-y-4";

export const PATTERN_STAT_CLASS = "col-span-2 md:col-span-4 lg:col-span-3 h-full";

export const PATTERN_METRICS_STACK_CLASS = "band gap-y-2";

export const PATTERN_DASHBOARD_GRID_CLASS = "band min-w-0 gap-y-6 [align-items:stretch]";

export const PATTERN_REACH_CARD_CLASS = "col-span-full min-w-0 lg:col-span-6";

export const PATTERN_AUDIENCE_CARD_CLASS = "col-span-full min-w-0 lg:col-span-6";

export const PATTERN_CARD_WELL_CLASS =
  "flex min-w-0 flex-col gap-4 bg-body px-3.5 py-4 rounded-[var(--radius-card-body)]";

/** Matches Chart.Cartesian `minHeight` on the Reach well — keep empty/skeleton bands the same. */
export const PATTERN_REACH_CHART_MIN_HEIGHT = 344;

/** Compact public-kit 30-day reach — same empty contract, shorter well. */
export const PATTERN_PUBLIC_REACH_CHART_MIN_HEIGHT = 220;

/** Pattern empty well + fill the terminal Card.Body so justify-center can act. */
export const PATTERN_REACH_EMPTY_WELL_CLASS =
  `${PATTERN_CARD_WELL_CLASS} h-full w-full items-center justify-center text-center`;

/** Same centered empty well as Reach — keep the Audience band when Graph has no series. */
export const PATTERN_AUDIENCE_EMPTY_WELL_CLASS = PATTERN_REACH_EMPTY_WELL_CLASS;

export const PATTERN_EMPTY_COPY_CLASS = "flex max-w-lg flex-col gap-2";

/** Centered Badge → title → body — same 0.5rem (`gap-2`) stack as page-empty. */
export const PATTERN_REACH_EMPTY_COPY_CLASS =
  `${PATTERN_EMPTY_COPY_CLASS} items-center text-center`;

/** Same centered Badge stack as Reach — `examples-pitchkit--insufficient-audience-data`. */
export const PATTERN_AUDIENCE_EMPTY_COPY_CLASS = PATTERN_REACH_EMPTY_COPY_CLASS;

export const PATTERN_EMPTY_TITLE_CLASS = "type-heading-2 text-fg";

export const PATTERN_EMPTY_BODY_CLASS = "type-body text-fg text-muted";

export const PATTERN_HEADER_SKELETON_COPY_CLASS = "flex max-w-2xl flex-col gap-2";

export const PATTERN_HEADER_SKELETON_STACK_CLASS = "flex flex-col gap-1";

export const PATTERN_SKELETON_LEGEND_ROW_CLASS = "flex flex-wrap gap-4";

export const PATTERN_AUDIENCE_SKELETON_SECTION_CLASS = "flex min-w-0 flex-col gap-3";

export const PATTERN_AUDIENCE_SKELETON_BARS_CLASS = "flex min-w-0 flex-col gap-2";

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

/** Public `/k/[handle]` surrounding chrome — same strip, nameplate band. */
export const PATTERN_IDENTITY_NAMEPLATE_CLASS = "col-span-full border-b border-border pb-6";

export const PATTERN_IDENTITY_SKELETON_COPY_CLASS = "flex min-w-0 flex-col gap-2";

export const PATTERN_IDENTITY_AVATAR_SKELETON_PX = 48;

/** Owner Settings surrounding chrome — same strip, connection card. */
export const PATTERN_SETTINGS_CARD_CLASS = "col-span-full";

export const PATTERN_SETTINGS_BODY_CLASS = "flex min-w-0 flex-col gap-4 px-3.5 py-[16px]";

export const PATTERN_SHARE_KIT_STACK_CLASS = "flex min-w-0 flex-col gap-2";

export const PATTERN_SHARE_KIT_ACTIONS_CLASS = "flex min-w-0 flex-wrap items-center gap-3";

export const PATTERN_CONNECTION_META_CLASS = "type-supporting text-muted text-muted";

/** Account settings Dialog body — Connected Instagram → Share kit → account actions. */
export const PATTERN_USER_SETTINGS_BODY_CLASS = "flex w-full min-w-0 flex-col gap-4";

export const PATTERN_USER_SETTINGS_ACTIONS_CLASS = "flex flex-col items-start gap-2";

/** Circular Avatar trigger — hug `size="md"` (36px), no offset ring. */
export const PATTERN_ACCOUNT_MENU_TRIGGER_CLASS =
  "size-9 min-h-9 gap-0 px-0 py-0 focus-visible:ring-offset-0";

export const PATTERN_ACCOUNT_MENU_CLASS = "relative";

export const PATTERN_ACCOUNT_MENU_PANEL_CLASS =
  "absolute end-0 top-full mt-1 min-w-56 max-h-none";

export const PATTERN_ACCOUNT_MENU_HEADER_CLASS =
  "type-supporting font-medium uppercase tracking-wider text-muted px-3.5 py-2";

export const PATTERN_ACCOUNT_MENU_SEPARATOR_CLASS =
  "mx-1.5 my-0.5 border-0 border-t border-border";

/** Owner Insights / PitchKit page footer — Privacy + Support only. */
export const PATTERN_FOOTER_BAND_CLASS = "band pb-6 pt-10";

export const PATTERN_FOOTER_CLASS =
  "col-span-full flex items-center justify-center gap-4";

/** Public kit unsigned CTA band — compose into shareable PitchKit only. */
export const PATTERN_CALLOUT_CARD_CLASS = "col-span-full";

export const PATTERN_CALLOUT_BODY_CLASS =
  "flex min-w-0 flex-col gap-4 px-3.5 py-[16px]";

export const PATTERN_CALLOUT_ACTIONS_CLASS = "flex flex-wrap items-center gap-3";

export const PATTERN_KIT_STAT_CLASS = "col-span-2 md:col-span-4 lg:col-span-6";

/** Public kit 4-up Graph KPIs — same spine as Insights Stats. */
export const PATTERN_PUBLIC_STAT_CLASS = PATTERN_STAT_CLASS;

export const PATTERN_COUNTRIES_CARD_CLASS = PATTERN_AUDIENCE_CARD_CLASS;

/** Owner PitchKit tab — compact reach + countries stack full width. */
export const PATTERN_PUBLIC_STACK_CLASS = PATTERN_DASHBOARD_GRID_CLASS;
export const PATTERN_PUBLIC_REACH_CARD_CLASS = "col-span-full min-w-0";
export const PATTERN_PUBLIC_COUNTRIES_CARD_CLASS = "col-span-full min-w-0";

export const PATTERN_KIT_POST_METRICS_CLASS = "grid w-full grid-cols-2 gap-3";

export const PATTERN_CONTACT_CARD_CLASS = "col-span-full";

export const PATTERN_CONTACT_ROWS_CLASS = "flex flex-col gap-3";

export const PATTERN_CONTACT_ROW_CLASS =
  "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3";

export const PATTERN_BRAND_BODY_CLASS = "type-body text-fg text-muted py-[16px] px-3.5";

/** Pitchkit-owned intro under the identity nameplate. */
export const PATTERN_INTRO_STACK_CLASS = "flex min-w-0 flex-col gap-3";

export const PATTERN_INTRO_CLASS = "type-body text-fg text-fg";

/** Past brands — owner editor stack. Not campaign KPI cards. */
export const PATTERN_BRAND_LIST_CLASS = "flex col-span-full min-w-0 flex-col gap-3";

export const PATTERN_BRAND_CARD_CLASS = "col-span-full min-w-0";

export const PATTERN_BRAND_ROW_START_CLASS = "flex min-w-0 items-center gap-3";

export const PATTERN_BRAND_NAME_CLASS = "type-label text-fg";

export const PATTERN_BRAND_REORDER_CLASS = "flex shrink-0 items-center";

/** Public rail — static row when items fit; wrap only for reduced motion. */
export const PATTERN_BRAND_RAIL_HOST_CLASS = "relative col-span-full min-w-0";

export const PATTERN_BRAND_RAIL_MEASURE_CLASS =
  "pointer-events-none invisible absolute flex w-max items-center gap-3";

export const PATTERN_BRAND_RAIL_ROW_CLASS = "flex min-w-0 items-center gap-3";

export const PATTERN_BRAND_RAIL_WRAP_CLASS = "flex min-w-0 flex-wrap items-center gap-3";

export const PATTERN_BRAND_RAIL_CARD_CLASS = "w-max max-w-full shrink-0";

export const PATTERN_BRAND_MARQUEE_VIEWPORT_CLASS = "group overflow-hidden";

export const PATTERN_BRAND_MARQUEE_TRACK_CLASS = "marquee-track flex w-max items-center";

export const PATTERN_BRAND_MARK_CLASS =
  "flex size-6 shrink-0 items-center justify-center rounded-full bg-fg type-supporting text-muted font-medium uppercase leading-none text-bg";

export const PATTERN_BRAND_DIALOG_FIELDS_CLASS = "flex w-full min-w-0 flex-col gap-4";

/** Owner theme picker — draft SegmentedControl + explicit Save. Kit body is in-page. */
export const PATTERN_THEME_TOOLBAR_CLASS =
  "col-span-full flex flex-wrap items-end justify-between gap-3";

/**
 * In-page owner PitchKit surface. Stored `theme` still paints `data-theme`
 * here (default light). Theme picker chrome is off.
 */
export const PATTERN_THEME_KIT_CLASS = `col-span-full min-w-0 bg-body ${PATTERN_CONTENT_CLASS}`;

/**
 * Centered empty-well stack (Reach / Audience No data). Coming soon retired
 * for the owner PitchKit tab (`examples-pitchkit--owner-pitch-kit`).
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
