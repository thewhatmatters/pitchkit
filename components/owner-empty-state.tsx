"use client";

import type { ReactNode } from "react";
import {
  PATTERN_EMPTY_BODY_CLASS,
  PATTERN_EMPTY_NEXT_CLASS,
  PATTERN_EMPTY_TITLE_CLASS,
} from "@/components/pattern-tokens";
import { Badge } from "@/components/wmds";

type OwnerEmptyStateProps = {
  badge: string;
  title: string;
  body: string;
  /** Extra line (e.g. "64 of 100 followers") between body and next. */
  detail?: string | null;
  next?: string | null;
  action?: ReactNode;
  className: string;
};

/**
 * Owner-only empty state: Badge → title → body → what happens next → action.
 * Assembled from WMDS Badge + type tokens until WMDS ships an EmptyState
 * molecule (gap sent to Design Systems Manager). Never rendered on /k/<handle>.
 */
export function OwnerEmptyState({
  badge,
  title,
  body,
  detail = null,
  next = null,
  action,
  className,
}: OwnerEmptyStateProps) {
  return (
    <div className={className} data-empty-state="owner">
      <Badge variant="neutral" emphasis="muted">{badge}</Badge>
      <h3 className={PATTERN_EMPTY_TITLE_CLASS}>{title}</h3>
      <p className={PATTERN_EMPTY_BODY_CLASS}>{body}</p>
      {detail ? <p className={PATTERN_EMPTY_BODY_CLASS}>{detail}</p> : null}
      {next ? <p className={PATTERN_EMPTY_NEXT_CLASS}>{next}</p> : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
