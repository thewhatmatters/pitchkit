"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Settings, Share2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/wmds";
import { kitPath } from "@/lib/kit";

type OwnerShellProps = {
  handle: string;
  title: string;
  children: ReactNode;
  end?: ReactNode;
};

/** Tailwind `lg` — pick desktop AppShell vs AppShell.Mobile at the app breakpoint. */
const DESKTOP_SHELL_QUERY = "(min-width: 1024px)";

function useDesktopShell() {
  const [desktop, setDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_SHELL_QUERY);
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return desktop;
}

export function OwnerShell({ handle, title, children, end }: OwnerShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const desktop = useDesktopShell();
  const kitHref = kitPath(handle);
  const activeId = pathname.startsWith("/settings")
    ? "settings"
    : pathname.startsWith("/k/")
      ? "kit"
      : "insights";

  const items = [
    { id: "insights", label: "Insights", icon: <BarChart3 strokeWidth={2} /> },
    { id: "kit", label: "Media kit", icon: <Share2 strokeWidth={2} /> },
  ];
  const footerItems = [{ id: "settings", label: "Settings", icon: <Settings strokeWidth={2} /> }];

  function onSelect(id: string) {
    if (id === "insights") router.push("/insights");
    if (id === "kit") router.push(kitHref);
    if (id === "settings") router.push("/settings");
  }

  const header = <PageHeader variant="app" title={title} end={end} />;

  if (desktop === null) {
    return <div className="min-h-dvh bg-body" />;
  }

  if (desktop) {
    return (
      <div className="flex h-dvh min-h-0">
        <AppShell
          brandLabel="Pitchkit"
          aria-label="Owner"
          items={items}
          footerItems={footerItems}
          activeId={activeId}
          onSelect={onSelect}
        >
          {header}
          <AppShell.Body>{children}</AppShell.Body>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <AppShell.Mobile
        aria-label="Owner"
        items={items}
        footerItems={footerItems}
        activeId={activeId}
        onSelect={onSelect}
        header={header}
      >
        {children}
      </AppShell.Mobile>
    </div>
  );
}
