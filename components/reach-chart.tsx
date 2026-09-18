"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  PATTERN_CARD_WELL_CLASS,
  PATTERN_EMPTY_BODY_CLASS,
  PATTERN_EMPTY_COPY_CLASS,
  PATTERN_EMPTY_TITLE_CLASS,
  PATTERN_REACH_CARD_CLASS,
  PATTERN_REACH_CHART_MIN_HEIGHT,
  PATTERN_REACH_EMPTY_WELL_CLASS,
} from "@/components/pattern-tokens";
import {
  Card,
  Chart,
  cardSubtitleClasses,
  cardTitleClasses,
  chartSeriesConfigFromKeys,
} from "@/components/wmds";
import { REACH_INSUFFICIENT_BODY, REACH_INSUFFICIENT_TITLE } from "@/lib/copy";
import {
  hasTypicalReachReference,
  reachChartSurface,
  reachSeriesToChartPoints,
  shouldShowReachChart,
  type ReachPoint,
} from "@/lib/reach-series";

type ReachChartProps = {
  series?: ReachPoint[] | null;
  typicalReach?: number | null;
  hasInsights?: boolean;
  retrieving?: boolean;
};

/**
 * Canvas ReachCard. Surfaces from WMDS `55944ed`:
 * - chart — `examples-pitchkit--creator-insights`
 * - empty — `examples-pitchkit--insufficient-reach-data` (keep Card + header)
 * - omit — `examples-pitchkit--graph-data-unavailable`
 * Retrieving (chrome up / Refresh) is Header + Chart.Loading, not Skeleton.
 */
export function ReachChart({
  series,
  typicalReach = null,
  hasInsights = false,
  retrieving = false,
}: ReachChartProps) {
  const surface = reachChartSurface(series, hasInsights);

  if (surface === "omit") {
    return null;
  }

  if (retrieving) {
    return (
      <ReachChartCard slot="retrieving" label="Retrieving reach over 30 days">
        <div className={PATTERN_CARD_WELL_CLASS}>
          <Chart.Loading
            label="Retrieving 30-day account reach"
            minHeight={PATTERN_REACH_CHART_MIN_HEIGHT}
          />
        </div>
      </ReachChartCard>
    );
  }

  if (surface === "empty") {
    return (
      <ReachChartCard slot="empty">
        <div
          className={PATTERN_REACH_EMPTY_WELL_CLASS}
          style={{ minHeight: PATTERN_REACH_CHART_MIN_HEIGHT } satisfies CSSProperties}
        >
          <div className={PATTERN_EMPTY_COPY_CLASS}>
            <h3 className={PATTERN_EMPTY_TITLE_CLASS}>{REACH_INSUFFICIENT_TITLE}</h3>
            <p className={PATTERN_EMPTY_BODY_CLASS}>{REACH_INSUFFICIENT_BODY}</p>
          </div>
        </div>
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
  label,
  children,
}: {
  slot: "retrieving" | "empty" | "reach";
  label?: string;
  children: ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      shape="rounded"
      bodyTerminal
      className={PATTERN_REACH_CARD_CLASS}
      data-chart-slot={slot}
      aria-busy={slot === "retrieving" || undefined}
      aria-label={label}
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
      <Card.Body>{children}</Card.Body>
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
      <div className={PATTERN_CARD_WELL_CLASS}>
        <Chart.Cartesian
          data={data}
          config={config}
          periodKind="month"
          minHeight={PATTERN_REACH_CHART_MIN_HEIGHT}
          animate="none"
          aria-label="30-day account reach"
        />
        <Chart.Legend config={config} />
      </div>
    </ReachChartCard>
  );
}
