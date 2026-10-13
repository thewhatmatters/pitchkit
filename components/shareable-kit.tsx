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
  PATTERN_CONTACT_CARD_CLASS,
  PATTERN_CONTACT_ROW_CLASS,
  PATTERN_CONTACT_ROWS_CLASS,
  PATTERN_PUBLIC_COUNTRIES_CARD_CLASS,
  PATTERN_PUBLIC_REACH_CARD_CLASS,
  PATTERN_PUBLIC_STACK_CLASS,
  PATTERN_EMPTY_BODY_CLASS,
  PATTERN_EMPTY_TITLE_CLASS,
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
  PATTERN_REACH_EMPTY_COPY_CLASS,
  PATTERN_SECTION_EYEBROW_CLASS,
  PATTERN_STATS_BAND_CLASS,
  PATTERN_SUPPORTING_CLASS,
} from "@/components/pattern-tokens";
import {
  Badge,
  Button,
  Card,
  Chart,
  Stat,
  TextLink,
  cardSubtitleClasses,
  cardTitleClasses,
  chartSeriesConfigFromKeys,
} from "@/components/wmds";
import { publicCountries, type RankedShare } from "@/lib/audience";
import { creatorIdentityFromUser } from "@/lib/creator-identity";
import {
  REACH_INSUFFICIENT_BODY,
  REACH_INSUFFICIENT_TITLE,
  REACH_NO_DATA_LABEL,
} from "@/lib/copy";
import { formatCount, formatEngagementRate } from "@/lib/engagement";
import { sourcedContactDetail } from "@/lib/kit-chips";
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
  contact?: string | null;
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
            <div className={PATTERN_REACH_EMPTY_COPY_CLASS}>
              <Badge variant="neutral" emphasis="muted">{REACH_NO_DATA_LABEL}</Badge>
              <h3 className={PATTERN_EMPTY_TITLE_CLASS}>{REACH_INSUFFICIENT_TITLE}</h3>
              <p className={PATTERN_EMPTY_BODY_CLASS}>{REACH_INSUFFICIENT_BODY}</p>
            </div>
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
  contact = null,
  showCreateBand = false,
  introSlot,
  brandsSlot,
  renderPostHeader,
  postNotice = null,
}: ShareableKitProps) {
  const contactDetail = sourcedContactDetail(contact);
  const identity = creatorIdentityFromUser(user);
  const reachState = publicReachState(hasInsights, reachSeries);
  const shownEngagement = reachState === "resolved" ? engagementRate : null;
  const shownTypicalReach = reachState === "resolved" ? typicalReach : null;

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
        <Stat
          className={PATTERN_PUBLIC_STAT_CLASS}
          label="Followers"
          value={formatCount(user.followers)}
        />
        {shownEngagement != null ? (
          <Stat
            className={PATTERN_PUBLIC_STAT_CLASS}
            label="Engagement rate"
            value={formatEngagementRate(shownEngagement)}
          />
        ) : null}
        <Stat
          className={PATTERN_PUBLIC_STAT_CLASS}
          label="Typical reach"
          value={shownTypicalReach != null ? formatCount(shownTypicalReach) : "—"}
        />
        <Stat
          className={PATTERN_PUBLIC_STAT_CLASS}
          label="Typical saves"
          value={typicalSaves != null ? formatCount(typicalSaves) : "—"}
        />
      </div>

      <div className={PATTERN_PUBLIC_STACK_CLASS}>
        <PublicReachCard
          reachState={reachState}
          series={reachSeries}
          typicalReach={shownTypicalReach}
        />
        <PublicCountries countries={countries} />
      </div>

      <section className={PATTERN_POSTS_SECTION_CLASS}>
        <div className={PATTERN_POSTS_HEADER_CLASS}>
          <div>
            <h2 className={cardTitleClasses}>Selected posts</h2>
            <p className={PATTERN_SUPPORTING_CLASS}>
              {postNotice ?? "Proof from the current Instagram set."}
            </p>
          </div>
        </div>
        <div className={PATTERN_POSTS_PANEL_CLASS}>
          {posts.map((post, index) => (
            <Card
              key={post.id}
              variant="outlined"
              shape="rounded"
              className={PATTERN_POST_CARD_CLASS}
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

      {contactDetail ? (
        <section className={PATTERN_POSTS_SECTION_CLASS}>
          <div className={PATTERN_POSTS_HEADER_CLASS}>
            <div>
              <h2 className={cardTitleClasses}>Contact</h2>
              <p className={PATTERN_SUPPORTING_CLASS}>
                Creator-entered details for brand outreach.
              </p>
            </div>
          </div>
          <Card
            variant="outlined"
            padding="md"
            shape="rounded"
            className={PATTERN_CONTACT_CARD_CLASS}
          >
            <div className={PATTERN_CONTACT_ROWS_CLASS}>
              {contactDetail.kind === "email" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Email</span>
                  <TextLink href={contactDetail.href}>{contactDetail.value}</TextLink>
                </div>
              ) : null}
              {contactDetail.kind === "website" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Website</span>
                  <TextLink href={contactDetail.href} external>
                    {contactDetail.value}
                  </TextLink>
                </div>
              ) : null}
              {contactDetail.kind === "text" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Contact</span>
                  <span className={PATTERN_SUPPORTING_CLASS}>{contactDetail.value}</span>
                </div>
              ) : null}
            </div>
          </Card>
        </section>
      ) : null}

      {brandsSlot ?? <PublicPastBrands brands={pastBrands} />}

      {showCreateBand ? <PublicCreatePitchkitBand /> : null}
    </>
  );
}
