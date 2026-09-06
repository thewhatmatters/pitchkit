import { engagementRate, typicalFromPosts } from "./engagement";
import { shouldShowReachChart, type ReachPoint } from "./reach-series";
import type { Media, User } from "./schema";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type PublicKit = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  hasInsights: boolean;
  /** Account 30-day reach. Empty / omit → hide Chart. Never invent points. */
  reach_series: ReachPoint[];
  typicalReach: number | null;
  typicalSaves: number | null;
};

export function kitPath(handle: string) {
  return `/k/${handle}`;
}

/** Missing Insights sort last, then saves, reach, likes (all descending). */
export function compareMediaRank(a: Media, b: Media): number {
  const saves = compareNullableDesc(a.saves, b.saves);
  if (saves !== 0) {
    return saves;
  }

  const reach = compareNullableDesc(a.reach, b.reach);
  if (reach !== 0) {
    return reach;
  }

  return b.like_count - a.like_count;
}

function compareNullableDesc(a: number | null, b: number | null): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  return b - a;
}

/**
 * Six posts: last 30 days, ranked saves then reach then likes.
 * Fill from older fetched posts only if we do not have six in-window.
 */
export function selectSixPosts(media: Media[], now: Date = new Date()): Media[] {
  const windowStart = now.getTime() - THIRTY_DAYS_MS;
  const inWindow: Media[] = [];
  const older: Media[] = [];

  for (const row of media) {
    if (new Date(row.posted_at).getTime() >= windowStart) {
      inWindow.push(row);
    } else {
      older.push(row);
    }
  }

  const picked = [...inWindow].sort(compareMediaRank).slice(0, 6);
  if (picked.length < 6) {
    picked.push(...[...older].sort(compareMediaRank).slice(0, 6 - picked.length));
  }

  return picked;
}

/** Insights missing → still show ER; hide reach, saves, and the chart. */
export function kitHasInsights(posts: Media[]): boolean {
  return posts.some(
    (post) =>
      post.insights_fetched_at != null ||
      post.reach != null ||
      post.saves != null ||
      post.shares != null ||
      post.impressions != null,
  );
}

export function assemblePublicKit(
  user: User,
  media: Media[],
  now: Date = new Date(),
  reachSeries: ReachPoint[] = [],
): PublicKit | null {
  if (user.disconnected_at) {
    return null;
  }

  const posts = selectSixPosts(media, now);
  const typical = typicalFromPosts(posts);
  const hasPostInsights = kitHasInsights(posts);

  return {
    user,
    posts,
    engagementRate: engagementRate(posts, user.followers),
    hasInsights: hasPostInsights || shouldShowReachChart(reachSeries),
    reach_series: reachSeries,
    typicalReach: typical.typicalReach,
    typicalSaves: typical.typicalSaves,
  };
}
