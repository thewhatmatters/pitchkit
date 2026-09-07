"use client";

import { GridOverlay } from "@/components/wmds";

/** Client child so AppFrame can stay a server layout. Press g toggles. */
export function OwnerGridOverlay() {
  return <GridOverlay visibleByDefault />;
}
