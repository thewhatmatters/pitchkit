import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  engagementRate,
  formatEngagementRate,
  hasInsightsReach,
  postEngagementRate,
  postInteractions,
} from "./engagement";
import { seedMedia, seedOwnerMedia } from "./seed";

function post(partial: {
  like_count: number;
  comments_count?: number;
  reach?: number | null;
  saves?: number | null;
  shares?: number | null;
}) {
  return {
    like_count: partial.like_count,
    comments_count: partial.comments_count ?? 0,
    reach: partial.reach ?? null,
    saves: partial.saves ?? null,
    shares: partial.shares ?? null,
  };
}

describe("engagementRate (reach lock 2026-09-18)", () => {
  it("is (likes + comments + saves + shares) ÷ reach per post when reach > 0", () => {
    const row = post({
      like_count: 10,
      comments_count: 2,
      saves: 3,
      shares: 1,
      reach: 100,
    });
    assert.equal(postInteractions(row), 16);
    assert.equal(postEngagementRate(row), 0.16);
    assert.equal(hasInsightsReach(row), true);
  });

  it("uses sum(interactions) ÷ sum(reach), not an average of per-post rates", () => {
    const small = post({
      like_count: 8,
      comments_count: 2,
      saves: 0,
      shares: 0,
      reach: 10,
    });
    const large = post({
      like_count: 8,
      comments_count: 2,
      saves: 0,
      shares: 0,
      reach: 1_000,
    });
    const averageOfRates =
      (postEngagementRate(small)! + postEngagementRate(large)!) / 2;
    const sumOverSum = engagementRate([small, large]);

    assert.equal(postEngagementRate(small), 1);
    assert.equal(postEngagementRate(large), 0.01);
    assert.equal(averageOfRates, 0.505);
    assert.equal(sumOverSum, 20 / 1_010);
    assert.notEqual(sumOverSum, averageOfRates);
  });

  it("hides when reach is missing, null, or 0 — no ÷ followers fallback", () => {
    const likesOnly = [
      post({ like_count: 200, comments_count: 20 }),
      post({ like_count: 180, comments_count: 18 }),
    ];
    assert.equal(engagementRate(likesOnly), null);
    assert.equal(formatEngagementRate(engagementRate(likesOnly)), "—");
    assert.equal(postEngagementRate(post({ like_count: 10, reach: null })), null);
    assert.equal(postEngagementRate(post({ like_count: 10, reach: 0 })), null);
    assert.equal(hasInsightsReach({ reach: 0 }), false);
    assert.equal(engagementRate([post({ like_count: 10, reach: 0 })]), null);
    assert.equal(engagementRate(seedMedia), null);
  });

  it("omits posts without reach from the account sum and does not invent zeros", () => {
    const counted = post({
      like_count: 4,
      comments_count: 1,
      saves: 2,
      shares: 1,
      reach: 100,
    });
    const skipped = post({ like_count: 999, comments_count: 9, reach: null });
    assert.equal(engagementRate([counted, skipped]), 8 / 100);
    assert.equal(postInteractions(post({ like_count: 4, comments_count: 1 })), 5);
  });

  it("computes owner seed from Insights reach, not followers", () => {
    const rate = engagementRate(seedOwnerMedia);
    assert.ok(rate != null);
    const interactions = seedOwnerMedia.reduce(
      (total, row) => total + postInteractions(row),
      0,
    );
    const reach = seedOwnerMedia.reduce((total, row) => total + (row.reach ?? 0), 0);
    assert.equal(rate, interactions / reach);
    assert.notEqual(rate, interactions / 10_000);
    assert.equal(formatEngagementRate(rate), "9.5%");
  });
});
