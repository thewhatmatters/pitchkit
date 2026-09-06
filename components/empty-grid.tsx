"use client";

import { Skeleton, Status } from "@/components/wmds";
import { EMPTY_GRID } from "@/lib/copy";

export function EmptyGrid() {
  return (
    <div className="flex flex-col gap-3" data-empty-grid="">
      <p className="inline-flex items-center gap-1.5">
        <Status variant="dot" tone="neutral" besideLabel pulsing />
        {EMPTY_GRID}
      </p>
      <Skeleton width="100%" height={160} radius="inner" />
    </div>
  );
}
