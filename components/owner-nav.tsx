"use client";

import { useState } from "react";
import {
  AccountSettingsAvatarButton,
  AccountSettingsDialog,
} from "@/components/account-settings";
import { SegmentedControl } from "@/components/wmds";
import {
  PATTERN_BRAND_CLASS,
  PATTERN_TOPBAR_CLASS,
  PATTERN_TOPBAR_END_CLASS,
} from "@/components/pattern-tokens";
import { creatorIdentityFromUser } from "@/lib/creator-identity";
import { inventoryLastUpdated } from "@/lib/inventory";
import type { Media, User } from "@/lib/schema";

export type OwnerView = "insights" | "pitchkit";

type OwnerNavProps = {
  user: User;
  posts: Media[];
  view: OwnerView;
  onViewChange: (view: OwnerView) => void;
};

/** WMDS Pattern — creator Insights three-column header. Hug control. In-page view. */
export function OwnerNav({ user, posts, view, onViewChange }: OwnerNavProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const identity = creatorIdentityFromUser(user, {
    lastSyncedAt: inventoryLastUpdated(posts),
  });

  return (
    <>
      <header className={PATTERN_TOPBAR_CLASS}>
        <span className={PATTERN_BRAND_CLASS}>PitchKit</span>
        <SegmentedControl
          aria-label="PitchKit primary navigation"
          size="sm"
          value={view}
          onValueChange={(value) => {
            if (value === "insights" || value === "pitchkit") {
              onViewChange(value);
            }
          }}
        >
          <SegmentedControl.Item value="insights">Insights</SegmentedControl.Item>
          <SegmentedControl.Item value="pitchkit">PitchKit</SegmentedControl.Item>
        </SegmentedControl>
        <span className={PATTERN_TOPBAR_END_CLASS}>
          <AccountSettingsAvatarButton
            identity={identity}
            open={settingsOpen}
            onClick={() => setSettingsOpen(true)}
          />
        </span>
      </header>
      <AccountSettingsDialog
        user={user}
        posts={posts}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  );
}
