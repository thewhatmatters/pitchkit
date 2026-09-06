"use client";

import {
  Card,
  Chart,
  cardSubtitleClasses,
  cardTitleClasses,
  chartSeriesConfigFromTone,
} from "@/components/wmds";
import {
  reachSeriesToChartPoints,
  shouldShowReachChart,
  type ReachPoint,
} from "@/lib/reach-series";

type ReachChartProps = {
  series?: ReachPoint[] | null;
  loading?: boolean;
};

export function ReachChart({ series, loading = false }: ReachChartProps) {
  if (loading) {
    return (
      <Card padding="none" bodyTerminal data-chart-slot="loading">
        <Card.Header start={<h2 className={cardTitleClasses}>Reach over time</h2>} />
        <Card.Body>
          <Chart.Loading label="Loading 30-day account reach" />
        </Card.Body>
      </Card>
    );
  }

  if (!shouldShowReachChart(series)) {
    return null;
  }

  const data = reachSeriesToChartPoints(series);

  return (
    <Card padding="none" bodyTerminal data-chart-slot="reach">
      <Card.Header
        start={<h2 className={cardTitleClasses}>Reach over time</h2>}
        end={<span className={cardSubtitleClasses}>30 days</span>}
      />
      <Card.Body>
        <Chart.Cartesian
          data={data}
          config={chartSeriesConfigFromTone("reach", "Reach", "primary")}
          seriesKeys={["reach"]}
          periodKind="month"
          verticalGrid={false}
          aria-label="30-day account reach"
        />
      </Card.Body>
    </Card>
  );
}
