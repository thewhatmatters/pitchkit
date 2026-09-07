import type { CSSProperties, ReactNode } from "react";

/** Owner views only — WMDS `--grid-max` override from CONSUMING. */
export const OWNER_GRID_MAX = "960px";

type AppFrameProps = {
  children: ReactNode;
  /** Centered WMDS page max. Owner views pass `OWNER_GRID_MAX`. */
  gridMax?: string;
};

/** Copy of WMDS `grid-page` + `band` from CONSUMING. Layout only — not a new atom. */
export function AppFrame({ children, gridMax }: AppFrameProps) {
  const style = gridMax
    ? ({ "--grid-max": gridMax } as CSSProperties)
    : undefined;

  return (
    <div className="grid-page min-h-dvh py-6" style={style}>
      <div className="band">
        <div className="col-span-full flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
