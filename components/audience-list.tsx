"use client";

import { Card, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import { shouldShowAudienceMix, visibleAudienceMix, type RankedShare } from "@/lib/audience";

type AudienceListProps = {
  title: string;
  caption?: string;
  rows: RankedShare[] | null | undefined;
};

export function AudienceList({ title, caption, rows }: AudienceListProps) {
  const mix = visibleAudienceMix(rows);
  if (!shouldShowAudienceMix(mix)) {
    return null;
  }

  return (
    <Card variant="outlined" shape="rounded" padding="none" className="col-span-full">
      <Card.Header>
        <h2 className={cardTitleClasses}>{title}</h2>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-3 p-3">
          {caption ? <p className={cardBodyTextClasses}>{caption}</p> : null}
          <ol className="flex flex-col gap-2">
            {mix.map((row) => (
              <li key={row.label} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className={cardBodyTextClasses}>{row.label}</span>
                  <span className={cardTitleClasses}>{row.percent}%</span>
                </div>
                <div className="h-2 w-full" style={{ background: "var(--color-border)" }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(row.percent, 100)}%`,
                      background: "var(--color-primary)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Card.Body>
    </Card>
  );
}
