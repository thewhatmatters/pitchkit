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

/** Four-up on the 12-col owner band: 6+6 mobile (2×2), 3×4 from md. */
const KPI_TILE_SPAN = "col-span-6 md:col-span-3";

/**
 * Headline hire number is Typical reach, then a four-up Stat row.
 * Tiles are band items on the page spine — not a nested Stat.Group grid.
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
        <Stat
          size="md"
          className="col-span-full"
          label="Typical reach"
          value={typicalReach != null ? formatCount(typicalReach) : "—"}
          loading={loading}
        />
      ) : null}
      <Stat
        size="sm"
        className={KPI_TILE_SPAN}
        label="Followers"
        value={formatCount(followers)}
        loading={loading}
      />
      <Stat
        size="sm"
        className={KPI_TILE_SPAN}
        label="Engagement rate"
        value={formatEngagementRate(engagementRate)}
        loading={loading}
      />
      {showInsightsMetrics ? (
        <Stat
          size="sm"
          className={KPI_TILE_SPAN}
          label="Typical reach"
          value={typicalReach != null ? formatCount(typicalReach) : "—"}
          loading={loading}
        />
      ) : null}
      {showInsightsMetrics ? (
        <Stat
          size="sm"
          className={KPI_TILE_SPAN}
          label="Saves"
          value={typicalSaves != null ? formatCount(typicalSaves) : "—"}
          loading={loading}
        />
      ) : null}
    </>
  );
}
