"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { AudienceFit } from "@/components/audience-fit";
import { Button, PageHeader, toast } from "@/components/wmds";
import { InsightsStats } from "@/components/insights-stats";
import { ProofPosts } from "@/components/proof-posts";
import { ReachChart } from "@/components/reach-chart";
import { SEED_AUDIENCE } from "@/lib/audience";
import { INSIGHTS_PRIVATE, STUB_DISCONNECT } from "@/lib/copy";
import {
  EXAMPLE_AGE_MIX,
  EXAMPLE_CITY_MIX,
  EXAMPLE_COUNTRY_MIX,
  EXAMPLE_GENDER_MIX,
  inventoryLastUpdated,
} from "@/lib/inventory";
import { kitPath } from "@/lib/kit";
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
  engagementRate,
  typicalReach,
  typicalSaves,
  reachSeries,
  hasInsights,
  gridReady,
}: OwnerChromeProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const refreshed = formatRefreshedAt(inventoryLastUpdated(posts));
  const audience = hasInsights
    ? {
        country: EXAMPLE_COUNTRY_MIX,
        city: EXAMPLE_CITY_MIX,
        age: EXAMPLE_AGE_MIX,
        gender: EXAMPLE_GENDER_MIX,
      }
    : SEED_AUDIENCE;

  async function copyKitLink() {
    const url = `${window.location.origin}${kitPath(user.handle)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.add({ title: "Kit link copied" });
    } catch {
      setNotice(url);
    }
  }

  return (
    <div className="band col-span-full min-w-0 gap-y-6 sm:gap-y-8">
      <section className="col-span-full">
        <PageHeader
          variant="page"
          title="Insights"
          end={
            <Button role="secondary" size="sm" icon={<Share2 />} onClick={() => void copyKitLink()}>
              Share kit
            </Button>
          }
        />
        <div className="flex max-w-2xl flex-col gap-1">
          <p className="text-muted">
            {refreshed
              ? `Verified Instagram performance, refreshed ${refreshed}. ${INSIGHTS_PRIVATE}.`
              : `${INSIGHTS_PRIVATE}.`}
          </p>
          <p className="text-muted">Engagement rate = (likes + comments) ÷ followers.</p>
        </div>
      </section>

      <div className="band col-span-full min-w-0 gap-y-2">
        <InsightsStats
          followers={user.followers}
          engagementRate={engagementRate}
          typicalReach={typicalReach}
          typicalSaves={typicalSaves}
          loading={!gridReady}
        />

        <div className="band col-span-full min-w-0 gap-y-6 [align-items:stretch]">
          <ReachChart series={reachSeries} loading={!gridReady} />
          <AudienceFit
            country={audience.country}
            city={audience.city}
            age={audience.age}
            gender={audience.gender}
          />
        </div>
      </div>

      <ProofPosts handle={user.handle} posts={posts} hasInsights={hasInsights} loading={!gridReady} />

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
        <Button role="destructive" onClick={() => setNotice(STUB_DISCONNECT)}>
          Disconnect
        </Button>
      </div>

      {notice ? <p className="col-span-full">{notice}</p> : null}
    </div>
  );
}
