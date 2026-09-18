"use client";

import { Share2 } from "lucide-react";
import {
  PATTERN_AUDIENCE_CARD_CLASS,
  PATTERN_AUDIENCE_SKELETON_BARS_CLASS,
  PATTERN_AUDIENCE_SKELETON_SECTION_CLASS,
  PATTERN_AUDIENCE_WELL_CLASS,
  PATTERN_CARD_WELL_CLASS,
  PATTERN_DASHBOARD_GRID_CLASS,
  PATTERN_HEADER_SECTION_CLASS,
  PATTERN_HEADER_SKELETON_COPY_CLASS,
  PATTERN_HEADER_SKELETON_STACK_CLASS,
  PATTERN_METRICS_STACK_CLASS,
  PATTERN_POST_CARD_CLASS,
  PATTERN_POST_HEADER_START_CLASS,
  PATTERN_POST_IMAGE_CLASS,
  PATTERN_POST_METRIC_CLASS,
  PATTERN_POST_METRICS_CLASS,
  PATTERN_POSTS_HEADER_CLASS,
  PATTERN_POSTS_PANEL_CLASS,
  PATTERN_POSTS_SECTION_CLASS,
  PATTERN_REACH_CARD_CLASS,
  PATTERN_REACH_CHART_MIN_HEIGHT,
  PATTERN_SKELETON_LEGEND_ROW_CLASS,
  PATTERN_STAT_CLASS,
  PATTERN_STATS_BAND_CLASS,
} from "@/components/pattern-tokens";
import { Button, Card, PageHeader, Skeleton, Stat } from "@/components/wmds";

const proofSkeletonCount = 6;
const audienceSkeletonSections = [
  { titleWidth: 72, bars: [100, 82, 64] },
  { titleWidth: 56, bars: [92, 74, 58] },
  { titleWidth: 40, bars: [88, 70, 52] },
  { titleWidth: 60, bars: [96, 68, 44] },
] as const;

type InsightsLoadingProps = {
  onShare: () => void;
};

/**
 * Pattern — creator Insights (loading) Show code
 * (`examples-pitchkit--creator-insights-loading`).
 * First Graph connect / `?grid=pulling` page freeze — Skeleton wells, not retrieving.
 * Do not mount a second toast host here.
 */
export function InsightsLoading({ onShare }: InsightsLoadingProps) {
  return (
    <>
      <section className={PATTERN_HEADER_SECTION_CLASS}>
        <PageHeader
          variant="page"
          title="Insights"
          end={
            <span className="flex flex-wrap items-center gap-2">
              <form action="/insights" method="get">
                <input type="hidden" name="refresh" value="1" />
                <Button type="submit" role="secondary" size="sm">
                  Refresh
                </Button>
              </form>
              <Button role="secondary" size="sm" icon={<Share2 />} onClick={onShare}>
                Share kit
              </Button>
            </span>
          }
        />
        <div className={PATTERN_HEADER_SKELETON_COPY_CLASS}>
          <Skeleton width={280} height={16} radius="inner" index={20} />
          <Skeleton width={220} height={12} radius="inner" index={21} />
        </div>
      </section>

      <div className={PATTERN_METRICS_STACK_CLASS}>
        <div
          role="group"
          aria-label="Loading Instagram performance summary"
          className={PATTERN_STATS_BAND_CLASS}
        >
          <Stat className={PATTERN_STAT_CLASS} label="Followers" value="" loading />
          <Stat className={PATTERN_STAT_CLASS} label="Engagement rate" value="" loading />
          <Stat className={PATTERN_STAT_CLASS} label="Typical reach" value="" loading />
          <Stat className={PATTERN_STAT_CLASS} label="Saves" value="" loading />
        </div>

        <div className={PATTERN_DASHBOARD_GRID_CLASS}>
          <Card
            variant="outlined"
            shape="rounded"
            bodyTerminal
            className={PATTERN_REACH_CARD_CLASS}
            aria-busy="true"
            aria-label="Loading reach over 30 days"
            data-chart-slot="loading"
          >
            <Card.Header
              start={
                <div className={PATTERN_HEADER_SKELETON_STACK_CLASS}>
                  <Skeleton width={168} height={18} radius="inner" index={0} />
                  <Skeleton width={240} height={14} radius="inner" index={1} />
                </div>
              }
              end={<Skeleton width={88} height={28} radius="full" index={2} />}
            />
            <Card.Body>
              <div className={PATTERN_CARD_WELL_CLASS}>
                <Skeleton
                  width="100%"
                  height={PATTERN_REACH_CHART_MIN_HEIGHT}
                  radius="element"
                  index={3}
                />
                <div className={PATTERN_SKELETON_LEGEND_ROW_CLASS}>
                  <Skeleton width={112} height={12} radius="inner" index={4} />
                  <Skeleton width={96} height={12} radius="inner" index={5} />
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card
            variant="outlined"
            shape="rounded"
            bodyTerminal
            className={PATTERN_AUDIENCE_CARD_CLASS}
            aria-busy="true"
            aria-label="Loading audience fit"
          >
            <Card.Header
              start={
                <div className={PATTERN_HEADER_SKELETON_STACK_CLASS}>
                  <Skeleton width={120} height={18} radius="inner" index={6} />
                  <Skeleton width={188} height={14} radius="inner" index={7} />
                </div>
              }
            />
            <Card.Body>
              <div className={PATTERN_AUDIENCE_WELL_CLASS}>
                {audienceSkeletonSections.map((section, sectionIndex) => (
                  <section
                    key={section.titleWidth}
                    className={PATTERN_AUDIENCE_SKELETON_SECTION_CLASS}
                  >
                    <Skeleton
                      width={section.titleWidth}
                      height={12}
                      radius="inner"
                      index={8 + sectionIndex}
                    />
                    <div className={PATTERN_AUDIENCE_SKELETON_BARS_CLASS}>
                      {section.bars.map((width, barIndex) => (
                        <Skeleton
                          key={`${section.titleWidth}-${width}`}
                          width={`${width}%`}
                          height={16}
                          radius="inner"
                          index={12 + sectionIndex * 3 + barIndex}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <section
        className={PATTERN_POSTS_SECTION_CLASS}
        aria-busy="true"
        aria-label="Loading recent proof"
      >
        <div className={PATTERN_POSTS_HEADER_CLASS}>
          <div className={PATTERN_HEADER_SKELETON_COPY_CLASS}>
            <Skeleton width={132} height={18} radius="inner" index={22} />
            <Skeleton width={196} height={14} radius="inner" index={23} />
          </div>
        </div>
        <div className={PATTERN_POSTS_PANEL_CLASS}>
          {Array.from({ length: proofSkeletonCount }, (_, index) => {
            const base = 24 + index * 8;
            return (
              <Card
                key={index}
                variant="outlined"
                shape="rounded"
                className={PATTERN_POST_CARD_CLASS}
                aria-hidden
              >
                <Card.Header
                  start={
                    <span className={PATTERN_POST_HEADER_START_CLASS}>
                      <Skeleton width={28} height={20} radius="full" index={base} />
                      <Skeleton width={48} height={14} radius="inner" index={base + 1} />
                    </span>
                  }
                />
                <Card.Body>
                  <div className={PATTERN_POST_IMAGE_CLASS}>
                    <Skeleton
                      width="100%"
                      height="100%"
                      radius="element"
                      className="h-full w-full"
                      index={base + 2}
                    />
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className={PATTERN_POST_METRICS_CLASS}>
                    {[0, 1, 2].map((metric) => (
                      <span key={metric} className={PATTERN_POST_METRIC_CLASS}>
                        <Skeleton
                          width={40}
                          height={10}
                          radius="inner"
                          index={base + 3 + metric}
                        />
                        <Skeleton
                          width={56}
                          height={16}
                          radius="inner"
                          index={base + 6 + metric}
                        />
                      </span>
                    ))}
                  </div>
                </Card.Footer>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
