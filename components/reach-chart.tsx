"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Card,
  Chart,
  cardSubtitleClasses,
  cardTitleClasses,
  chartMaxTicksForWidth,
  chartSeriesConfigFromTone,
} from "@/components/wmds";
import {
  reachChartDateTickCount,
  reachSeriesToChartPoints,
  shouldRenderReachChartBand,
  shouldShowReachChart,
  type ReachPoint,
} from "@/lib/reach-series";

/** Matches WMDS Chart.Cartesian default host height. */
const REACH_CHART_MIN_HEIGHT = 240;

type ReachChartProps = {
  series?: ReachPoint[] | null;
  loading?: boolean;
};

/**
 * One Insights Chart. Hide the whole band (title + slot) when series is
 * omitted/empty or the plot host has no width — never a header-only 240px box.
 * WMDS Chart.Cartesian uses visx ParentSize (0×0 until laid out) and
 * `animate="initial"` starts the area at opacity 0 / pathLength 0. We wait for
 * a real width and pass `animate="none"` so the area stroke/fill paint.
 */
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

  return <ReachChartBand series={series} />;
}

function ReachChartBand({ series }: { series?: ReachPoint[] | null }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(0);
  const data = reachSeriesToChartPoints(series);

  useLayoutEffect(() => {
    const node = hostRef.current;
    if (!node || data.length === 0) {
      setHostWidth(0);
      return;
    }

    const sync = () => {
      setHostWidth(node.clientWidth);
    };

    sync();
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, [data.length]);

  if (data.length === 0) {
    return null;
  }

  const canPaint = shouldRenderReachChartBand(series, hostWidth);
  const xTickCount = reachChartDateTickCount(hostWidth, (width, spec) =>
    chartMaxTicksForWidth(width, spec as never),
  );

  return (
    <div ref={hostRef} className="w-full min-w-0">
      {canPaint ? (
        <Card
          padding="none"
          bodyTerminal
          data-chart-slot="reach"
          data-x-ticks={xTickCount}
        >
          <Card.Header
            start={<h2 className={cardTitleClasses}>Reach over time</h2>}
            end={<span className={cardSubtitleClasses}>30 days</span>}
          />
          <Card.Body>
            <div
              className="w-full min-w-0"
              style={{ width: hostWidth, height: REACH_CHART_MIN_HEIGHT }}
            >
              {/*
                xTickCount from chartMaxTicksForWidth (~3 on phone).
                WMDS AxisBottom at 266f19c still hardcodes 6 — data-x-ticks is the intended budget.
              */}
              <Chart.Cartesian
                data={data}
                config={chartSeriesConfigFromTone("reach", "Reach", "primary")}
                seriesKeys={["reach"]}
                variant="hero"
                minHeight={REACH_CHART_MIN_HEIGHT}
                periodKind="month"
                animate="none"
                verticalGrid={false}
                xAccessor={(point) => point.date}
                yAccessor={(point, key) => {
                  const value = point[key];
                  return typeof value === "number" && Number.isFinite(value) ? value : 0;
                }}
                aria-label="30-day account reach"
              >
                <Chart.Cartesian.Grid />
                <Chart.Cartesian.AxisLeft />
                <Chart.Cartesian.AxisBottom />
                <Chart.Cartesian.Area />
              </Chart.Cartesian>
            </div>
          </Card.Body>
        </Card>
      ) : null}
    </div>
  );
}
