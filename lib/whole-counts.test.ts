import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCount, typicalFromPosts } from "./engagement";
import { publicStats } from "./public-stats";

describe("averaged counts are whole numbers", () => {
  it("typical saves 51.5 rounds to 52", () => {
    const t = typicalFromPosts([
      { reach: 2000, saves: 48 },
      { reach: 3000, saves: 55 },
    ]);
    assert.equal(t.typicalSaves, 52);
    assert.equal(t.typicalReach, 2500);
  });
  it("formatCount never shows a decimal", () => {
    assert.equal(formatCount(51.5), "52");
    assert.equal(formatCount(2624.5), "2,625");
  });
  it("public stats show whole numbers", () => {
    const rows = publicStats({ followers: 64, engagement: null, typicalReach: 2624.5, typicalSaves: 51.5, hideEmpty: true });
    assert.deepEqual(rows.map((r) => r.value), ["64", "2,625", "52"]);
  });
});
