/** Locked kit math: (likes + comments) / followers on the six posts. */
export function engagementRate(
  posts: Array<{ like_count: number; comments_count: number }>,
  followers: number,
): number | null {
  if (followers <= 0) {
    return null;
  }

  const engagement = posts.reduce(
    (total, post) => total + post.like_count + post.comments_count,
    0,
  );

  return engagement / followers;
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
        .filter((value): value is number => value != null && Number.isFinite(value)),
    ),
    typicalSaves: median(
      posts
        .map((post) => post.saves)
        .filter((value): value is number => value != null && Number.isFinite(value)),
    ),
  };
}
