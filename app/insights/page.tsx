import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppFrame, OWNER_GRID_MAX } from "@/components/app-frame";
import { OwnerChrome } from "@/components/owner-chrome";
import { OwnerNav } from "@/components/owner-nav";
import { SupportFooter } from "@/components/support-footer";
import { HIDDEN_COOKIE, parseHiddenCookie } from "@/lib/kit-visibility";
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
  const overlay = parseHiddenCookie(cookieStore.get(HIDDEN_COOKIE)?.value);
  const kit = loadOwnerKit(session.handle, new Date(), overlay);
  if (!kit) {
    redirect("/");
  }

  return (
    <AppFrame gridMax={OWNER_GRID_MAX}>
      <OwnerNav handle={kit.user.handle} />
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
      <SupportFooter>
        <p>
          <a href="/settings">Account</a>
        </p>
      </SupportFooter>
    </AppFrame>
  );
}
