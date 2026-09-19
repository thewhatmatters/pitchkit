"use client";

import type { CSSProperties } from "react";
import {
  PATTERN_AUDIENCE_CARD_CLASS,
  PATTERN_AUDIENCE_EMPTY_COPY_CLASS,
  PATTERN_AUDIENCE_EMPTY_WELL_CLASS,
  PATTERN_AUDIENCE_SECTION_CLASS,
  PATTERN_AUDIENCE_WELL_CLASS,
  PATTERN_EMPTY_BODY_CLASS,
  PATTERN_EMPTY_TITLE_CLASS,
  PATTERN_REACH_CHART_MIN_HEIGHT,
  PATTERN_SECTION_EYEBROW_CLASS,
} from "@/components/pattern-tokens";
import { Badge, Card, Chart, cardSubtitleClasses, cardTitleClasses } from "@/components/wmds";
import { audienceFitSurface, visibleAudienceMix, type RankedShare } from "@/lib/audience";
import {
  AUDIENCE_INSUFFICIENT_BODY,
  AUDIENCE_INSUFFICIENT_TITLE,
  REACH_NO_DATA_LABEL,
} from "@/lib/copy";

type AudienceFitProps = {
  country?: RankedShare[] | null;
  city?: RankedShare[] | null;
  age?: RankedShare[] | null;
  gender?: RankedShare[] | null;
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
  retrieving = false,
}: AudienceFitProps) {
  const countries = toBars(country);
  const cities = toBars(city);
  const ages = toBars(age);
  const genders = toBars(gender);
  const surface = audienceFitSurface({ country, city, age, gender });
  const slot = retrieving ? "retrieving" : surface === "bars" ? "bars" : "empty";

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
            <div className={PATTERN_AUDIENCE_EMPTY_COPY_CLASS}>
              <Badge variant="neutral" emphasis="muted">{REACH_NO_DATA_LABEL}</Badge>
              <h3 className={PATTERN_EMPTY_TITLE_CLASS}>{AUDIENCE_INSUFFICIENT_TITLE}</h3>
              <p className={PATTERN_EMPTY_BODY_CLASS}>{AUDIENCE_INSUFFICIENT_BODY}</p>
            </div>
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
