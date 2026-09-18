import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  audienceFitSurface,
  resolveOwnerAudience,
  SEED_AUDIENCE,
  shouldShowAudienceMix,
  visibleAudienceMix,
} from "./audience";
import {
  EXAMPLE_AGE_MIX,
  EXAMPLE_CITY_MIX,
  EXAMPLE_COUNTRY_MIX,
  EXAMPLE_GENDER_MIX,
} from "./inventory";
import {
  shouldShowPastBrands,
  sourcedContact,
  sourcedContactDetail,
  visibleBrandNames,
} from "./kit-chips";
import { reachChartSurface, shouldRenderReachChartBand, shouldShowReachChart } from "./reach-series";

describe("past brand chips", () => {
  it("hides empty or blank names and keeps honest names", () => {
    assert.deepEqual(visibleBrandNames([]), []);
    assert.deepEqual(visibleBrandNames(null), []);
    assert.deepEqual(visibleBrandNames(["  ", "Acme", ""]), ["Acme"]);
    assert.equal(shouldShowPastBrands([]), false);
    assert.equal(shouldShowPastBrands(["Acme"]), true);
    assert.equal(sourcedContact("  "), null);
    assert.equal(sourcedContact("hi@brand.com"), "hi@brand.com");
    assert.deepEqual(sourcedContactDetail("hi@brand.com"), {
      kind: "email",
      value: "hi@brand.com",
      href: "mailto:hi@brand.com",
    });
    assert.deepEqual(sourcedContactDetail("https://example.com"), {
      kind: "website",
      value: "https://example.com",
      href: "https://example.com",
    });
    assert.deepEqual(sourcedContactDetail("studio desk"), {
      kind: "text",
      value: "studio desk",
    });
    assert.equal(sourcedContactDetail("  "), null);
  });
});

describe("audience mix hide-empty", () => {
  it("hides empty mix bars and drops invented-zero rows", () => {
    assert.equal(shouldShowAudienceMix([]), false);
    assert.equal(shouldShowAudienceMix([{ label: "US", percent: 0 }]), false);
    assert.deepEqual(visibleAudienceMix([{ label: "US", percent: 37 }]), [
      { label: "US", percent: 37 },
    ]);
  });

  it("keeps the owner Audience Card surface when Graph / seed mixes are empty", () => {
    assert.equal(audienceFitSurface(null), "empty");
    assert.equal(audienceFitSurface(undefined), "empty");
    assert.equal(audienceFitSurface(SEED_AUDIENCE), "empty");
    assert.equal(audienceFitSurface(resolveOwnerAudience(null)), "empty");
    assert.equal(
      audienceFitSurface({
        country: EXAMPLE_COUNTRY_MIX,
        city: [],
        age: [],
        gender: [],
      }),
      "bars",
    );
  });

  it("live/empty owner audience never resolves to EXAMPLE labels", () => {
    const liveEmpty = resolveOwnerAudience({
      country: [],
      city: [],
      age: [],
      gender: [],
    });
    const omitted = resolveOwnerAudience(null);
    const seed = resolveOwnerAudience(SEED_AUDIENCE);
    const exampleLabels = [
      ...EXAMPLE_COUNTRY_MIX,
      ...EXAMPLE_CITY_MIX,
      ...EXAMPLE_AGE_MIX,
      ...EXAMPLE_GENDER_MIX,
    ].map((row) => row.label);

    for (const mixes of [liveEmpty, omitted, seed]) {
      const labels: string[] = [
        ...mixes.country,
        ...mixes.city,
        ...mixes.age,
        ...mixes.gender,
      ].map((row) => row.label);
      // Empty payload — no EXAMPLE country/city/age/gender labels to paint.
      assert.deepEqual(labels, []);
      assert.ok(exampleLabels.length > 0);
    }
  });
});

describe("reach chart hide contract", () => {
  it("does not paint Cartesian when reach_series is empty", () => {
    assert.equal(shouldShowReachChart([]), false);
    assert.equal(shouldShowReachChart(undefined), false);
    assert.equal(shouldShowReachChart([{ day: "2026-09-01", reach: 10 }]), true);
    assert.equal(reachChartSurface([], true), "empty");
    assert.equal(reachChartSurface(undefined, false), "omit");
  });

  it("skips Cartesian — no plot — until the host can paint", () => {
    const series = [{ day: "2026-09-01", reach: 10 }];
    assert.equal(shouldRenderReachChartBand([], 640), false);
    assert.equal(shouldRenderReachChartBand(series, 0), false);
    assert.equal(shouldRenderReachChartBand(series, 640), true);
  });
});
