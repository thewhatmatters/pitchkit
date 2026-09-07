import type { ReactNode } from "react";
import { OwnerGridOverlay } from "@/components/owner-grid-overlay";

/** Owner views only — WMDS `--grid-max` override from CONSUMING. */
export const OWNER_GRID_MAX = "960px";

/** Owner views only — WMDS gutter override. Overlay + band inherit. */
export const OWNER_GRID_COLUMN_GAP = "8px";

type AppFrameProps = {
  children: ReactNode;
  /** Centered WMDS page max. Owner views pass `OWNER_GRID_MAX`. */
  gridMax?: string;
};

/**
 * Copy of WMDS `grid-page` + `band` from CONSUMING. Layout only — not a new atom.
 * Band children are grid items: place with `col-span-*` so KPI tiles can lock
 * to column lines. Do not wrap children in `col-span-full flex`.
 *
 * Owner tokens are Tailwind arbitrary props in JSX (Randy SoT). Force both
 * `--grid-column-gap` and `--grid-gutter` until WMDS `.grid-page` consume
 * path consistently uses `--grid-column-gap` for column-gap (live CSS still
 * reads `column-gap: var(--grid-gutter)`).
 */
export function AppFrame({ children, gridMax }: AppFrameProps) {
  return (
    <div
      className={
        gridMax
          ? "grid-page min-h-dvh py-6 [--grid-max:960px] [--grid-column-gap:8px] [--grid-gutter:8px] [--grid-cols:12]"
          : "grid-page min-h-dvh py-6"
      }
    >
      <OwnerGridOverlay />
      <div className="band">{children}</div>
    </div>
  );
}
