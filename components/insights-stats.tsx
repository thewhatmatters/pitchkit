"use client";

import { PATTERN_STAT_CLASS, PATTERN_STATS_BAND_CLASS } from "@/components/pattern-tokens";
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
 * WMDS PitchKit creator Insights four-up on the page subgrid.
 * Spans match Examples/PitchKit: `col-span-2 md:col-span-4 lg:col-span-3`.
 * Do not lead with Engagement rate. Spell **Engagement rate** — never “ER”.
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

  return (
    <div
      role="group"
      aria-label="Instagram performance summary"
      className={PATTERN_STATS_BAND_CLASS}
    >
      <Stat
        className={PATTERN_STAT_CLASS}
        label="Followers"
        value={formatCount(followers)}
        loading={loading}
      />
      <Stat
        className={PATTERN_STAT_CLASS}
        label="Engagement rate"
        value={formatEngagementRate(engagementRate)}
        loading={loading}
      />
      {showInsightsMetrics ? (
        <Stat
          className={PATTERN_STAT_CLASS}
          label="Typical reach"
          value={typicalReach != null ? formatCount(typicalReach) : "—"}
          loading={loading}
        />
      ) : null}
      {showInsightsMetrics ? (
        <Stat
          className={PATTERN_STAT_CLASS}
          label="Saves"
          value={typicalSaves != null ? formatCount(typicalSaves) : "—"}
          loading={loading}
        />
      ) : null}
    </div>
  );
}
