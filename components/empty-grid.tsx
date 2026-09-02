"use client";

import { StatusDot } from "@/components/wmds";
import { EMPTY_GRID } from "@/lib/copy";

export function EmptyGrid() {
  return (
    <p className="inline-flex items-center gap-1.5">
      <StatusDot variant="info" besideLabel pulsing />
      {EMPTY_GRID}
    </p>
  );
}
