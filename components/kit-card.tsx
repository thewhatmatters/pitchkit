import { Badge, Card, cardBodyTextClasses, cardTitleClasses } from "@whatmatters/wmds";
import type { DemoPost, DemoUser } from "@/lib/demo";
import { formatCount, formatEngagementRate } from "@/lib/engagement";
import { PostGrid } from "@/components/post-grid";

type KitCardProps = {
  user: DemoUser;
  posts: DemoPost[];
  engagementRate: number | null;
  hasInsights: boolean;
};

export function KitCard({ user, posts, engagementRate, hasInsights }: KitCardProps) {
  return (
    <Card variant="outlined" shape="rounded" padding="none">
      <Card.Header>
        <div className="flex items-center gap-3">
          <img src={user.avatar_src} alt="" width={56} height={56} />
          <div>
            <p className={cardTitleClasses}>{user.name}</p>
            <p className={cardBodyTextClasses}>@{user.handle}</p>
          </div>
          <Badge>Instagram</Badge>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="grid grid-cols-2 gap-3 p-3">
          <div>
            <p className={cardBodyTextClasses}>Followers</p>
            <p className={cardTitleClasses}>{formatCount(user.followers)}</p>
          </div>
          <div>
            <p className={cardBodyTextClasses}>Engagement</p>
            <p className={cardTitleClasses}>{formatEngagementRate(engagementRate)}</p>
          </div>
        </div>
        <PostGrid posts={posts} hasInsights={hasInsights} />
      </Card.Body>
    </Card>
  );
}
