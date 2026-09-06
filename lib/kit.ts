import { engagementRate } from "./engagement";
import type { Media, User } from "./schema";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Account reach day bucket. `day` is YYYY-MM-DD UTC (Graph `end_time` date). */
export type ReachPoint = {
  day: string;
  reach: number;
};

export const UTC_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function isUtcDay(value: string): boolean {
  return UTC_DAY.test(value);
}

export type PublicKit = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  hasInsights: boolean;
  /**
   * One series: account reach (stories + ads). FE: hide Chart when omitted or [].
   * Do not zero-fill a missing Insights window.
   */
  reach_series?: ReachPoint[];
};

export type AssembleKitOptions = {
  /** Seed/example or poll-derived. Ignored when Insights are missing. */
  reach_series?: ReachPoint[];
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
  options: AssembleKitOptions = {},
): PublicKit | null {
  if (user.disconnected_at) {
    return null;
  }

  const posts = selectSixPosts(media, now);
  const hasInsights = kitHasInsights(posts);

  return {
    user,
    posts,
    engagementRate: engagementRate(posts, user.followers),
    hasInsights,
    // Insights missing → omit (Chart hides). Do not invent 30 zeros.
    ...(hasInsights ? { reach_series: options.reach_series ?? [] } : {}),
  };
}
