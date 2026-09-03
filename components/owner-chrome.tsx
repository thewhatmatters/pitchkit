"use client";

import { useState } from "react";
import { Button, Chip } from "@/components/wmds";
import { Copy, Share } from "lucide-react";
import { KitInventory } from "@/components/kit-inventory";
import { STUB_DISCONNECT } from "@/lib/copy";
import { EXAMPLE_DATA_NOTE } from "@/lib/inventory";
import { kitPath } from "@/lib/kit";
import type { Media, User } from "@/lib/schema";

type OwnerChromeProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  gridReady: boolean;
};

export function OwnerChrome({
  user,
  posts,
  engagementRate,
  gridReady,
}: OwnerChromeProps) {
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
      <div data-inventory-banner="page">
        <Chip readOnly size="sm">{EXAMPLE_DATA_NOTE}</Chip>
      </div>

      <KitInventory
        user={user}
        posts={posts}
        engagementRate={engagementRate}
        gridReady={gridReady}
      />

      <div className="flex flex-wrap gap-2">
        <Button icon={<Copy strokeWidth={2} />} role="secondary" onClick={copyLink}>
          Copy link
        </Button>
        <Button icon={<Share strokeWidth={2} />} role="secondary" onClick={shareLink}>
          Share
        </Button>
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
