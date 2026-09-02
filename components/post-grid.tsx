"use client";

import { Card, cardBodyTextClasses } from "@/components/wmds";
import type { DemoPost } from "@/lib/demo";
import { formatCount } from "@/lib/engagement";

type PostGridProps = {
  posts: DemoPost[];
  hasInsights: boolean;
};

export function PostGrid({ posts, hasInsights }: PostGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {posts.map((post) => (
        <Card key={post.id} variant="outlined" shape="rounded" padding="none">
          <Card.Body>
            {/* Carousel: first frame. Video: poster only. */}
            <img
              src={post.image_src}
              alt=""
              width={400}
              height={400}
              className="w-full"
            />
            <div className="px-3 py-2">
              <p className={cardBodyTextClasses}>
                {formatCount(post.like_count)} likes · {formatCount(post.comments_count)} comments
                {hasInsights && post.reach != null
                  ? ` · ${formatCount(post.reach)} reach`
                  : ""}
                {hasInsights && post.saves != null
                  ? ` · ${formatCount(post.saves)} saves`
                  : ""}
              </p>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
