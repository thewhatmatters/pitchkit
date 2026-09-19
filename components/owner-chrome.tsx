"use client";

import { useState } from "react";
import { AudienceFit } from "@/components/audience-fit";
import { InsightsLoading } from "@/components/insights-loading";
import {
  PATTERN_DASHBOARD_GRID_CLASS,
  PATTERN_FORMULA_CLASS,
  PATTERN_HEADER_COPY_CLASS,
  PATTERN_HEADER_SECTION_CLASS,
  PATTERN_METRICS_STACK_CLASS,
  PATTERN_SUPPORTING_CLASS,
} from "@/components/pattern-tokens";
import { Button, PageHeader } from "@/components/wmds";
import { InsightsStats } from "@/components/insights-stats";
import { ProofPosts } from "@/components/proof-posts";
import { ReachChart } from "@/components/reach-chart";
import { copyShareKitLink, ShareKitButton } from "@/components/share-kit-button";
import { resolveOwnerAudience } from "@/lib/audience";
import { DisconnectControl } from "@/components/disconnect-control";
import { INSIGHTS_PRIVATE } from "@/lib/copy";
import { ENGAGEMENT_FORMULA, inventoryLastUpdated } from "@/lib/inventory";
import type { KitAudience } from "@/lib/kit";
import type { ReachPoint } from "@/lib/reach-series";
import type { Media, User } from "@/lib/schema";

type OwnerChromeProps = {
  user: User;
  posts: Media[];
  onPostsChange?: (posts: Media[] | ((current: Media[]) => Media[])) => void;
  engagementRate: number | null;
  typicalReach: number | null;
  typicalSaves: number | null;
  reachSeries?: ReachPoint[] | null;
  hasInsights: boolean;
  audience?: KitAudience | null;
  gridReady: boolean;
  retrieving?: boolean;
};

function formatRefreshedAt(iso: string | null): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function OwnerChrome({
  user,
  posts,
  onPostsChange,
  engagementRate,
  typicalReach,
  typicalSaves,
  reachSeries,
  hasInsights,
  audience,
  gridReady,
  retrieving: retrievingProp = false,
}: OwnerChromeProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const retrieving = retrievingProp || refreshing;
  const refreshed = formatRefreshedAt(inventoryLastUpdated(posts));
  const mixes = resolveOwnerAudience(audience);

  if (!gridReady) {
    return (
      <>
        <InsightsLoading onShare={() => void copyShareKitLink(user.handle, { onCopyFailed: setNotice })} />
        <OwnerAccountActions notice={notice} />
      </>
    );
  }

  return (
    <>
      <section className={PATTERN_HEADER_SECTION_CLASS}>
        <PageHeader
          variant="page"
          title="Insights"
          end={
            <span className="flex flex-wrap items-center gap-2">
              <form action="/insights" method="get" onSubmit={() => setRefreshing(true)}>
                <input type="hidden" name="refresh" value="1" />
                <Button type="submit" role="secondary" size="sm">
                  Refresh
                </Button>
              </form>
              <ShareKitButton handle={user.handle} onCopyFailed={setNotice} />
            </span>
          }
        />
        <div className={PATTERN_HEADER_COPY_CLASS}>
          <p className={PATTERN_SUPPORTING_CLASS}>
            {refreshed
              ? `Verified Instagram performance, refreshed ${refreshed}. ${INSIGHTS_PRIVATE}.`
              : `${INSIGHTS_PRIVATE}.`}
          </p>
          <p className={PATTERN_FORMULA_CLASS}>
            Engagement rate = {ENGAGEMENT_FORMULA}.
          </p>
        </div>
      </section>

      <div className={PATTERN_METRICS_STACK_CLASS}>
        <InsightsStats
          followers={user.followers}
          engagementRate={engagementRate}
          typicalReach={typicalReach}
          typicalSaves={typicalSaves}
          loading={retrieving}
        />

        <div className={PATTERN_DASHBOARD_GRID_CLASS}>
          <ReachChart
            series={reachSeries}
            typicalReach={typicalReach}
            hasInsights={hasInsights}
            retrieving={retrieving}
          />
          <AudienceFit
            country={mixes.country}
            city={mixes.city}
            age={mixes.age}
            gender={mixes.gender}
            retrieving={retrieving}
          />
        </div>
      </div>

      <ProofPosts posts={posts} hasInsights={hasInsights} onPostsChange={onPostsChange} />

      <OwnerAccountActions notice={notice} />
    </>
  );
}

function OwnerAccountActions({ notice }: { notice: string | null }) {
  return (
    <>
      <div className="col-span-full flex flex-wrap gap-2">
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
        <DisconnectControl />
      </div>

      {notice ? <p className="col-span-full">{notice}</p> : null}
    </>
  );
}
