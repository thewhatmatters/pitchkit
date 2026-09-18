import type { ReactNode } from "react";

export {
  CREATOR_INSIGHTS_BODY_BAND_CLASS,
  CREATOR_INSIGHTS_BODY_INNER_CLASS,
  CREATOR_INSIGHTS_FORMULA_CLASS,
  CREATOR_INSIGHTS_HEADER_BAND_CLASS,
  CREATOR_INSIGHTS_PAGE_CLASS,
  CREATOR_INSIGHTS_STAT_CLASS,
  CREATOR_INSIGHTS_SUPPORTING_CLASS,
  CREATOR_INSIGHTS_TOPBAR_END_CLASS,
} from "@/lib/creator-insights-classes";

/** Owner views only — WMDS `--grid-max` override from CONSUMING / PitchKit pattern. */
export const OWNER_GRID_MAX = "1140px";

/** Owner views only — WMDS gutter override. Band inherits. */
export const OWNER_GRID_COLUMN_GAP = "8px";

/**
 * AppFrame `grid-page` className SoT (settings / landing / public / legal).
 * Force both gap tokens (WHA-309). Not the creator Insights Pattern surface.
 * Keep these Tailwind arbitrary props as literals so the scanner sees them.
 */
export const OWNER_GRID_CLASS =
  "grid-page min-h-dvh bg-body py-6 [--grid-max:1140px] [--grid-column-gap:8px] [--grid-gutter:8px]";

type AppFrameProps = {
  children: ReactNode;
  /** Centered WMDS page max. Settings / AppFrame owner wraps pass `OWNER_GRID_MAX`. */
  gridMax?: string;
};

/**
 * Copy of WMDS `grid-page` + `band` from CONSUMING. Layout only — not a new atom.
 * Band children are grid items: place with `col-span-*`.
 *
 * Insights and cookie-gated owner kit compose the live Storybook canvas
 * `<main>` + bands (`CREATOR_INSIGHTS_*`) instead of this frame. AppFrame
 * stays for landing, settings, public kit, and legal pages.
 *
 * AppFrame owner tokens are Tailwind arbitrary props in JSX (Randy SoT). Force
 * both `--grid-column-gap` and `--grid-gutter` on this surface until leftover
 * consume paths stop needing `--grid-gutter`.
 *
 * Storybook grid-debug chrome stays out of the product AppFrame.
 */
export function AppFrame({ children, gridMax }: AppFrameProps) {
  return (
    <div
      className={
        gridMax ? OWNER_GRID_CLASS : "grid-page min-h-dvh py-6"
      }
    >
      <div className="band">{children}</div>
    </div>
  );
}
