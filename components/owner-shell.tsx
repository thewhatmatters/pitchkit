"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Settings, Share2 } from "lucide-react";
import { Button, NavRail, PageHeader } from "@/components/wmds";
import { kitPath } from "@/lib/kit";

type OwnerShellProps = {
  handle: string;
  title: string;
  children: ReactNode;
  end?: ReactNode;
};

export function OwnerShell({ handle, title, children, end }: OwnerShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const kitHref = kitPath(handle);
  const activeId = pathname.startsWith("/settings")
    ? "settings"
    : pathname.startsWith("/k/")
      ? "kit"
      : "insights";

  return (
    <div className="flex min-h-dvh gap-4">
      <div className="hidden shrink-0 lg:block">
        <NavRail
          brandLabel="Pitchkit"
          aria-label="Owner"
          items={[
            { id: "insights", label: "Insights", icon: <BarChart3 strokeWidth={2} /> },
            { id: "kit", label: "Media kit", icon: <Share2 strokeWidth={2} /> },
          ]}
          footerItems={[{ id: "settings", label: "Settings", icon: <Settings strokeWidth={2} /> }]}
          activeId={activeId}
          onSelect={(id) => {
            if (id === "insights") router.push("/insights");
            if (id === "kit") router.push(kitHref);
            if (id === "settings") router.push("/settings");
          }}
        />
      </div>
      <div className="grid-page min-w-0 flex-1 py-6">
        <div className="band">
          <div className="col-span-full flex flex-col gap-6">
            <PageHeader
              variant="app"
              title={title}
              end={
                <div className="flex flex-wrap items-center gap-2">
                  {end}
                  <div className="flex gap-2 lg:hidden">
                    <Button role="ghost" size="sm" onClick={() => router.push("/insights")}>
                      Insights
                    </Button>
                    <Button role="ghost" size="sm" onClick={() => router.push(kitHref)}>
                      Media kit
                    </Button>
                    <Button role="ghost" size="sm" onClick={() => router.push("/settings")}>
                      Settings
                    </Button>
                  </div>
                </div>
              }
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
