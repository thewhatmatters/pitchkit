"use client";

import { useState } from "react";
import {
  CREATOR_INSIGHTS_BODY_BAND_CLASS,
  CREATOR_INSIGHTS_BODY_INNER_CLASS,
  CREATOR_INSIGHTS_HEADER_BAND_CLASS,
  CREATOR_INSIGHTS_PAGE_CLASS,
} from "@/components/pattern-tokens";
import { OwnerChrome } from "@/components/owner-chrome";
import { OwnerNav, type OwnerView } from "@/components/owner-nav";
import { PitchKitComingSoon } from "@/components/pitchkit-coming-soon";
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
};

/**
 * Pattern — creator Insights Show code (`examples-pitchkit--creator-insights`).
 * One shell: SegmentedControl toggles Insights vs Coming soon so the
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
}: OwnerWorkspaceProps) {
  const [view, setView] = useState<OwnerView>("insights");

  return (
    <main className={CREATOR_INSIGHTS_PAGE_CLASS}>
      <div className={CREATOR_INSIGHTS_HEADER_BAND_CLASS}>
        <OwnerNav name={user.name} view={view} onViewChange={setView} />
      </div>
      <div className={CREATOR_INSIGHTS_BODY_BAND_CLASS}>
        <div className={CREATOR_INSIGHTS_BODY_INNER_CLASS}>
          {view === "pitchkit" ? (
            <PitchKitComingSoon />
          ) : (
            <OwnerChrome
              user={user}
              posts={ownerPosts}
              engagementRate={engagementRate}
              typicalReach={typicalReach}
              typicalSaves={typicalSaves}
              reachSeries={reachSeries}
              hasInsights={hasInsights}
              audience={audience}
              gridReady={gridReady}
            />
          )}
          <SupportFooter>
            <p>
              <a href="/settings">Account</a>
            </p>
          </SupportFooter>
        </div>
      </div>
    </main>
  );
}
