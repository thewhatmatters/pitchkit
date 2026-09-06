import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  REACH_CHART_DATE_TICK,
  reachChartDateTickCount,
  reachSeriesToChartPoints,
  sanitizeReachSeries,
  shouldRenderReachChartBand,
  shouldShowReachChart,
  utcDayFromGraphEndTime,
} from "./reach-series";

/** Same formula as WMDS `chartMaxTicksForWidth` (package has no CJS export for node:test). */
function chartMaxTicksForWidth(
  containerWidth: number,
  tickSpec: { width: number; gap: number },
): number {
  if (containerWidth <= 0) {
    return 0;
  }
  return Math.max(1, Math.floor((containerWidth + tickSpec.gap) / (tickSpec.width + tickSpec.gap)));
}

describe("reach_series chart hide rules", () => {
  it("uses the UTC date from Graph end_time", () => {
    assert.equal(utcDayFromGraphEndTime("2026-09-06T00:00:00+0000"), "2026-09-06");
    assert.equal(utcDayFromGraphEndTime("2026-09-06T23:15:00+0000"), "2026-09-06");
    assert.equal(utcDayFromGraphEndTime("2026-09-07T00:00:00-0500"), "2026-09-07");
  });

  it("hides the Chart when series is empty, omitted, or only invalid points", () => {
    assert.equal(shouldShowReachChart(undefined), false);
    assert.equal(shouldShowReachChart(null), false);
    assert.equal(shouldShowReachChart([]), false);
    assert.equal(
      shouldShowReachChart([{ day: "not-a-day", reach: 12 }]),
      false,
    );
    assert.deepEqual(sanitizeReachSeries([]), []);
    assert.equal(shouldRenderReachChartBand([], 640), false);
    assert.equal(shouldRenderReachChartBand(undefined, 640), false);
  });

  it("keeps honest points and does not invent missing days", () => {
    const series = [
      { day: "2026-09-01", reach: 1200 },
      { day: "2026-09-03", reach: 1400 },
    ];
    assert.equal(shouldShowReachChart(series), true);
    assert.deepEqual(
      sanitizeReachSeries(series).map((point) => point.day),
      ["2026-09-01", "2026-09-03"],
    );
    const points = reachSeriesToChartPoints(series);
    assert.equal(points.length, 2);
    assert.equal(points[0]!.date.toISOString(), "2026-09-01T00:00:00.000Z");
    assert.equal(points[0]!.reach, 1200);
    assert.equal(points[1]!.date.toISOString(), "2026-09-03T00:00:00.000Z");
  });
});

describe("reach chart date ticks", () => {
  it("uses WMDS chartMaxTicksForWidth so narrow widths get ~3 date ticks", () => {
    assert.equal(reachChartDateTickCount(0, chartMaxTicksForWidth), 0);
    assert.equal(reachChartDateTickCount(Number.NaN, chartMaxTicksForWidth), 0);
    assert.equal(reachChartDateTickCount(320, chartMaxTicksForWidth), 3);
    assert.equal(reachChartDateTickCount(360, chartMaxTicksForWidth), 3);
    assert.ok(reachChartDateTickCount(1024, chartMaxTicksForWidth) > 3);
    assert.equal(
      chartMaxTicksForWidth(320, REACH_CHART_DATE_TICK),
      reachChartDateTickCount(320, chartMaxTicksForWidth),
    );
  });
});
