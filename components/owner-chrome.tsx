"use client";

import { useMemo, useState } from "react";
import { AudienceList } from "@/components/audience-list";
import { Button, Card, SegmentedControl, cardTitleClasses } from "@/components/wmds";
import { InsightsStats } from "@/components/insights-stats";
import { PostGrid } from "@/components/post-grid";
import { ReachChart } from "@/components/reach-chart";
import { SEED_AUDIENCE } from "@/lib/audience";
import { STUB_DISCONNECT } from "@/lib/copy";
import { DEFAULT_POST_SORT, isPostSortKey, sortPosts, type PostSortKey } from "@/lib/post-sort";
import type { ReachPoint } from "@/lib/reach-series";
import type { Media, User } from "@/lib/schema";

type OwnerChromeProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  typicalReach: number | null;
  typicalSaves: number | null;
  reachSeries?: ReachPoint[] | null;
  hasInsights: boolean;
  gridReady: boolean;
};

export function OwnerChrome({
  user,
  posts,
  engagementRate,
  typicalReach,
  typicalSaves,
  reachSeries,
  hasInsights,
  gridReady,
}: OwnerChromeProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<PostSortKey>(DEFAULT_POST_SORT);
  const rankedPosts = useMemo(() => sortPosts(posts, sortKey), [posts, sortKey]);

  return (
    <div className="flex flex-col gap-6">
      <InsightsStats
        followers={user.followers}
        engagementRate={engagementRate}
        typicalReach={typicalReach}
        typicalSaves={typicalSaves}
        loading={!gridReady}
      />
      <ReachChart series={reachSeries} loading={!gridReady} />
      <Card padding="none">
        <Card.Header>
          <div className="flex w-full min-w-0 flex-col gap-3">
            <h2 className={cardTitleClasses}>Top-performing posts</h2>
            <SegmentedControl
              aria-label="Sort posts"
              value={sortKey}
              onValueChange={(value) => {
                if (isPostSortKey(value)) {
                  setSortKey(value);
                }
              }}
              size="sm"
              layout="stretch"
              className="w-full min-w-0"
            >
              <SegmentedControl.Item value="reach">Reach</SegmentedControl.Item>
              <SegmentedControl.Item value="engagement">Engagement</SegmentedControl.Item>
              <SegmentedControl.Item value="saves">Saves</SegmentedControl.Item>
            </SegmentedControl>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="p-3">
            <PostGrid
              posts={rankedPosts}
              hasInsights={hasInsights}
              loading={!gridReady}
              layout="rows"
            />
          </div>
        </Card.Body>
      </Card>
      <AudienceList title="Country mix" rows={SEED_AUDIENCE.country} />
      <AudienceList title="City mix" rows={SEED_AUDIENCE.city} />
      <AudienceList title="Age mix" rows={SEED_AUDIENCE.age} />
      <AudienceList title="Gender mix" rows={SEED_AUDIENCE.gender} />

      <div className="flex flex-wrap gap-2">
        <form action="/auth/instagram" method="post">
          <Button type="submit" role="secondary">
            Reconnect Instagram
          </Button>
        </form>
        <form action="/auth/sign-out" method="post">
          <Button type="submit" role="secondary">
            Sign out
          </Button>
        </form>
        <Button role="destructive" onClick={() => setNotice(STUB_DISCONNECT)}>
          Disconnect
        </Button>
      </div>

      {notice ? <p>{notice}</p> : null}
    </div>
  );
}
