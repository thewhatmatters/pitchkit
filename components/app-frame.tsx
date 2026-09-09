import type { ReactNode } from "react";

/** Owner views only — WMDS `--grid-max` override from CONSUMING / PitchKit pattern. */
export const OWNER_GRID_MAX = "1140px";

/** Owner views only — WMDS gutter override. Band inherits. */
export const OWNER_GRID_COLUMN_GAP = "8px";

type AppFrameProps = {
  children: ReactNode;
  /** Centered WMDS page max. Owner views pass `OWNER_GRID_MAX`. */
  gridMax?: string;
};

/**
 * Copy of WMDS `grid-page` + `band` from CONSUMING. Layout only — not a new atom.
 * Band children are grid items: place with `col-span-*`.
 *
 * Owner tokens are Tailwind arbitrary props in JSX (Randy SoT). Force both
 * `--grid-column-gap` and `--grid-gutter` until WMDS `.grid-page` consume
 * path consistently uses `--grid-column-gap` for column-gap (live CSS still
 * reads `column-gap: var(--grid-gutter)`).
 *
 * Storybook grid-debug chrome stays out of the product AppFrame.
 */
export function AppFrame({ children, gridMax }: AppFrameProps) {
  return (
    <div
      className={
        gridMax
          ? "grid-page min-h-dvh bg-body py-6 [--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]"
          : "grid-page min-h-dvh py-6"
      }
    >
      <div className="band">{children}</div>
    </div>
  );
}
