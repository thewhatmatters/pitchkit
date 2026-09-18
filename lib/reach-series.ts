/**
 * Account 30-day reach series for the one Insights Chart.
 * Day is the UTC calendar date from Graph `end_time`.
 * `null` / omitted days in a plottable window are Cartesian gaps (hatch).
 * `0` is plotted. Never invent zeros.
 */

export type ReachPoint = {
  day: string;
  reach: number | null;
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
 * Keep honest days. Finite numbers (including 0) stay. Explicit `null` stays
 * as a gap. Drop invalid days — do not invent zeros.
 */
export function sanitizeReachSeries(series: ReachPoint[] | null | undefined): ReachPoint[] {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }

  return series.filter(
    (point) =>
      point != null &&
      isUtcDay(point.day) &&
      (point.reach === null || (typeof point.reach === "number" && Number.isFinite(point.reach))),
  );
}

export function isPlottedReach(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function hasPositiveReach(series: ReachPoint[] | null | undefined): boolean {
  return sanitizeReachSeries(series).some((point) => isPlottedReach(point.reach) && point.reach > 0);
}

/**
 * Paint Cartesian only when there is at least one honest positive day.
 * Missing / thin / all-zero is not a chart — see `reachChartSurface`.
 */
export function shouldShowReachChart(series: ReachPoint[] | null | undefined): boolean {
  return hasPositiveReach(series);
}

export type ReachChartSurface = "chart" | "empty" | "omit";

/**
 * Owner Insights Reach Card.
 * - `omit` — Graph-unavailable (`examples-pitchkit--graph-data-unavailable`): Insights never landed.
 * - `empty` — insufficient reach (`examples-pitchkit--insufficient-reach-data`): series missing / thin / all-zero. Centered well.
 * - `chart` — at least one honest positive day.
 */
export function reachChartSurface(
  series: ReachPoint[] | null | undefined,
  hasInsights: boolean,
): ReachChartSurface {
  if (!hasInsights) {
    return "omit";
  }
  return shouldShowReachChart(series) ? "chart" : "empty";
}

/**
 * Plot ink inside the occupant well. Host width 0 skips Cartesian.
 * Insufficient-reach still keeps the Card; this only gates the plot.
 */
export function shouldRenderReachChartBand(
  series: ReachPoint[] | null | undefined,
  hostWidth: number,
): boolean {
  return shouldShowReachChart(series) && Number.isFinite(hostWidth) && hostWidth > 0;
}

function addUtcDays(day: string, count: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

/**
 * Inclusive UTC calendar span from first to last honest day.
 * Missing days become `null` so Chart.Cartesian can hatch (not 0).
 */
export function fillReachCalendarGaps(series: ReachPoint[] | null | undefined): ReachPoint[] {
  const rows = sanitizeReachSeries(series);
  if (rows.length === 0) {
    return [];
  }

  const byDay = new Map<string, number | null>();
  for (const point of rows) {
    if (!byDay.has(point.day) || isPlottedReach(point.reach)) {
      byDay.set(point.day, point.reach);
    }
  }

  const days = [...byDay.keys()].sort();
  const first = days[0]!;
  const last = days[days.length - 1]!;
  const filled: ReachPoint[] = [];

  for (let day = first; day <= last; day = addUtcDays(day, 1)) {
    filled.push({
      day,
      reach: byDay.has(day) ? byDay.get(day)! : null,
    });
  }

  return filled;
}

/**
 * Daily account reach plus an optional Typical reach reference.
 * Typical is the existing post-median Stat (`typicalReach`), drawn as a
 * constant like the canvas — not a second Graph time series.
 * Calendar holes are `reach: null` (hatch). `0` stays 0.
 */
export function reachSeriesToChartPoints(
  series: ReachPoint[] | null | undefined,
  typicalReach?: number | null,
) {
  const typical =
    typeof typicalReach === "number" && Number.isFinite(typicalReach) ? typicalReach : null;

  return fillReachCalendarGaps(series).map((point) => ({
    date: new Date(`${point.day}T00:00:00.000Z`),
    reach: point.reach,
    ...(typical != null ? { typical } : {}),
  }));
}

export function hasTypicalReachReference(typicalReach?: number | null): boolean {
  return typeof typicalReach === "number" && Number.isFinite(typicalReach);
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
