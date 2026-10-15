"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { CreatorIdentityStrip } from "@/components/creator-identity-strip";
import { PublicIntro } from "@/components/kit-intro";
import { PublicPastBrands } from "@/components/past-brands";
import {
  PATTERN_CALLOUT_ACTIONS_CLASS,
  PATTERN_CALLOUT_BODY_CLASS,
  PATTERN_CALLOUT_CARD_CLASS,
  PATTERN_CARD_WELL_CLASS,
  PATTERN_PUBLIC_COUNTRIES_CARD_CLASS,
  PATTERN_PUBLIC_REACH_CARD_CLASS,
  PATTERN_PUBLIC_STACK_CLASS,
  PATTERN_IDENTITY_NAMEPLATE_CLASS,
  PATTERN_INTRO_STACK_CLASS,
  PATTERN_KIT_POST_METRICS_CLASS,
  PATTERN_POST_CARD_CLASS,
  PATTERN_POST_IMAGE_CLASS,
  PATTERN_POST_METRIC_CLASS,
  PATTERN_POST_METRIC_LABEL_CLASS,
  PATTERN_POST_METRIC_VALUE_CLASS,
  PATTERN_POSTS_HEADER_CLASS,
  PATTERN_POSTS_PANEL_CLASS,
  PATTERN_POSTS_SECTION_CLASS,
  PATTERN_PUBLIC_REACH_CHART_MIN_HEIGHT,
  PATTERN_PUBLIC_STAT_CLASS,
  PATTERN_PUBLIC_POST_CARD_CLASS,
  publicStatClass,
  PATTERN_REACH_EMPTY_COPY_CLASS,
  PATTERN_EMPTY_NEXT_CLASS,
  PATTERN_STATS_BAND_CLASS,
  PATTERN_SUPPORTING_CLASS,
} from "@/components/pattern-tokens";
import {
  Badge,
  Button,
  Card,
  Chart,
  Stat,
  cardSubtitleClasses,
  cardTitleClasses,
  chartSeriesConfigFromKeys,
} from "@/components/wmds";
import { publicCountries, type RankedShare } from "@/lib/audience";
import { creatorIdentityFromUser } from "@/lib/creator-identity";
import { OwnerEmptyState } from "@/components/owner-empty-state";
import {
  FEW_POSTS_BRANDS_NOTE,
  FEW_POSTS_TARGET,
  POSTS_SYNC_NOTE,
  REACH_EMPTY_BADGE,
  REACH_EMPTY_BODY,
  REACH_EMPTY_NEXT,
  REACH_EMPTY_TITLE,
  REACH_NO_DATA_LABEL,
  fewPostsBadge,
  fewPostsProgress,
} from "@/lib/copy";
import { publicStats } from "@/lib/public-stats";
import { publicReachState } from "@/lib/kit";
import type { PastBrand } from "@/lib/kit-profile";
import {
  hasTypicalReachReference,
  reachSeriesToChartPoints,
  shouldShowReachChart,
  type ReachPoint,
} from "@/lib/reach-series";
import { publicObjectUrl } from "@/lib/r2";
import type { Media, User } from "@/lib/schema";

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export type ShareableKitProps = {
  /**
   * Public /k/<handle>: brands never see an empty section or a dash.
   * Hides empty stats, the empty reach card and a zero-post grid. Owner views keep them.
   */
  hideEmpty?: boolean;
  user: User;
  posts: Media[];
  engagementRate: number | null;
  typicalReach?: number | null;
  typicalSaves?: number | null;
  reachSeries?: ReachPoint[] | null;
  hasInsights?: boolean;
  countries?: readonly RankedShare[];
  pastBrands?: readonly PastBrand[];
  intro?: string | null;
  /**
   * Unsigned visitor who is not the kit owner.
   * Omit for the kit owner and for signed-in viewers of someone else's kit.
   */
  showCreateBand?: boolean;
  introSlot?: ReactNode;
  brandsSlot?: ReactNode;
  renderPostHeader?: (post: Media, index: number) => ReactNode;
  postNotice?: string | null;
};

function PublicCreatePitchkitBand() {
  return (
    <Card
      variant="outlined"
      shape="rounded"
      bodyTerminal
      className={PATTERN_CALLOUT_CARD_CLASS}
    >
      <Card.Header
        start={<h2 className={cardTitleClasses}>Create your Pitchkit</h2>}
      />
      <Card.Body>
        <div className={PATTERN_CALLOUT_BODY_CLASS}>
          <p className={PATTERN_SUPPORTING_CLASS}>
            Turn your Instagram into a shareable media kit.
          </p>
          <div className={PATTERN_CALLOUT_ACTIONS_CLASS}>
            <form action="/auth/instagram" method="post">
              <Button type="submit" role="primary">
                Continue with Instagram
              </Button>
            </form>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

function PublicReachCartesian(
  props: ComponentProps<typeof Chart.Cartesian> & {
    noData: { label: string };
  },
) {
  return <Chart.Cartesian {...(props as ComponentProps<typeof Chart.Cartesian>)} />;
}

function PublicReachCard({
  reachState,
  series,
  typicalReach,
}: {
  reachState: "resolved" | "insufficient";
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
  const showChart =
    reachState === "resolved" && shouldShowReachChart(series) && data.length > 0;

  return (
    <Card
      variant="outlined"
      shape="rounded"
      bodyTerminal
      className={PATTERN_PUBLIC_REACH_CARD_CLASS}
      data-chart-slot={showChart ? "reach" : "empty"}
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
        end={
          <Badge variant="neutral" emphasis="muted" size="sm">
            Graph data
          </Badge>
        }
      />
      <Card.Body>
        {showChart ? (
          <div className={PATTERN_CARD_WELL_CLASS}>
            <PublicReachCartesian
              data={data}
              config={config}
              seriesKeys={["reach"]}
              periodKind="month"
              minHeight={PATTERN_PUBLIC_REACH_CHART_MIN_HEIGHT}
              animate="none"
              noData={{ label: REACH_NO_DATA_LABEL }}
              aria-label="Daily and typical Instagram reach over the last 30 days"
            />
            <Chart.Legend config={config} />
          </div>
        ) : (
          <div
            className={`${PATTERN_CARD_WELL_CLASS} items-center justify-center text-center`}
            style={{ minHeight: PATTERN_PUBLIC_REACH_CHART_MIN_HEIGHT } satisfies CSSProperties}
          >
            <OwnerEmptyState
              className={PATTERN_REACH_EMPTY_COPY_CLASS}
              badge={REACH_EMPTY_BADGE}
              title={REACH_EMPTY_TITLE}
              body={REACH_EMPTY_BODY}
              next={REACH_EMPTY_NEXT}
            />
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function PublicCountries({
  countries,
}: {
  countries: readonly RankedShare[];
}) {
  const topCountries = publicCountries(countries);
  if (topCountries.length === 0) {
    return null;
  }

  return (
    <Card
      variant="outlined"
      shape="rounded"
      bodyTerminal
      className={PATTERN_PUBLIC_COUNTRIES_CARD_CLASS}
    >
      <Card.Header
        start={
          <>
            <h2 className={cardTitleClasses}>Top countries</h2>
            <p className={cardSubtitleClasses}>Top 3 from Instagram Insights.</p>
          </>
        }
      />
      <Card.Body>
        <div className={PATTERN_CARD_WELL_CLASS}>
          <Chart.RankedBars
            aria-label="Audience by country"
            items={topCountries}
            animate="initial"
          />
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Pattern — shareable PitchKit Show code (`examples-pitchkit--shareable-pitch-kit`)
 * plus State — shareable insufficient reach (`examples-pitchkit--shareable-insufficient-reach`)
 * plus Pattern — creator identity (public) (`examples-pitchkit--creator-identity-public`)
 * plus Pattern — intro (public) (`examples-pitchkit--intro-public`)
 * plus Pattern — past brands (public) (`examples-pitchkit--past-brands-public`).
 * 4 Graph KPIs, compact 30-day reach, top 3 countries. No owner management.
 * `showCreateBand` is the unsigned anon CTA.
 */
export function ShareableKit({
  user,
  posts,
  engagementRate,
  typicalReach = null,
  typicalSaves = null,
  reachSeries = null,
  hasInsights = false,
  countries = [],
  pastBrands = [],
  intro = null,
  showCreateBand = false,
  introSlot,
  brandsSlot,
  renderPostHeader,
  postNotice = null,
  hideEmpty = false,
}: ShareableKitProps) {
  const identity = creatorIdentityFromUser(user);
  const reachState = publicReachState(hasInsights, reachSeries);
  const shownEngagement = reachState === "resolved" ? engagementRate : null;
  const shownTypicalReach = reachState === "resolved" ? typicalReach : null;
  const stats = publicStats({
    followers: user.followers,
    engagement: shownEngagement,
    typicalReach: shownTypicalReach,
    typicalSaves,
    hideEmpty,
  });
  const reachHasChart = reachState === "resolved" && shouldShowReachChart(reachSeries);
  const showReach = !hideEmpty || reachHasChart;
  const showStack = showReach || publicCountries(countries).length > 0;
  const showPosts = !hideEmpty || posts.length > 0;
  /** Owner only: fewer than 4 posts gets a count and the real sync timing. */
  const fewPosts = !hideEmpty && posts.length < FEW_POSTS_TARGET;

  return (
    <>
      <section className={PATTERN_IDENTITY_NAMEPLATE_CLASS}>
        <div className={PATTERN_INTRO_STACK_CLASS}>
          <CreatorIdentityStrip identity={identity} nameAs="h1" showProfessionalChip />
          {introSlot ?? <PublicIntro intro={intro} />}
        </div>
      </section>

      <div
        role="group"
        aria-label="Instagram performance summary"
        className={PATTERN_STATS_BAND_CLASS}
      >
        {stats.map((stat, index) => (
          <Stat
            key={stat.label}
            className={hideEmpty ? publicStatClass(index, stats.length) : PATTERN_PUBLIC_STAT_CLASS}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      {showStack ? (
        <div className={PATTERN_PUBLIC_STACK_CLASS}>
          {showReach ? (
            <PublicReachCard
              reachState={reachState}
              series={reachSeries}
              typicalReach={shownTypicalReach}
            />
          ) : null}
          <PublicCountries countries={countries} />
        </div>
      ) : null}

      {showPosts ? (
        <section className={PATTERN_POSTS_SECTION_CLASS}>
          <div className={PATTERN_POSTS_HEADER_CLASS}>
            <div>
              <h2 className={cardTitleClasses}>Selected posts</h2>
              <p className={PATTERN_SUPPORTING_CLASS}>
                {postNotice ??
                  (fewPosts
                    ? `${fewPostsProgress(posts.length)} ${FEW_POSTS_BRANDS_NOTE}`
                    : "Proof from the current Instagram set.")}
              </p>
              {fewPosts ? (
                <p className={PATTERN_EMPTY_NEXT_CLASS}>{POSTS_SYNC_NOTE}</p>
              ) : null}
            </div>
            {fewPosts ? (
              <Badge variant="neutral" emphasis="muted" size="sm">
                {fewPostsBadge(posts.length)}
              </Badge>
            ) : null}
          </div>
          <div className={PATTERN_POSTS_PANEL_CLASS}>
            {posts.map((post, index) => (
              <Card
                key={post.id}
                variant="outlined"
                shape="rounded"
                className={hideEmpty ? PATTERN_PUBLIC_POST_CARD_CLASS : PATTERN_POST_CARD_CLASS}
              >
                {renderPostHeader ? renderPostHeader(post, index) : null}
                <Card.Body>
                  <img
                    className={PATTERN_POST_IMAGE_CLASS}
                    src={publicObjectUrl(post.r2_key)}
                    alt=""
                  />
                </Card.Body>
                <Card.Footer>
                  <div className={PATTERN_KIT_POST_METRICS_CLASS}>
                    {(
                      [
                        ["Likes", post.like_count],
                        ["Comments", post.comments_count],
                      ] as const
                    ).map(([label, value]) => (
                      <span key={label} className={PATTERN_POST_METRIC_CLASS}>
                        <span className={PATTERN_POST_METRIC_LABEL_CLASS}>{label}</span>
                        <span className={PATTERN_POST_METRIC_VALUE_CLASS}>
                          {compactNumber.format(value)}
                        </span>
                      </span>
                    ))}
                  </div>
                </Card.Footer>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {brandsSlot ?? <PublicPastBrands brands={pastBrands} wrap={hideEmpty} />}

      {showCreateBand ? <PublicCreatePitchkitBand /> : null}
    </>
  );
}
