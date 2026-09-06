import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldRenderReachChartBand, shouldShowReachChart } from "./reach-series";

const POINTS = [
  { day: "2026-08-04", reach: 1840 },
  { day: "2026-08-05", reach: 1920 },
];

describe("reach chart band hide", () => {
  it("hides the entire band when series is empty — no header alone", () => {
    assert.equal(shouldShowReachChart([]), false);
    assert.equal(shouldRenderReachChartBand([], 0), false);
    assert.equal(shouldRenderReachChartBand([], 640), false);
  });

  it("hides the entire band when series is omitted or null", () => {
    assert.equal(shouldRenderReachChartBand(undefined, 640), false);
    assert.equal(shouldRenderReachChartBand(null, 640), false);
  });

  it("hides the entire band when series has points but the plot host has no width", () => {
    assert.equal(shouldShowReachChart(POINTS), true);
    assert.equal(shouldRenderReachChartBand(POINTS, 0), false);
    assert.equal(shouldRenderReachChartBand(POINTS, Number.NaN), false);
  });

  it("shows the band only when series has points and the host can paint", () => {
    assert.equal(shouldRenderReachChartBand(POINTS, 640), true);
  });
});
