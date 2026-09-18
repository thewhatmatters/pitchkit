"use client";

import { usePathname, useRouter } from "next/navigation";
import { Avatar, SegmentedControl } from "@/components/wmds";
import { kitPath } from "@/lib/kit";

type OwnerNavProps = {
  handle: string;
  name: string;
};

/** WMDS Pattern — creator Insights three-column header. Hug control. Not a shell. */
export function OwnerNav({ handle, name }: OwnerNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const kitHref = kitPath(handle);
  const view = pathname.startsWith("/k/") ? "pitchkit" : "insights";

  return (
    <header className="col-span-full grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <span className="type-ui-label text-fg">PitchKit</span>
      <SegmentedControl
        aria-label="PitchKit primary navigation"
        size="sm"
        value={view}
        onValueChange={(value) => {
          if (value === "insights") {
            router.push("/insights");
          }
          if (value === "pitchkit") {
            router.push(kitHref);
          }
        }}
      >
        <SegmentedControl.Item value="insights">Insights</SegmentedControl.Item>
        <SegmentedControl.Item value="pitchkit">PitchKit</SegmentedControl.Item>
      </SegmentedControl>
      <Avatar name={name} size="sm" className="justify-self-end" />
    </header>
  );
}
