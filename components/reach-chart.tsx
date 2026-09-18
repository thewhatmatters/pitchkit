"use client";

import type { ReactNode } from "react";
import {
  Card,
  Chart,
  cardLayoutBodyOccupantRadiusClasses,
  cardSubtitleClasses,
  cardTitleClasses,
  chartSeriesConfigFromKeys,
} from "@/components/wmds";
import {
  hasTypicalReachReference,
  reachSeriesToChartPoints,
  shouldShowReachChart,
  type ReachPoint,
} from "@/lib/reach-series";

/** Canvas ReachCard `minHeight` — fills the stretched dashboard well. */
const REACH_CHART_MIN_HEIGHT = 344;

/** Canvas `pitchKitCardWellClasses`. */
const reachChartOccupantWellClasses = `flex min-w-0 flex-col gap-4 bg-body px-3.5 py-4 ${cardLayoutBodyOccupantRadiusClasses}`;

type ReachChartProps = {
  series?: ReachPoint[] | null;
  typicalReach?: number | null;
  loading?: boolean;
};

/**
 * Canvas ReachCard: outlined Card, dual Cartesian (daily + typical reference),
 * Legend in the well. Hide the whole band when `reach_series` is empty.
 * Typical is the existing typicalReach median — not invented Graph days.
 */
export function ReachChart({ series, typicalReach = null, loading = false }: ReachChartProps) {
  if (loading) {
    return (
      <ReachChartCard slot="loading">
        <Chart.Loading
          label="Loading 30-day account reach"
          minHeight={REACH_CHART_MIN_HEIGHT}
        />
      </ReachChartCard>
    );
  }

  if (!shouldShowReachChart(series)) {
    return null;
  }

  return <ReachChartBand series={series} typicalReach={typicalReach} />;
}

function ReachChartCard({
  slot,
  children,
}: {
  slot: "loading" | "reach";
  children: ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      shape="rounded"
      bodyTerminal
      className="col-span-full min-w-0 lg:col-span-6"
      data-chart-slot={slot}
    >
      <Card.Header
        start={
          <>
            <h2 className={cardTitleClasses}>Reach over 30 days</h2>
            <p className={cardSubtitleClasses}>
              Typical performance with unusual spikes left visible.
            </p>
          </>
        }
        end={null}
      />
      <Card.Body>
        <div className={reachChartOccupantWellClasses}>{children}</div>
      </Card.Body>
    </Card>
  );
}

function ReachChartBand({
  series,
  typicalReach,
}: {
  series?: ReachPoint[] | null;
  typicalReach?: number | null;
}) {
  const showTypical = hasTypicalReachReference(typicalReach);
  const data = reachSeriesToChartPoints(series, typicalReach);
  const config = chartSeriesConfigFromKeys(
    showTypical
      ? [
          { key: "typical", label: "Typical reach" },
          { key: "reach", label: "Daily reach" },
        ]
      : [{ key: "reach", label: "Daily reach" }],
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <ReachChartCard slot="reach">
      <Chart.Cartesian
        data={data}
        config={config}
        periodKind="month"
        minHeight={REACH_CHART_MIN_HEIGHT}
        animate="none"
        aria-label="30-day account reach"
      />
      <Chart.Legend config={config} />
    </ReachChartCard>
  );
}
