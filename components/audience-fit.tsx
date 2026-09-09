"use client";

import {
  Card,
  Chart,
  cardLayoutBodyOccupantRadiusClasses,
  cardSubtitleClasses,
  cardTitleClasses,
} from "@/components/wmds";
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
    <section className="flex min-w-0 flex-col gap-3">
      <h3 className="text-xs uppercase tracking-wide text-muted">{title}</h3>
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
      className="col-span-full min-w-0 lg:col-span-6"
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
        <div
          className={`grid min-w-0 gap-y-6 bg-body px-3.5 py-4 [column-gap:var(--grid-column-gap)] sm:grid-cols-2 ${cardLayoutBodyOccupantRadiusClasses}`}
        >
          <AudienceSection title="Countries" items={countries} />
          <AudienceSection title="Cities" items={cities} />
          <AudienceSection title="Age" items={ages} />
          <AudienceSection title="Gender" items={genders} />
        </div>
      </Card.Body>
    </Card>
  );
}
