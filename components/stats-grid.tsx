import { Card, cardBodyTextClasses, cardTitleClasses } from "@whatmatters/wmds";
import { formatCount, formatEngagementRate } from "@/lib/engagement";

type StatsGridProps = {
  followers: number;
  mediaCount: number;
  engagementRate: number | null;
  reach: number | null;
  saves: number | null;
  hasInsights: boolean;
};

export function StatsGrid({
  followers,
  mediaCount,
  engagementRate,
  reach,
  saves,
  hasInsights,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Followers" value={formatCount(followers)} />
      <StatCard label="Posts" value={formatCount(mediaCount)} />
      <StatCard label="Engagement" value={formatEngagementRate(engagementRate)} />
      {hasInsights && reach != null ? (
        <StatCard label="Reach" value={formatCount(reach)} />
      ) : null}
      {hasInsights && saves != null ? (
        <StatCard label="Saves" value={formatCount(saves)} />
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined" shape="rounded" padding="md">
      <p className={cardBodyTextClasses}>{label}</p>
      <p className={cardTitleClasses}>{value}</p>
    </Card>
  );
}
