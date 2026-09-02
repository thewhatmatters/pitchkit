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
