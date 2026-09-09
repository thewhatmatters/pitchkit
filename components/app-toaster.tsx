"use client";

import { Toaster } from "@/components/wmds";

/** Single app-root toaster. Mounted from `app/layout.tsx` only. */
export function AppToaster() {
  return <Toaster position="bottom-right" />;
}
