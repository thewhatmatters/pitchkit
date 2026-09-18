"use client";

import { Avatar, SegmentedControl } from "@/components/wmds";
import {
  PATTERN_BRAND_CLASS,
  PATTERN_TOPBAR_CLASS,
  PATTERN_TOPBAR_END_CLASS,
} from "@/components/pattern-tokens";

export type OwnerView = "insights" | "pitchkit";

type OwnerNavProps = {
  name: string;
  view: OwnerView;
  onViewChange: (view: OwnerView) => void;
};

/** WMDS Pattern — creator Insights three-column header. Hug control. In-page view. */
export function OwnerNav({ name, view, onViewChange }: OwnerNavProps) {
  return (
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
        <Avatar name={name} size="sm" />
      </span>
    </header>
  );
}
