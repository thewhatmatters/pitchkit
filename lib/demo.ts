import { engagementRate } from "@/lib/engagement";

/** Frozen Pitchkit seed handle. Live kits use the handle frozen at first connect. */
export const DEMO_HANDLE = "demo";

export type MediaType = "IMAGE" | "VIDEO" | "CAROUSEL";

export type DemoPost = {
  id: string;
  ig_media_id: string;
  permalink: string;
  posted_at: string;
  media_type: MediaType;
  product_type: "FEED" | "REELS";
  caption: string | null;
  image_src: string;
  like_count: number;
  comments_count: number;
  reach: number | null;
  saves: number | null;
  shares: number | null;
  impressions: number | null;
};

export type DemoUser = {
  handle: string;
  name: string;
  avatar_src: string;
  followers: number;
  media_count: number;
  ig_account_type: "BUSINESS";
};

export const demoUser: DemoUser = {
  handle: DEMO_HANDLE,
  name: "Demo Creator",
  avatar_src: "/demo/avatar.svg",
  followers: 10_000,
  media_count: 86,
  ig_account_type: "BUSINESS",
};

/** Seed posts — public likes/comments only. Insights fields stay null. */
export const demoPosts: DemoPost[] = [
  {
    id: "1",
    ig_media_id: "demo-1",
    permalink: "https://www.instagram.com/p/demo-1/",
    posted_at: "2026-08-28T14:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    caption: null,
    image_src: "/demo/post-1.svg",
    like_count: 200,
    comments_count: 20,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
  },
  {
    id: "2",
    ig_media_id: "demo-2",
    permalink: "https://www.instagram.com/p/demo-2/",
    posted_at: "2026-08-26T14:00:00.000Z",
    media_type: "CAROUSEL",
    product_type: "FEED",
    caption: null,
    image_src: "/demo/post-2.svg",
    like_count: 180,
    comments_count: 18,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
  },
  {
    id: "3",
    ig_media_id: "demo-3",
    permalink: "https://www.instagram.com/p/demo-3/",
    posted_at: "2026-08-24T14:00:00.000Z",
    media_type: "VIDEO",
    product_type: "REELS",
    caption: null,
    image_src: "/demo/post-3.svg",
    like_count: 160,
    comments_count: 16,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
  },
  {
    id: "4",
    ig_media_id: "demo-4",
    permalink: "https://www.instagram.com/p/demo-4/",
    posted_at: "2026-08-22T14:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    caption: null,
    image_src: "/demo/post-4.svg",
    like_count: 140,
    comments_count: 14,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
  },
  {
    id: "5",
    ig_media_id: "demo-5",
    permalink: "https://www.instagram.com/p/demo-5/",
    posted_at: "2026-08-20T14:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    caption: null,
    image_src: "/demo/post-5.svg",
    like_count: 120,
    comments_count: 12,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
  },
  {
    id: "6",
    ig_media_id: "demo-6",
    permalink: "https://www.instagram.com/p/demo-6/",
    posted_at: "2026-08-18T14:00:00.000Z",
    media_type: "IMAGE",
    product_type: "FEED",
    caption: null,
    image_src: "/demo/post-6.svg",
    like_count: 100,
    comments_count: 10,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
  },
];

/** Demo seed has no Insights. Hide reach, saves, and the chart slot. */
export const demoHasInsights = demoPosts.every(
  (post) => post.reach == null && post.saves == null,
);

export const demoEngagementRate = engagementRate(demoPosts, demoUser.followers);

export function kitPath(handle: string) {
  return `/k/${handle}`;
}
