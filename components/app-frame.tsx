import type { CSSProperties, ReactNode } from "react";
import { OwnerGridOverlay } from "@/components/owner-grid-overlay";

/** Owner views only — WMDS `--grid-max` override from CONSUMING. */
export const OWNER_GRID_MAX = "960px";

/** Owner views only — WMDS `--grid-column-gap` override. Overlay + band inherit. */
export const OWNER_GRID_COLUMN_GAP = "8px";

type AppFrameProps = {
  children: ReactNode;
  /** Centered WMDS page max. Owner views pass `OWNER_GRID_MAX`. */
  gridMax?: string;
};

type GridPageVars = CSSProperties & {
  "--grid-max"?: string;
  "--grid-column-gap"?: string;
  "--grid-cols"?: string;
};

/**
 * Copy of WMDS `grid-page` + `band` from CONSUMING. Layout only — not a new atom.
 * Band children are grid items: place with `col-span-*` so KPI tiles can lock
 * to column lines. Do not wrap children in `col-span-full flex`.
 */
export function AppFrame({ children, gridMax }: AppFrameProps) {
  const style: GridPageVars | undefined = gridMax
    ? {
        "--grid-max": gridMax,
        "--grid-column-gap": OWNER_GRID_COLUMN_GAP,
        /* 12 tracks at every width so Design spans (6 mobile / 3 md+) lock. */
        "--grid-cols": "12",
      }
    : undefined;

  return (
    <div className="grid-page min-h-dvh py-6" style={style}>
      <OwnerGridOverlay />
      <div className="band">{children}</div>
    </div>
  );
}
