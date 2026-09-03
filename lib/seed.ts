import type { Detection, Media, User, WeeklyCount } from "./schema";

/** Frozen Pitchkit handle for the in-repo seed. Live kits freeze at first connect. */
export const DEMO_HANDLE = "demo";

export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

const FETCHED_AT = "2026-09-02T12:00:00.000Z";

/**
 * Seed user — same columns as live `users`. Tokens stay null so TOKEN_KEY is
 * not required. consent_index defaults off. disconnected_at null (kit is live).
 */
export const seedUsers: User[] = [
  {
    id: DEMO_USER_ID,
    ig_user_id: "demo-ig-user",
    handle: DEMO_HANDLE,
    name: "Demo Creator",
    avatar_r2_key: `${DEMO_USER_ID}/avatar.jpg`,
    followers: 10_000,
    media_count: 86,
    token_encrypted: null,
    refresh_encrypted: null,
    token_expires_at: null,
    connected_at: "2026-08-01T12:00:00.000Z",
    disconnected_at: null,
    consent_index: false,
    ig_account_type: "BUSINESS",
    disclosure_version: 1,
  },
];

function post(
  n: number,
  fields: Pick<
    Media,
    "posted_at" | "media_type" | "product_type" | "r2_key" | "like_count" | "comments_count"
  >,
): Media {
  return {
    id: `00000000-0000-4000-8000-00000000000${n}`,
    user_id: DEMO_USER_ID,
    ig_media_id: `demo-${n}`,
    permalink: `https://www.instagram.com/p/demo-${n}/`,
    caption: null,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
    fetched_at: FETCHED_AT,
    insights_fetched_at: null,
    ...fields,
  };
}

/**
 * One fetched page for the demo creator. Insights stay null (hide reach/saves/chart).
 * Carousel r2_key is the first frame; video r2_key is the poster. No R2 required —
 * keys map to /public/demo placeholders.
 */
export const seedMedia: Media[] = [
  post(1, {
    posted_at: "2026-08-28T14:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    r2_key: `${DEMO_USER_ID}/media/demo-1.jpg`,
    like_count: 200,
    comments_count: 20,
  }),
  post(2, {
    posted_at: "2026-08-26T14:00:00.000Z",
    media_type: "CAROUSEL",
    product_type: "FEED",
    r2_key: `${DEMO_USER_ID}/media/demo-2-cover.jpg`,
    like_count: 180,
    comments_count: 18,
  }),
  post(3, {
    posted_at: "2026-08-24T14:00:00.000Z",
    media_type: "VIDEO",
    product_type: "REELS",
    r2_key: `${DEMO_USER_ID}/media/demo-3-poster.jpg`,
    like_count: 160,
    comments_count: 16,
  }),
  post(4, {
    posted_at: "2026-08-22T14:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    r2_key: `${DEMO_USER_ID}/media/demo-4.jpg`,
    like_count: 140,
    comments_count: 14,
  }),
  post(5, {
    posted_at: "2026-08-20T14:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    r2_key: `${DEMO_USER_ID}/media/demo-5.jpg`,
    like_count: 120,
    comments_count: 12,
  }),
  post(6, {
    posted_at: "2026-08-18T14:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    r2_key: `${DEMO_USER_ID}/media/demo-6.jpg`,
    like_count: 100,
    comments_count: 10,
  }),
];

/** Empty until computer vision exists. */
export const seedDetections: Detection[] = [];

/** Empty until consented rollups exist. No identifying columns. */
export const seedWeeklyCounts: WeeklyCount[] = [];

export const seedUser = seedUsers[0];
