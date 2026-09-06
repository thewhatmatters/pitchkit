/**
 * Account 30-day reach series for the one Insights Chart.
 * Day is the UTC calendar date from Graph `end_time`. Never zero-fill gaps.
 */

export type ReachPoint = {
  day: string;
  reach: number;
};

const UTC_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Graph `end_time` → UTC `YYYY-MM-DD`. Do not use the local timezone. */
export function utcDayFromGraphEndTime(endTime: string): string {
  return new Date(endTime).toISOString().slice(0, 10);
}

export function isUtcDay(value: string): boolean {
  return UTC_DAY.test(value);
}

/**
 * Keep only honest points. Do not invent missing days or lag placeholders.
 * Empty / omit → hide the Chart (never paint zeros).
 */
export function sanitizeReachSeries(series: ReachPoint[] | null | undefined): ReachPoint[] {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }

  return series.filter(
    (point) =>
      point != null &&
      isUtcDay(point.day) &&
      typeof point.reach === "number" &&
      Number.isFinite(point.reach),
  );
}

export function shouldShowReachChart(series: ReachPoint[] | null | undefined): boolean {
  return sanitizeReachSeries(series).length > 0;
}

/**
 * Whole Insights Chart band (title + slot). Hide when series is empty/omit
 * or the plot host has no width — never a header-only empty 240px box.
 */
export function shouldRenderReachChartBand(
  series: ReachPoint[] | null | undefined,
  hostWidth: number,
): boolean {
  return shouldShowReachChart(series) && Number.isFinite(hostWidth) && hostWidth > 0;
}

export function reachSeriesToChartPoints(series: ReachPoint[] | null | undefined) {
  return sanitizeReachSeries(series).map((point) => ({
    date: new Date(`${point.day}T00:00:00.000Z`),
    reach: point.reach,
  }));
}

/**
 * Approximate painted width of a month/day/year date tick ("Aug 4, 2026") + gap.
 * Pass to WMDS `chartMaxTicksForWidth` so narrow hosts get ~3 ticks.
 */
export const REACH_CHART_DATE_TICK = { width: 88, gap: 16 } as const;

export type MaxTicksForWidth = (
  containerWidth: number,
  tickSpec: { width: number; gap: number },
) => number;

/** Date-axis tick budget from host width. Caller must pass WMDS `chartMaxTicksForWidth`. */
export function reachChartDateTickCount(
  hostWidth: number,
  maxTicksForWidth: MaxTicksForWidth,
): number {
  if (!Number.isFinite(hostWidth) || hostWidth <= 0) {
    return 0;
  }

  return maxTicksForWidth(hostWidth, REACH_CHART_DATE_TICK);
}
