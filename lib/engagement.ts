/** Media fields needed for locked Engagement rate math. */
export type EngagementMedia = {
  like_count: number;
  comments_count: number;
  reach: number | null;
  saves?: number | null;
  shares?: number | null;
};

/** Insights `reach` is the only ER denominator. Missing / null / 0 / non-finite → hide. */
export function hasInsightsReach(post: Pick<EngagementMedia, "reach">): boolean {
  return post.reach != null && Number.isFinite(post.reach) && post.reach > 0;
}

/**
 * Numerator: likes + comments + saves + shares.
 * Null saves/shares are omitted (not invented as displayed zeros).
 */
export function postInteractions(post: EngagementMedia): number {
  return (
    post.like_count +
    post.comments_count +
    (post.saves ?? 0) +
    (post.shares ?? 0)
  );
}

/** Per-post Engagement rate when that media has Insights `reach` > 0. */
export function postEngagementRate(post: EngagementMedia): number | null {
  if (!hasInsightsReach(post) || post.reach == null) {
    return null;
  }

  return postInteractions(post) / post.reach;
}

/**
 * Locked 2026-09-18: (likes + comments + saves + shares) ÷ reach.
 * Account / typical rate = sum(interactions) ÷ sum(reach) on posts with
 * Insights reach > 0 — not an average of per-post rates (avoids small-post skew).
 * No qualifying reach → null (hide or —). Do not fall back to ÷ followers.
 */
export function engagementRate(posts: EngagementMedia[]): number | null {
  let interactions = 0;
  let reach = 0;

  for (const post of posts) {
    if (!hasInsightsReach(post) || post.reach == null) {
      continue;
    }
    interactions += postInteractions(post);
    reach += post.reach;
  }

  if (reach <= 0) {
    return null;
  }

  return interactions / reach;
}

export function formatEngagementRate(rate: number | null): string {
  if (rate == null) {
    return "—";
  }

  return `${(rate * 100).toFixed(1)}%`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Typical post metric — median of present values. Empty → hide (never paint 0). */
export function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }

  return sorted[mid]!;
}

export function typicalFromPosts(
  posts: Array<{ reach: number | null; saves: number | null }>,
): { typicalReach: number | null; typicalSaves: number | null } {
  return {
    typicalReach: median(
      posts
        .map((post) => post.reach)
        .filter((value): value is number => value != null && Number.isFinite(value) && value > 0),
    ),
    typicalSaves: median(
      posts
        .map((post) => post.saves)
        .filter((value): value is number => value != null && Number.isFinite(value) && value > 0),
    ),
  };
}
