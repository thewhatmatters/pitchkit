"use client";

import { useEffect, useState } from "react";
import {
  CREATOR_INSIGHTS_BODY_BAND_CLASS,
  CREATOR_INSIGHTS_BODY_INNER_CLASS,
  CREATOR_INSIGHTS_HEADER_BAND_CLASS,
  CREATOR_INSIGHTS_PAGE_CLASS,
} from "@/components/pattern-tokens";
import { OwnerChrome } from "@/components/owner-chrome";
import { OwnerNav, type OwnerView } from "@/components/owner-nav";
import { OwnerPitchKit } from "@/components/owner-pitchkit";
import { SupportFooter } from "@/components/support-footer";
import type { KitAudience } from "@/lib/kit";
import type { ReachPoint } from "@/lib/reach-series";
import type { Media, User } from "@/lib/schema";

type OwnerWorkspaceProps = {
  user: User;
  ownerPosts: Media[];
  engagementRate: number | null;
  typicalReach: number | null;
  typicalSaves: number | null;
  reachSeries?: ReachPoint[] | null;
  hasInsights: boolean;
  audience?: KitAudience | null;
  gridReady: boolean;
  retrieving?: boolean;
};

/**
 * Pattern — creator Insights Show code (`examples-pitchkit--creator-insights`)
 * plus Pattern — owner PitchKit (`examples-pitchkit--owner-pitch-kit`).
 * One shell: SegmentedControl toggles Insights vs the owner kit so the
 * selected-pill motion can play. No hard `/insights` ↔ `/k/…` nav.
 */
export function OwnerWorkspace({
  user,
  ownerPosts,
  engagementRate,
  typicalReach,
  typicalSaves,
  reachSeries,
  hasInsights,
  audience,
  gridReady,
  retrieving = false,
}: OwnerWorkspaceProps) {
  const [view, setView] = useState<OwnerView>("insights");
  const [posts, setPosts] = useState(ownerPosts);

  useEffect(() => {
    setPosts(ownerPosts);
  }, [ownerPosts]);

  return (
    <main className={CREATOR_INSIGHTS_PAGE_CLASS}>
      <div className={CREATOR_INSIGHTS_HEADER_BAND_CLASS}>
        <OwnerNav user={user} posts={posts} view={view} onViewChange={setView} />
      </div>
      <div className={CREATOR_INSIGHTS_BODY_BAND_CLASS}>
        <div className={CREATOR_INSIGHTS_BODY_INNER_CLASS}>
          {view === "pitchkit" ? (
            <OwnerPitchKit user={user} posts={posts} onPostsChange={setPosts} />
          ) : (
            <OwnerChrome
              user={user}
              posts={posts}
              onPostsChange={setPosts}
              engagementRate={engagementRate}
              typicalReach={typicalReach}
              typicalSaves={typicalSaves}
              reachSeries={reachSeries}
              hasInsights={hasInsights}
              audience={audience}
              gridReady={gridReady}
              retrieving={retrieving}
            />
          )}
          <SupportFooter />
        </div>
      </div>
    </main>
  );
}
