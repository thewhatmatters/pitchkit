"use client";

import { AccountMenu } from "@/components/account-settings";
import { SegmentedControl } from "@/components/wmds";
import {
  PATTERN_BRAND_CLASS,
  PATTERN_TOPBAR_CLASS,
  PATTERN_TOPBAR_END_CLASS,
} from "@/components/pattern-tokens";
import type { Media, User } from "@/lib/schema";

export type OwnerView = "insights" | "pitchkit";

type OwnerNavProps = {
  user: User;
  posts: Media[];
  view: OwnerView;
  onViewChange: (view: OwnerView) => void;
  defaultMenuOpen?: boolean;
};

/** WMDS Pattern — creator Insights three-column header. Hug control. In-page view. */
export function OwnerNav({ user, posts, view, onViewChange, defaultMenuOpen = false }: OwnerNavProps) {
  return (
    <header className={PATTERN_TOPBAR_CLASS}>
      <span className={PATTERN_BRAND_CLASS}>Pitchkit</span>
      <SegmentedControl
        aria-label="Pitchkit primary navigation"
        size="sm"
        value={view}
        onValueChange={(value) => {
          if (value === "insights" || value === "pitchkit") {
            onViewChange(value);
          }
        }}
      >
        <SegmentedControl.Item value="insights">Insights</SegmentedControl.Item>
        <SegmentedControl.Item value="pitchkit">Pitchkit</SegmentedControl.Item>
      </SegmentedControl>
      <span className={PATTERN_TOPBAR_END_CLASS}>
        <AccountMenu user={user} posts={posts} defaultMenuOpen={defaultMenuOpen} />
      </span>
    </header>
  );
}
