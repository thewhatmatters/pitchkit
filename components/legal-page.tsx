"use client";

import type { ReactNode } from "react";
import { Badge, Card, cardBodyTextClasses, cardTitleClasses, TextLink } from "@/components/wmds";

/** Legal / policy section — WMDS Card with an h2 and an optional anchor id. */
export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card
      id={id}
      variant="outlined"
      shape="rounded"
      padding="none"
      className="col-span-full scroll-mt-6"
    >
      <Card.Header>
        <h2 className={cardTitleClasses}>{title}</h2>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-3 p-3">{children}</div>
      </Card.Body>
    </Card>
  );
}

export function LegalCopy({ children }: { children: ReactNode }) {
  return <p className={cardBodyTextClasses}>{children}</p>;
}

/** Bulleted copy in WMDS body text. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className={`${cardBodyTextClasses} flex list-disc flex-col gap-1.5 pl-5`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/** Marks a sentence Randy still has to confirm before publishing. */
export function ToConfirm() {
  return (
    <Badge variant="warning" emphasis="muted" size="sm" data-to-confirm>
      To confirm
    </Badge>
  );
}

export function DraftNotice() {
  return (
    <div className="col-span-full flex flex-wrap items-center gap-2" data-draft-notice>
      <Badge variant="warning" emphasis="muted" size="sm">
        Draft
      </Badge>
      <span className={cardBodyTextClasses}>
        Draft for Randy&apos;s review. This is not legal advice and is not yet published. Items
        marked &ldquo;To confirm&rdquo; are not verified in code.
      </span>
    </div>
  );
}

export function ContactLink() {
  return <TextLink href="mailto:randy@whatmatters.so">randy@whatmatters.so</TextLink>;
}
