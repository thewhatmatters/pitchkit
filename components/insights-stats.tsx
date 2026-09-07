"use client";

import { Stat } from "@/components/wmds";
import { formatCount, formatEngagementRate } from "@/lib/engagement";

type InsightsStatsProps = {
  followers: number;
  engagementRate: number | null;
  typicalReach: number | null;
  typicalSaves: number | null;
  loading?: boolean;
};

/**
 * Headline hire number is Typical reach, then a four-up Stat row.
 * Band items are plain `div` wrappers so col-span lives on the grid item —
 * Stat fills the cell. Full class strings in JSX (Tailwind v4 must see them).
 * Not a nested Group grid — no four-column gap layout.
 * Do not lead with Engagement rate — it lives in the four-up only.
 * No period-over-period `trend` — seed/payload has no honest deltas.
 */
export function InsightsStats({
  followers,
  engagementRate,
  typicalReach,
  typicalSaves,
  loading = false,
}: InsightsStatsProps) {
  const showInsightsMetrics = typicalReach != null || typicalSaves != null || loading;
  const showHeadline = typicalReach != null || loading;

  return (
    <>
      {showHeadline ? (
        <div className="col-span-full">
          <Stat
            size="md"
            className="w-full min-w-0"
            label="Typical reach"
            value={typicalReach != null ? formatCount(typicalReach) : "—"}
            loading={loading}
          />
        </div>
      ) : null}
      <div className="col-span-6 md:col-span-3">
        <Stat
          size="sm"
          className="w-full min-w-0"
          label="Followers"
          value={formatCount(followers)}
          loading={loading}
        />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Stat
          size="sm"
          className="w-full min-w-0"
          label="Engagement rate"
          value={formatEngagementRate(engagementRate)}
          loading={loading}
        />
      </div>
      {showInsightsMetrics ? (
        <div className="col-span-6 md:col-span-3">
          <Stat
            size="sm"
            className="w-full min-w-0"
            label="Typical reach"
            value={typicalReach != null ? formatCount(typicalReach) : "—"}
            loading={loading}
          />
        </div>
      ) : null}
      {showInsightsMetrics ? (
        <div className="col-span-6 md:col-span-3">
          <Stat
            size="sm"
            className="w-full min-w-0"
            label="Saves"
            value={typicalSaves != null ? formatCount(typicalSaves) : "—"}
            loading={loading}
          />
        </div>
      ) : null}
    </>
  );
}
