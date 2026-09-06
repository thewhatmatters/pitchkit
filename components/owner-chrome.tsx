"use client";

import { useState } from "react";
import { Copy, Share } from "lucide-react";
import { AudienceList } from "@/components/audience-list";
import { Button, Card, Tab, cardTitleClasses } from "@/components/wmds";
import { InsightsStats } from "@/components/insights-stats";
import { KitCard } from "@/components/kit-card";
import { PostGrid } from "@/components/post-grid";
import { ReachChart } from "@/components/reach-chart";
import { SEED_AUDIENCE } from "@/lib/audience";
import { STUB_DISCONNECT } from "@/lib/copy";
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
  const [tab, setTab] = useState("insights");
  const [notice, setNotice] = useState<string | null>(null);
  const kitHref = kitPath(user.handle);

  async function copyLink() {
    const url = `${window.location.origin}${kitHref}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice(`Copied ${url}`);
    } catch {
      setNotice(url);
    }
  }

  async function shareLink() {
    const url = `${window.location.origin}${kitHref}`;
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "Pitchkit" });
        return;
      } catch {
        // Fall through to copy if share is cancelled or unavailable.
      }
    }
    await copyLink();
  }

  return (
    <div className="flex flex-col gap-6">
      <Tab.Group aria-label="Owner views" value={tab} onValueChange={setTab}>
        <Tab value="insights" panelId="owner-insights">
          Insights
        </Tab>
        <Tab value="kit" panelId="owner-kit">
          Media kit
        </Tab>
      </Tab.Group>

      {tab === "insights" ? (
        <div id="owner-insights" className="flex flex-col gap-6" role="tabpanel">
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
              <h2 className={cardTitleClasses}>Six posts</h2>
            </Card.Header>
            <Card.Body>
              <div className="p-3">
                <PostGrid posts={posts} hasInsights={hasInsights} loading={!gridReady} />
              </div>
            </Card.Body>
          </Card>
          <AudienceList title="Country mix" rows={SEED_AUDIENCE.country} />
          <AudienceList title="City mix" rows={SEED_AUDIENCE.city} />
          <AudienceList title="Age mix" rows={SEED_AUDIENCE.age} />
          <AudienceList title="Gender mix" rows={SEED_AUDIENCE.gender} />
        </div>
      ) : (
        <div id="owner-kit" className="flex flex-col gap-4" role="tabpanel">
          <KitCard
            user={user}
            posts={posts}
            engagementRate={engagementRate}
            hasInsights={hasInsights}
          />
          <div className="flex flex-wrap gap-2">
            <Button icon={<Copy strokeWidth={2} />} role="secondary" onClick={copyLink}>
              Copy link
            </Button>
            <Button icon={<Share strokeWidth={2} />} role="secondary" onClick={shareLink}>
              Share
            </Button>
          </div>
        </div>
      )}

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
