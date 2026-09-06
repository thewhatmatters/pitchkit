import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldShowAudienceMix, visibleAudienceMix } from "./audience";
import {
  shouldShowPastBrands,
  sourcedContact,
  visibleBrandNames,
} from "./kit-chips";
import { shouldShowReachChart } from "./reach-series";

describe("past brand chips", () => {
  it("hides empty or blank names and keeps honest names", () => {
    assert.deepEqual(visibleBrandNames([]), []);
    assert.deepEqual(visibleBrandNames(null), []);
    assert.deepEqual(visibleBrandNames(["  ", "Acme", ""]), ["Acme"]);
    assert.equal(shouldShowPastBrands([]), false);
    assert.equal(shouldShowPastBrands(["Acme"]), true);
    assert.equal(sourcedContact("  "), null);
    assert.equal(sourcedContact("hi@brand.com"), "hi@brand.com");
  });
});

describe("audience mix hide-empty", () => {
  it("hides empty mixes and drops zero rows", () => {
    assert.equal(shouldShowAudienceMix([]), false);
    assert.equal(shouldShowAudienceMix([{ label: "US", percent: 0 }]), false);
    assert.deepEqual(visibleAudienceMix([{ label: "US", percent: 37 }]), [
      { label: "US", percent: 37 },
    ]);
  });
});

describe("reach chart hide contract", () => {
  it("hides when reach_series is empty", () => {
    assert.equal(shouldShowReachChart([]), false);
    assert.equal(shouldShowReachChart(undefined), false);
    assert.equal(shouldShowReachChart([{ day: "2026-09-01", reach: 10 }]), true);
  });
});
