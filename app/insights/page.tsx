import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OwnerWorkspace } from "@/components/owner-workspace";
import { HIDDEN_COOKIE, parseHiddenOverlay } from "@/lib/hidden-kit";
import { insightsGate, parseSessionValue, SESSION_COOKIE } from "@/lib/session";
import { hiddenOverlayForHandle, loadOwnerKit, loadPublicKit } from "@/lib/store";

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
  const overlay = await hiddenOverlayForHandle(
    session.handle,
    parseHiddenOverlay(cookieStore.get(HIDDEN_COOKIE)?.value),
  );
  const ownerKit = await loadOwnerKit(session.handle, new Date(), overlay);
  const shareableKit = await loadPublicKit(session.handle, new Date(), overlay);
  if (!ownerKit || !shareableKit) {
    redirect("/");
  }

  return (
    <OwnerWorkspace
      user={ownerKit.user}
      ownerPosts={ownerKit.posts}
      shareablePosts={shareableKit.posts}
      engagementRate={ownerKit.engagementRate}
      typicalReach={ownerKit.typicalReach}
      typicalSaves={ownerKit.typicalSaves}
      reachSeries={ownerKit.reach_series}
      hasInsights={ownerKit.hasInsights}
      gridReady={gridReady}
    />
  );
}
