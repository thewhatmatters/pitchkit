"use client";

import {
  PATTERN_AUDIENCE_CARD_CLASS,
  PATTERN_AUDIENCE_SECTION_CLASS,
  PATTERN_AUDIENCE_WELL_CLASS,
  PATTERN_SECTION_EYEBROW_CLASS,
} from "@/components/pattern-tokens";
import { Card, Chart, cardSubtitleClasses, cardTitleClasses } from "@/components/wmds";
import { shouldShowAudienceMix, visibleAudienceMix, type RankedShare } from "@/lib/audience";

type AudienceFitProps = {
  country?: RankedShare[] | null;
  city?: RankedShare[] | null;
  age?: RankedShare[] | null;
  gender?: RankedShare[] | null;
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
 * Owner Insights audience Card. Hide the whole Card when every mix is empty.
 * Never paint zeros. Chart.RankedBars only — no invented bars.
 */
export function AudienceFit({ country, city, age, gender }: AudienceFitProps) {
  const countries = toBars(country);
  const cities = toBars(city);
  const ages = toBars(age);
  const genders = toBars(gender);

  if (
    !shouldShowAudienceMix(country) &&
    !shouldShowAudienceMix(city) &&
    !shouldShowAudienceMix(age) &&
    !shouldShowAudienceMix(gender)
  ) {
    return null;
  }

  return (
    <Card
      variant="outlined"
      shape="rounded"
      bodyTerminal
      className={PATTERN_AUDIENCE_CARD_CLASS}
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
        <div className={PATTERN_AUDIENCE_WELL_CLASS}>
          <AudienceSection title="Countries" items={countries} />
          <AudienceSection title="Cities" items={cities} />
          <AudienceSection title="Age" items={ages} />
          <AudienceSection title="Gender" items={genders} />
        </div>
      </Card.Body>
    </Card>
  );
}
