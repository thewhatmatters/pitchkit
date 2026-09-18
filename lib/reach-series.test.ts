import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  REACH_CHART_DATE_TICK,
  reachChartDateTickCount,
  fillReachCalendarGaps,
  reachChartSurface,
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

  it("does not paint Cartesian when series is empty, omitted, or only invalid points", () => {
    assert.equal(shouldShowReachChart(undefined), false);
    assert.equal(shouldShowReachChart(null), false);
    assert.equal(shouldShowReachChart([]), false);
    assert.equal(
      shouldShowReachChart([{ day: "not-a-day", reach: 12 }]),
      false,
    );
    assert.equal(
      shouldShowReachChart([{ day: "2026-09-01", reach: 0 }, { day: "2026-09-02", reach: 0 }]),
      false,
    );
    assert.equal(
      shouldShowReachChart([{ day: "2026-09-01", reach: 12 }]),
      true,
    );
    assert.deepEqual(sanitizeReachSeries([]), []);
    assert.equal(shouldRenderReachChartBand([], 640), false);
    assert.equal(shouldRenderReachChartBand(undefined, 640), false);
  });

  it("keeps the Reach Card empty band when Insights exist but the series is unusable", () => {
    assert.equal(reachChartSurface([], true), "empty");
    assert.equal(reachChartSurface(undefined, true), "empty");
    assert.equal(reachChartSurface(null, true), "empty");
    assert.equal(
      reachChartSurface([{ day: "2026-09-01", reach: 0 }, { day: "2026-09-02", reach: 0 }], true),
      "empty",
    );
    assert.equal(reachChartSurface([{ day: "2026-09-01", reach: 12 }], true), "chart");
  });

  it("omits the optional Reach region when Graph Insights never landed", () => {
    assert.equal(reachChartSurface([], false), "omit");
    assert.equal(reachChartSurface(undefined, false), "omit");
    assert.equal(reachChartSurface([{ day: "2026-09-01", reach: 12 }], false), "omit");
  });

  it("keeps honest points and fills calendar holes as null, not 0", () => {
    const series = [
      { day: "2026-09-01", reach: 1200 },
      { day: "2026-09-03", reach: 1400 },
    ];
    assert.equal(shouldShowReachChart(series), true);
    assert.deepEqual(
      sanitizeReachSeries(series).map((point) => point.day),
      ["2026-09-01", "2026-09-03"],
    );
    assert.deepEqual(fillReachCalendarGaps(series), [
      { day: "2026-09-01", reach: 1200 },
      { day: "2026-09-02", reach: null },
      { day: "2026-09-03", reach: 1400 },
    ]);
    const points = reachSeriesToChartPoints(series);
    assert.equal(points.length, 3);
    assert.equal(points[0]!.date.toISOString(), "2026-09-01T00:00:00.000Z");
    assert.equal(points[0]!.reach, 1200);
    assert.equal("typical" in points[0]!, false);
    assert.equal(points[1]!.reach, null);
    assert.equal(points[2]!.date.toISOString(), "2026-09-03T00:00:00.000Z");
  });

  it("plots Graph 0 and keeps explicit null as a gap", () => {
    const series = [
      { day: "2026-09-01", reach: 0 },
      { day: "2026-09-02", reach: null },
      { day: "2026-09-03", reach: 12 },
    ];
    assert.equal(shouldShowReachChart(series), true);
    const points = reachSeriesToChartPoints(series);
    assert.equal(points[0]!.reach, 0);
    assert.equal(points[1]!.reach, null);
    assert.equal(points[2]!.reach, 12);
  });

  it("does not fill a 30-day window when the whole series is unusable", () => {
    assert.deepEqual(fillReachCalendarGaps([]), []);
    assert.deepEqual(fillReachCalendarGaps([{ day: "2026-09-01", reach: 0 }]), [
      { day: "2026-09-01", reach: 0 },
    ]);
    assert.equal(reachSeriesToChartPoints([]).length, 0);
  });

  it("adds a constant Typical reach reference from the existing median, including gap days", () => {
    const series = [
      { day: "2026-09-01", reach: 1200 },
      { day: "2026-09-03", reach: 1400 },
    ];
    const points = reachSeriesToChartPoints(series, 2175);
    assert.equal(points.length, 3);
    assert.equal(points[0]!.typical, 2175);
    assert.equal(points[1]!.reach, null);
    assert.equal(points[1]!.typical, 2175);
    assert.equal(points[2]!.typical, 2175);
    assert.equal(reachSeriesToChartPoints(series, null)[0]!.typical, undefined);
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
