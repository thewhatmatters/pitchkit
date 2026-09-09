import type { Media } from "./schema";

/** Insights Top-performing posts — display sorts only. Kit rank stays saves → reach → likes. */
export const POST_SORT_KEYS = ["reach", "engagement", "saves"] as const;

export type PostSortKey = (typeof POST_SORT_KEYS)[number];

export const DEFAULT_POST_SORT: PostSortKey = "reach";

export function isPostSortKey(value: string): value is PostSortKey {
  return (POST_SORT_KEYS as readonly string[]).includes(value);
}

export function postEngagement(post: Pick<Media, "like_count" | "comments_count">): number {
  return post.like_count + post.comments_count;
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

/** Re-rank the already-selected six for Insights. Missing Insights sort last. */
export function sortPosts(posts: Media[], key: PostSortKey): Media[] {
  return [...posts].sort((a, b) => {
    if (key === "engagement") {
      return postEngagement(b) - postEngagement(a);
    }

    if (key === "reach") {
      const reach = compareNullableDesc(a.reach, b.reach);
      if (reach !== 0) {
        return reach;
      }
      return postEngagement(b) - postEngagement(a);
    }

    const saves = compareNullableDesc(a.saves, b.saves);
    if (saves !== 0) {
      return saves;
    }
    const reach = compareNullableDesc(a.reach, b.reach);
    if (reach !== 0) {
      return reach;
    }
    return postEngagement(b) - postEngagement(a);
  });
}
