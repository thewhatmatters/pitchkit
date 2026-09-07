import type { CSSProperties, ReactNode } from "react";
import { OwnerGridOverlay } from "@/components/owner-grid-overlay";

/** Owner views only — WMDS `--grid-max` override from CONSUMING. */
export const OWNER_GRID_MAX = "960px";

type AppFrameProps = {
  children: ReactNode;
  /** Centered WMDS page max. Owner views pass `OWNER_GRID_MAX`. */
  gridMax?: string;
};

/**
 * Copy of WMDS `grid-page` + `band` from CONSUMING. Layout only — not a new atom.
 * Band children are grid items: place with `col-span-*` so KPI tiles can lock
 * to column lines. Do not wrap children in `col-span-full flex`.
 */
export function AppFrame({ children, gridMax }: AppFrameProps) {
  const style = gridMax
    ? ({ "--grid-max": gridMax } as CSSProperties)
    : undefined;

  return (
    <div className="grid-page min-h-dvh py-6" style={style}>
      <OwnerGridOverlay />
      <div className="band">{children}</div>
    </div>
  );
}
