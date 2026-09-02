"use client";

import { useState } from "react";
import { Button } from "@/components/wmds";
import { Copy, Share } from "lucide-react";
import { ChartSlot } from "@/components/chart-slot";
import { EmptyGrid } from "@/components/empty-grid";
import { KitCard } from "@/components/kit-card";
import { KitInventory } from "@/components/kit-inventory";
import { PostGrid } from "@/components/post-grid";
import { StatsGrid } from "@/components/stats-grid";
import { STUB_DISCONNECT } from "@/lib/copy";
import { kitPath } from "@/lib/kit";
import type { Media, User } from "@/lib/schema";

type OwnerChromeProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  hasInsights: boolean;
  gridReady: boolean;
  initialTab?: "insights" | "kit";
};

export function OwnerChrome({
  user,
  posts,
  engagementRate,
  hasInsights,
  gridReady,
  initialTab = "insights",
}: OwnerChromeProps) {
  const [tab, setTab] = useState<"insights" | "kit">(initialTab);
  const [notice, setNotice] = useState<string | null>(null);

  const kitHref = kitPath(user.handle);

  function showDisconnectStub() {
    setNotice(STUB_DISCONNECT);
  }

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
      <div className="flex flex-wrap gap-2">
        <Button
          role={tab === "insights" ? "primary" : "secondary"}
          onClick={() => setTab("insights")}
        >
          Insights
        </Button>
        <Button
          role={tab === "kit" ? "primary" : "secondary"}
          onClick={() => setTab("kit")}
        >
          Media kit
        </Button>
      </div>

      {tab === "insights" ? (
        <div className="flex flex-col gap-6">
          <StatsGrid
            followers={user.followers}
            mediaCount={user.media_count}
            engagementRate={engagementRate}
            reach={null}
            saves={null}
            hasInsights={hasInsights}
          />
          <ChartSlot hasInsights={hasInsights} />
          {gridReady ? (
            <PostGrid posts={posts} hasInsights={hasInsights} />
          ) : (
            <EmptyGrid />
          )}
          <KitInventory user={user} posts={posts} engagementRate={engagementRate} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
          <p>
            Public kit: <a href={kitHref}>{kitHref}</a>
          </p>
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
        <Button role="destructive" onClick={showDisconnectStub}>
          Disconnect
        </Button>
      </div>

      {notice ? <p>{notice}</p> : null}
    </div>
  );
}
