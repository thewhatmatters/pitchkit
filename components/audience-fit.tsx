"use client";

import type { CSSProperties } from "react";
import {
  PATTERN_AUDIENCE_CARD_CLASS,
  PATTERN_AUDIENCE_EMPTY_COPY_CLASS,
  PATTERN_AUDIENCE_EMPTY_WELL_CLASS,
  PATTERN_AUDIENCE_SECTION_CLASS,
  PATTERN_AUDIENCE_WELL_CLASS,
  PATTERN_REACH_CHART_MIN_HEIGHT,
  PATTERN_SECTION_EYEBROW_CLASS,
} from "@/components/pattern-tokens";
import { Card, Chart, cardSubtitleClasses, cardTitleClasses } from "@/components/wmds";
import { audienceFitSurface, visibleAudienceMix, type RankedShare } from "@/lib/audience";
import { OwnerEmptyState } from "@/components/owner-empty-state";
import {
  AUDIENCE_EMPTY_BADGE,
  AUDIENCE_EMPTY_BODY,
  AUDIENCE_EMPTY_NEXT,
  AUDIENCE_EMPTY_TITLE,
  AUDIENCE_MIN_FOLLOWERS,
  AUDIENCE_UNDER_MIN_BADGE,
  AUDIENCE_UNDER_MIN_BODY,
  AUDIENCE_UNDER_MIN_NEXT,
  audienceUnderMinProgress,
  audienceUnderMinTitle,
} from "@/lib/copy";

type AudienceFitProps = {
  country?: RankedShare[] | null;
  city?: RankedShare[] | null;
  age?: RankedShare[] | null;
  gender?: RankedShare[] | null;
  /** Under 100 followers Instagram withholds demographics — show progress, not "no data". */
  followers?: number | null;
  retrieving?: boolean;
};

function toBars(rows: RankedShare[] | null | undefined) {
  return visibleAudienceMix(rows).map((row) => ({
    label: row.label,
    value: row.percent,
  }));
}

function AudienceSection({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={PATTERN_AUDIENCE_SECTION_CLASS}>
      <h3 className={PATTERN_SECTION_EYEBROW_CLASS}>{title}</h3>
      <Chart.RankedBars aria-label={`Audience by ${title.toLowerCase()}`} items={items} animate="none" />
    </section>
  );
}

/**
 * Owner Insights audience Card. Keep the Card + header when mixes are empty
 * (`examples-pitchkit--insufficient-audience-data`; Badge → title → body).
 * Never EXAMPLE percents.
 * Retrieving after chrome is up is Header + Chart.Loading — not this empty well.
 */
export function AudienceFit({
  country,
  city,
  age,
  gender,
  followers = null,
  retrieving = false,
}: AudienceFitProps) {
  const countries = toBars(country);
  const cities = toBars(city);
  const ages = toBars(age);
  const genders = toBars(gender);
  const surface = audienceFitSurface({ country, city, age, gender });
  const underMin =
    followers != null && followers >= 0 && followers < AUDIENCE_MIN_FOLLOWERS;
  const slot = retrieving
    ? "retrieving"
    : surface === "bars"
      ? "bars"
      : underMin
        ? "min-followers"
        : "empty";

  return (
    <Card
      variant="outlined"
      shape="rounded"
      bodyTerminal
      className={PATTERN_AUDIENCE_CARD_CLASS}
      data-audience-slot={slot}
      aria-busy={retrieving || undefined}
      aria-label={retrieving ? "Retrieving audience fit" : undefined}
    >
      <Card.Header
        start={
          <>
            <h2 className={cardTitleClasses}>Audience fit</h2>
            <p className={cardSubtitleClasses}>Ranked Instagram percentages.</p>
          </>
        }
      />
      <Card.Body>
        {retrieving ? (
          <div className={PATTERN_AUDIENCE_WELL_CLASS}>
            <Chart.Loading minHeight={PATTERN_REACH_CHART_MIN_HEIGHT} />
          </div>
        ) : surface === "empty" ? (
          <div
            className={PATTERN_AUDIENCE_EMPTY_WELL_CLASS}
            style={{ minHeight: PATTERN_REACH_CHART_MIN_HEIGHT } satisfies CSSProperties}
          >
            {underMin ? (
              <OwnerEmptyState
                className={PATTERN_AUDIENCE_EMPTY_COPY_CLASS}
                badge={AUDIENCE_UNDER_MIN_BADGE}
                title={audienceUnderMinTitle(followers ?? 0)}
                body={AUDIENCE_UNDER_MIN_BODY}
                detail={audienceUnderMinProgress(followers ?? 0)}
                next={AUDIENCE_UNDER_MIN_NEXT}
              />
            ) : (
              <OwnerEmptyState
                className={PATTERN_AUDIENCE_EMPTY_COPY_CLASS}
                badge={AUDIENCE_EMPTY_BADGE}
                title={AUDIENCE_EMPTY_TITLE}
                body={AUDIENCE_EMPTY_BODY}
                next={AUDIENCE_EMPTY_NEXT}
              />
            )}
          </div>
        ) : (
          <div className={PATTERN_AUDIENCE_WELL_CLASS}>
            <AudienceSection title="Countries" items={countries} />
            <AudienceSection title="Cities" items={cities} />
            <AudienceSection title="Age" items={ages} />
            <AudienceSection title="Gender" items={genders} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
