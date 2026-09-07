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
  const columns = showInsightsMetrics ? 4 : 2;

  return (
    <div className="flex flex-col gap-4">
      {showHeadline ? (
        <Stat
          size="md"
          label="Typical reach"
          value={typicalReach != null ? formatCount(typicalReach) : "—"}
          loading={loading}
        />
      ) : null}
      <Stat.Group
        aria-label="Insights metrics"
        columns={columns}
        className={showInsightsMetrics ? "md:grid-cols-4" : undefined}
      >
        <Stat size="sm" label="Followers" value={formatCount(followers)} loading={loading} />
        <Stat
          size="sm"
          label="Engagement rate"
          value={formatEngagementRate(engagementRate)}
          loading={loading}
        />
        {showInsightsMetrics ? (
          <Stat
            size="sm"
            label="Typical reach"
            value={typicalReach != null ? formatCount(typicalReach) : "—"}
            loading={loading}
          />
        ) : null}
        {showInsightsMetrics ? (
          <Stat
            size="sm"
            label="Saves"
            value={typicalSaves != null ? formatCount(typicalSaves) : "—"}
            loading={loading}
          />
        ) : null}
      </Stat.Group>
    </div>
  );
}
