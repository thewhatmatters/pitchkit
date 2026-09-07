"use client";

import { usePathname, useRouter } from "next/navigation";
import { SegmentedControl } from "@/components/wmds";
import { kitPath } from "@/lib/kit";

type OwnerNavProps = {
  handle: string;
};

/** Cookie-gated Insights / Pitch switch. Not a shell. */
export function OwnerNav({ handle }: OwnerNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const kitHref = kitPath(handle);
  const view = pathname.startsWith("/k/") ? "kit" : "insights";

  return (
    <SegmentedControl
      aria-label="Owner views"
      value={view}
      onValueChange={(value) => {
        if (value === "insights") {
          router.push("/insights");
        }
        if (value === "kit") {
          router.push(kitHref);
        }
      }}
      layout="stretch"
      className="col-span-full w-full min-w-0"
    >
      <SegmentedControl.Item value="insights">Insights</SegmentedControl.Item>
      <SegmentedControl.Item value="kit">Pitch</SegmentedControl.Item>
    </SegmentedControl>
  );
}
