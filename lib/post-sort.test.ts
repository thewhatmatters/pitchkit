import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_POST_SORT,
  POST_SORT_KEYS,
  isPostSortKey,
  postEngagement,
  sortPosts,
} from "./post-sort";
import type { Media } from "./schema";

function media(
  partial: Partial<Media> & Pick<Media, "id" | "like_count" | "comments_count">,
): Media {
  return {
    user_id: "u1",
    ig_media_id: partial.id,
    permalink: `https://www.instagram.com/p/${partial.id}/`,
    posted_at: "2026-08-20T00:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    caption: null,
    r2_key: `${partial.id}.jpg`,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
    fetched_at: "2026-09-02T12:00:00.000Z",
    insights_fetched_at: null,
    hidden_from_kit_at: null,
    ...partial,
  };
}

describe("post sort keys", () => {
  it("exposes Reach / Engagement / Saves and defaults to reach", () => {
    assert.deepEqual([...POST_SORT_KEYS], ["reach", "engagement", "saves"]);
    assert.equal(DEFAULT_POST_SORT, "reach");
    assert.equal(isPostSortKey("reach"), true);
    assert.equal(isPostSortKey("engagement"), true);
    assert.equal(isPostSortKey("saves"), true);
    assert.equal(isPostSortKey("likes"), false);
  });

  it("sorts by reach, then engagement; missing Insights last", () => {
    const rows = [
      media({ id: "low", like_count: 9, comments_count: 1, reach: 10, saves: 1 }),
      media({ id: "high", like_count: 1, comments_count: 0, reach: 90, saves: 1 }),
      media({ id: "none", like_count: 50, comments_count: 5, reach: null, saves: 9 }),
    ];
    assert.deepEqual(
      sortPosts(rows, "reach").map((row) => row.id),
      ["high", "low", "none"],
    );
  });

  it("sorts engagement as likes + comments", () => {
    const rows = [
      media({ id: "a", like_count: 10, comments_count: 1 }),
      media({ id: "b", like_count: 4, comments_count: 8 }),
      media({ id: "c", like_count: 20, comments_count: 0 }),
    ];
    assert.equal(postEngagement(rows[1]!), 12);
    assert.deepEqual(
      sortPosts(rows, "engagement").map((row) => row.id),
      ["c", "b", "a"],
    );
  });

  it("sorts saves first, then reach, then engagement", () => {
    const rows = [
      media({ id: "a", like_count: 9, comments_count: 0, reach: 10, saves: 2 }),
      media({ id: "b", like_count: 1, comments_count: 0, reach: 50, saves: 2 }),
      media({ id: "c", like_count: 1, comments_count: 0, reach: 10, saves: 8 }),
    ];
    assert.deepEqual(
      sortPosts(rows, "saves").map((row) => row.id),
      ["c", "b", "a"],
    );
  });
});
