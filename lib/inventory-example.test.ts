import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AGE_BRACKETS,
  EXAMPLE_AGE_MIX,
  EXAMPLE_CITY_MIX,
  EXAMPLE_COUNTRY_MIX,
  EXAMPLE_GENDER_MIX,
  EXAMPLE_POST_INSIGHTS,
  META_GENDER_BUCKETS,
  buildExampleInventory,
  exampleRankedPosts,
  median,
} from "./inventory-example";
import { EXAMPLE_DATA_BANNER } from "./copy";
import { seedMedia, seedUser } from "./seed";
import { loadPublicKit } from "./store";

const NOW = new Date("2026-09-02T12:00:00.000Z");

describe("example inventory", () => {
  it("marks the dump as example data, not live Instagram", () => {
    const inventory = buildExampleInventory(seedMedia, seedUser.followers);
    assert.equal(inventory.example, true);
    assert.equal(inventory.banner, EXAMPLE_DATA_BANNER);
    assert.match(inventory.bio, /Example biography/);
    assert.equal(inventory.website, "https://example.com");
  });

  it("computes ER as (likes + comments) ÷ followers on the six posts", () => {
    const inventory = buildExampleInventory(seedMedia, seedUser.followers);
    assert.equal(inventory.followers, 10_000);
    assert.equal(inventory.engagementRate, 0.099);
  });

  it("ranks demo posts saves → reach → likes, not likes-first", () => {
    const ranked = exampleRankedPosts(seedMedia);
    assert.deepEqual(
      ranked.map((post) => post.ig_media_id),
      ["demo-4", "demo-6", "demo-2", "demo-1", "demo-5", "demo-3"],
    );
    assert.ok(ranked[0]!.like_count < ranked[3]!.like_count);
    assert.equal(ranked[0]!.saves, EXAMPLE_POST_INSIGHTS["demo-4"]!.saves);
  });

  it("uses median reach and saves as typical, not a spike", () => {
    const inventory = buildExampleInventory(seedMedia);
    // 3500, 4000, 5100, 6200, 8000, 9000
    assert.equal(inventory.typicalReach, 5650);
    // 40, 80, 220, 300, 410, 410
    assert.equal(inventory.typicalSaves, 260);
  });

  it("keeps Meta gender buckets and API age brackets only", () => {
    assert.deepEqual(
      EXAMPLE_GENDER_MIX.map((row) => row.bucket),
      [...META_GENDER_BUCKETS],
    );
    assert.deepEqual(
      EXAMPLE_AGE_MIX.map((row) => row.bracket),
      [...AGE_BRACKETS],
    );
    assert.equal(EXAMPLE_COUNTRY_MIX[0]!.label, "United States");
    assert.equal(EXAMPLE_COUNTRY_MIX[0]!.percent, 37);
    assert.ok(EXAMPLE_CITY_MIX.every((row) => !/hometown/i.test(row.label)));
  });

  it("does not change the public /k/demo seed (Insights stay missing)", () => {
    const demo = loadPublicKit("demo", NOW);
    assert.ok(demo);
    assert.equal(demo.hasInsights, false);
    assert.ok(demo.posts.every((post) => post.saves == null && post.reach == null));
  });
});

describe("median", () => {
  it("averages the middle pair on even length", () => {
    assert.equal(median([1, 2, 3, 4]), 2.5);
  });
});
