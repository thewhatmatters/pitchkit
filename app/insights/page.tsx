import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OwnerChrome } from "@/components/owner-chrome";
import { OwnerShell } from "@/components/owner-shell";
import { SupportFooter } from "@/components/support-footer";
import { Badge } from "@/components/wmds";
import { INSIGHTS_PRIVATE } from "@/lib/copy";
import { insightsGate, parseSessionValue, SESSION_COOKIE } from "@/lib/session";
import { loadOwnerKit } from "@/lib/store";

type InsightsProps = {
  searchParams: Promise<{ grid?: string }>;
};

export default async function InsightsPage({ searchParams }: InsightsProps) {
  const { grid } = await searchParams;
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  if (!insightsGate(session)) {
    redirect("/");
  }

  const gridReady = grid !== "pulling";
  const kit = loadOwnerKit(session.handle);
  if (!kit) {
    redirect("/");
  }

  return (
    <OwnerShell
      handle={kit.user.handle}
      title="Insights"
      end={
        <Badge emphasis="muted" size="sm">
          {INSIGHTS_PRIVATE}
        </Badge>
      }
    >
      <OwnerChrome
        user={kit.user}
        posts={kit.posts}
        engagementRate={kit.engagementRate}
        typicalReach={kit.typicalReach}
        typicalSaves={kit.typicalSaves}
        reachSeries={kit.reach_series}
        hasInsights={kit.hasInsights}
        gridReady={gridReady}
      />
      <SupportFooter />
    </OwnerShell>
  );
}
