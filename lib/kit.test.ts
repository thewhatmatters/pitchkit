import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { engagementRate } from "./engagement";
import { assemblePublicKit, kitHasInsights, selectSixPosts } from "./kit";
import type { Media, User } from "./schema";
import { MEDIA_COLUMNS, USER_COLUMNS } from "./schema";
import { DEMO_HANDLE, seedDetections, seedMedia, seedUser, seedWeeklyCounts } from "./seed";
import { loadPublicKit } from "./store";

const NOW = new Date("2026-09-02T12:00:00.000Z");

function media(partial: Partial<Media> & Pick<Media, "id" | "posted_at" | "like_count">): Media {
  return {
    user_id: "u1",
    ig_media_id: partial.id,
    permalink: `https://www.instagram.com/p/${partial.id}/`,
    media_type: "IMAGE",
    product_type: "FEED",
    caption: null,
    r2_key: `${partial.id}.jpg`,
    comments_count: 0,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
    fetched_at: NOW.toISOString(),
    insights_fetched_at: null,
    ...partial,
  };
}

function user(partial: Partial<User> = {}): User {
  return {
    id: "u1",
    ig_user_id: "ig-1",
    handle: "tester",
    name: "Tester",
    avatar_r2_key: null,
    followers: 100,
    media_count: 10,
    token_encrypted: null,
    refresh_encrypted: null,
    token_expires_at: null,
    connected_at: "2026-08-01T00:00:00.000Z",
    disconnected_at: null,
    consent_index: false,
    ig_account_type: "BUSINESS",
    disclosure_version: 1,
    ...partial,
  };
}

describe("selectSixPosts", () => {
  it("ranks last-30-day posts by saves, then reach, then likes; missing Insights last", () => {
    const rows = [
      media({ id: "a", posted_at: "2026-08-20T00:00:00.000Z", saves: 10, reach: 100, like_count: 1 }),
      media({ id: "b", posted_at: "2026-08-21T00:00:00.000Z", saves: 20, reach: 50, like_count: 1 }),
      media({ id: "c", posted_at: "2026-08-22T00:00:00.000Z", saves: 10, reach: 200, like_count: 1 }),
      media({ id: "d", posted_at: "2026-08-23T00:00:00.000Z", saves: 10, reach: 100, like_count: 9 }),
      media({
        id: "e",
        posted_at: "2026-08-24T00:00:00.000Z",
        saves: null,
        reach: 999,
        like_count: 999,
      }),
      media({ id: "f", posted_at: "2026-08-25T00:00:00.000Z", saves: 5, reach: 1, like_count: 1 }),
      media({ id: "g", posted_at: "2026-08-26T00:00:00.000Z", saves: 4, reach: 1, like_count: 1 }),
      media({ id: "h", posted_at: "2026-08-27T00:00:00.000Z", saves: 3, reach: 1, like_count: 1 }),
      media({
        id: "old",
        posted_at: "2026-07-01T00:00:00.000Z",
        saves: 999,
        reach: 999,
        like_count: 999,
      }),
    ];

    assert.deepEqual(
      selectSixPosts(rows, NOW).map((row) => row.id),
      ["b", "c", "d", "a", "f", "g"],
    );
  });

  it("fills from older fetched posts only when fewer than six are in-window", () => {
    const rows = [
      media({ id: "w1", posted_at: "2026-08-20T00:00:00.000Z", saves: 2, like_count: 1 }),
      media({ id: "w2", posted_at: "2026-08-21T00:00:00.000Z", saves: 1, like_count: 1 }),
      media({ id: "o1", posted_at: "2026-07-01T00:00:00.000Z", saves: 8, like_count: 1 }),
      media({ id: "o2", posted_at: "2026-07-02T00:00:00.000Z", saves: 9, like_count: 1 }),
      media({ id: "o3", posted_at: "2026-07-03T00:00:00.000Z", saves: 7, like_count: 1 }),
    ];

    assert.deepEqual(
      selectSixPosts(rows, NOW).map((row) => row.id),
      ["w1", "w2", "o2", "o1", "o3"],
    );
  });
});

describe("ER hide-insights", () => {
  it("still computes ER from likes+comments when Insights are missing, and hides Insights", () => {
    const posts = [
      media({ id: "1", posted_at: "2026-08-20T00:00:00.000Z", like_count: 200, comments_count: 20 }),
      media({ id: "2", posted_at: "2026-08-21T00:00:00.000Z", like_count: 180, comments_count: 18 }),
      media({ id: "3", posted_at: "2026-08-22T00:00:00.000Z", like_count: 160, comments_count: 16 }),
      media({ id: "4", posted_at: "2026-08-23T00:00:00.000Z", like_count: 140, comments_count: 14 }),
      media({ id: "5", posted_at: "2026-08-24T00:00:00.000Z", like_count: 120, comments_count: 12 }),
      media({ id: "6", posted_at: "2026-08-25T00:00:00.000Z", like_count: 100, comments_count: 10 }),
    ];

    assert.equal(kitHasInsights(posts), false);
    assert.equal(engagementRate(posts, 10_000), 0.099);

    const kit = assemblePublicKit(user({ followers: 10_000 }), posts, NOW);
    assert.ok(kit);
    assert.equal(kit.hasInsights, false);
    assert.equal(kit.engagementRate, 0.099);
  });

  it("returns null ER when followers are 0", () => {
    const posts = [
      media({ id: "1", posted_at: "2026-08-20T00:00:00.000Z", like_count: 10, comments_count: 1 }),
    ];
    assert.equal(engagementRate(posts, 0), null);
  });
});

describe("seed schema", () => {
  it("uses DATA.md columns only and keeps detections / weekly_counts empty", () => {
    assert.deepEqual(Object.keys(seedUser).sort(), [...USER_COLUMNS].sort());
    assert.deepEqual(Object.keys(seedMedia[0]!).sort(), [...MEDIA_COLUMNS].sort());
    assert.equal(seedUser.handle, DEMO_HANDLE);
    assert.equal(seedUser.disconnected_at, null);
    assert.equal(seedUser.consent_index, false);
    assert.equal(seedUser.token_encrypted, null);
    assert.equal(seedDetections.length, 0);
    assert.equal(seedWeeklyCounts.length, 0);
    assert.equal(
      seedMedia.find((row) => row.media_type === "CAROUSEL")?.r2_key.endsWith("-cover.jpg"),
      true,
    );
    assert.equal(
      seedMedia.find((row) => row.media_type === "VIDEO")?.r2_key.endsWith("-poster.jpg"),
      true,
    );
  });

  it("loads /k/demo from seed and 404s unknown or disconnected handles", () => {
    const demo = loadPublicKit(DEMO_HANDLE, NOW);
    assert.ok(demo);
    assert.equal(demo.user.handle, DEMO_HANDLE);
    assert.equal(demo.posts.length, 6);
    assert.equal(demo.hasInsights, false);
    assert.equal(demo.engagementRate, 0.099);
    assert.equal(loadPublicKit("nope", NOW), null);
    assert.equal(assemblePublicKit(user({ disconnected_at: NOW.toISOString() }), seedMedia, NOW), null);
  });
});
