"use client";

import { Avatar, Card, Chip, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import { PastBrands } from "@/components/past-brands";
import { PostGrid } from "@/components/post-grid";
import { formatCount, formatEngagementRate } from "@/lib/engagement";
import { sourcedContact } from "@/lib/kit-chips";
import { publicObjectUrl } from "@/lib/r2";
import type { Media, User } from "@/lib/schema";

type KitCardProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  hasInsights: boolean;
  pastBrands?: readonly string[];
  contact?: string | null;
};

export function KitCard({
  user,
  posts,
  engagementRate,
  hasInsights,
  pastBrands = [],
  contact = null,
}: KitCardProps) {
  const contactValue = sourcedContact(contact);

  return (
    <Card variant="outlined" shape="rounded" padding="none">
      <Card.Header>
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={publicObjectUrl(user.avatar_r2_key) || undefined} size="lg" />
          <div className="min-w-0">
            <p className={cardTitleClasses}>{user.name}</p>
            <p className={cardBodyTextClasses}>@{user.handle}</p>
          </div>
          <Chip readOnly size="sm">
            Instagram
          </Chip>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="grid grid-cols-2 gap-3 p-3">
          <div>
            <p className={cardBodyTextClasses}>Followers</p>
            <p className={cardTitleClasses}>{formatCount(user.followers)}</p>
          </div>
          <div>
            <p className={cardBodyTextClasses}>Engagement rate</p>
            <p className={cardTitleClasses}>{formatEngagementRate(engagementRate)}</p>
          </div>
        </div>
        {contactValue ? (
          <div className="px-3 pb-3">
            <p className={cardBodyTextClasses}>Contact</p>
            <p className={cardTitleClasses}>{contactValue}</p>
          </div>
        ) : null}
        <div className="px-3 pb-3">
          <PastBrands brands={pastBrands} />
        </div>
        <PostGrid posts={posts} hasInsights={hasInsights} />
      </Card.Body>
    </Card>
  );
}
