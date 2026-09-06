"use client";

import { Card, Skeleton, cardBodyTextClasses } from "@/components/wmds";
import { formatCount } from "@/lib/engagement";
import { publicObjectUrl } from "@/lib/r2";
import type { Media } from "@/lib/schema";

type PostGridProps = {
  posts: Media[];
  hasInsights: boolean;
  loading?: boolean;
  /** Insights: compact single-column rows. Public kit stays a card grid. */
  layout?: "grid" | "rows";
};

function postMetrics(post: Media, hasInsights: boolean): string {
  const parts = [
    `${formatCount(post.like_count)} likes`,
    `${formatCount(post.comments_count)} comments`,
  ];
  if (hasInsights && post.reach != null) {
    parts.push(`${formatCount(post.reach)} reach`);
  }
  if (hasInsights && post.saves != null) {
    parts.push(`${formatCount(post.saves)} saves`);
  }
  return parts.join(" · ");
}

export function PostGrid({
  posts,
  hasInsights,
  loading = false,
  layout = "grid",
}: PostGridProps) {
  if (layout === "rows") {
    if (loading) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Card key={index} variant="outlined" shape="rounded" padding="none">
              <Card.Body>
                <div className="flex items-center gap-3 p-2">
                  <Skeleton width={56} height={56} radius="inner" index={index} />
                  <Skeleton width="70%" height={12} radius="inner" index={index + 1} />
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {posts.map((post) => (
          <Card key={post.id} variant="outlined" shape="rounded" padding="none">
            <Card.Body>
              <div className="flex items-center gap-3 p-2">
                <img
                  src={publicObjectUrl(post.r2_key)}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 shrink-0 object-cover"
                />
                <p className={cardBodyTextClasses}>{postMetrics(post, hasInsights)}</p>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} variant="outlined" shape="rounded" padding="none">
            <Card.Body>
              <div className="flex flex-col gap-2 p-3">
                <Skeleton width="100%" height={160} radius="inner" index={index} />
                <Skeleton width="70%" height={12} radius="inner" index={index + 1} />
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} variant="outlined" shape="rounded" padding="none">
          <Card.Body>
            <img
              src={publicObjectUrl(post.r2_key)}
              alt=""
              width={400}
              height={400}
              className="w-full"
            />
            <div className="px-3 py-2">
              <p className={cardBodyTextClasses}>{postMetrics(post, hasInsights)}</p>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
