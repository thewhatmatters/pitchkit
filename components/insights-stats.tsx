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

export function InsightsStats({
  followers,
  engagementRate,
  typicalReach,
  typicalSaves,
  loading = false,
}: InsightsStatsProps) {
  const columns = typicalReach != null || typicalSaves != null ? 4 : 2;

  return (
    <Stat.Group aria-label="Insights metrics" columns={columns} className="gap-2">
      <Stat label="Followers" value={formatCount(followers)} loading={loading} />
      <Stat label="ER" value={formatEngagementRate(engagementRate)} loading={loading} />
      {typicalReach != null || loading ? (
        <Stat
          label="Typical reach"
          value={typicalReach != null ? formatCount(typicalReach) : "—"}
          loading={loading}
        />
      ) : null}
      {typicalSaves != null || loading ? (
        <Stat
          label="Saves"
          value={typicalSaves != null ? formatCount(typicalSaves) : "—"}
          loading={loading}
        />
      ) : null}
    </Stat.Group>
  );
}
