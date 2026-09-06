import type { ReactNode } from "react";

/** Copy of WMDS `grid-page` + `band` from CONSUMING. Layout only — not a new atom. */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grid-page min-h-dvh py-6">
      <div className="band">
        <div className="col-span-full flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
