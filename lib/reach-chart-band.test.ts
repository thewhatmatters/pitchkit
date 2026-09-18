import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reachChartSurface, shouldRenderReachChartBand, shouldShowReachChart } from "./reach-series";

const POINTS = [
  { day: "2026-08-04", reach: 1840 },
  { day: "2026-08-05", reach: 1920 },
];

describe("reach chart band surfaces", () => {
  it("does not paint Cartesian when series is empty — empty band keeps the Card", () => {
    assert.equal(shouldShowReachChart([]), false);
    assert.equal(shouldRenderReachChartBand([], 0), false);
    assert.equal(shouldRenderReachChartBand([], 640), false);
    assert.equal(reachChartSurface([], true), "empty");
  });

  it("treats omitted or null series as insufficient when Insights exist", () => {
    assert.equal(shouldRenderReachChartBand(undefined, 640), false);
    assert.equal(shouldRenderReachChartBand(null, 640), false);
    assert.equal(reachChartSurface(undefined, true), "empty");
    assert.equal(reachChartSurface(null, true), "empty");
  });

  it("omits the optional region when Graph data is unavailable", () => {
    assert.equal(reachChartSurface([], false), "omit");
    assert.equal(reachChartSurface(undefined, false), "omit");
  });

  it("skips Cartesian when series has points but the plot host has no width", () => {
    assert.equal(shouldShowReachChart(POINTS), true);
    assert.equal(shouldRenderReachChartBand(POINTS, 0), false);
    assert.equal(shouldRenderReachChartBand(POINTS, Number.NaN), false);
    assert.equal(reachChartSurface(POINTS, true), "chart");
  });

  it("paints Cartesian only when series has points and the host can paint", () => {
    assert.equal(shouldRenderReachChartBand(POINTS, 640), true);
  });
});
