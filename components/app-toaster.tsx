"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/wmds";

/**
 * Single app-root toaster. Mounted from `app/layout.tsx` only.
 * WMDS `Toaster` returns null when `document` is undefined (server) and an
 * `<ol>` on the client, which is a hydration mismatch. Mount it after
 * hydration until WMDS fixes it upstream (reported to Design Systems Manager).
 */
export function AppToaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <Toaster position="bottom-right" /> : null;
}
