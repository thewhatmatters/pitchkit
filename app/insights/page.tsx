import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OwnerWorkspace } from "@/components/owner-workspace";
import { HIDDEN_COOKIE, parseHiddenOverlay } from "@/lib/hidden-kit";
import { insightsGate, resolveSession, SESSION_COOKIE } from "@/lib/session";
import { hiddenOverlayForHandle, loadOwnerKit } from "@/lib/store";

type InsightsProps = {
  searchParams: Promise<{ grid?: string; refresh?: string }>;
};

export default async function InsightsPage({ searchParams }: InsightsProps) {
  const { grid, refresh } = await searchParams;
  const cookieStore = await cookies();
  const session = await resolveSession(cookieStore.get(SESSION_COOKIE)?.value, "page");
  if (!insightsGate(session)) {
    redirect("/");
  }

  const gridReady = grid !== "pulling";
  const retrieving = grid === "retrieving";
  const overlay = await hiddenOverlayForHandle(
    session.handle,
    parseHiddenOverlay(cookieStore.get(HIDDEN_COOKIE)?.value),
  );
  const ownerKit = await loadOwnerKit(session.handle, new Date(), overlay, {
    refresh: refresh === "1",
    access: "page",
  });
  if (!ownerKit) {
    redirect("/");
  }

  return (
    <OwnerWorkspace
      user={ownerKit.user}
      ownerPosts={ownerKit.posts}
      engagementRate={ownerKit.engagementRate}
      typicalReach={ownerKit.typicalReach}
      typicalSaves={ownerKit.typicalSaves}
      reachSeries={ownerKit.reach_series}
      hasInsights={ownerKit.hasInsights}
      audience={ownerKit.audience}
      intro={ownerKit.intro}
      pastBrands={ownerKit.past_brands}
      theme={ownerKit.theme}
      gridReady={gridReady}
      retrieving={retrieving}
    />
  );
}
