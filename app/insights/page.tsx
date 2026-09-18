import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CREATOR_INSIGHTS_BODY_BAND_CLASS,
  CREATOR_INSIGHTS_BODY_INNER_CLASS,
  CREATOR_INSIGHTS_HEADER_BAND_CLASS,
  CREATOR_INSIGHTS_PAGE_CLASS,
} from "@/components/app-frame";
import { OwnerChrome } from "@/components/owner-chrome";
import { OwnerNav } from "@/components/owner-nav";
import { SupportFooter } from "@/components/support-footer";
import { HIDDEN_COOKIE, parseHiddenOverlay } from "@/lib/hidden-kit";
import { insightsGate, parseSessionValue, SESSION_COOKIE } from "@/lib/session";
import { hiddenOverlayForHandle, loadOwnerKit } from "@/lib/store";

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
  const kit = await loadOwnerKit(session.handle, new Date(), overlay);
  if (!kit) {
    redirect("/");
  }

  return (
    <main className={CREATOR_INSIGHTS_PAGE_CLASS}>
      <div className={CREATOR_INSIGHTS_HEADER_BAND_CLASS}>
        <OwnerNav handle={kit.user.handle} name={kit.user.name} />
      </div>
      <div className={CREATOR_INSIGHTS_BODY_BAND_CLASS}>
        <div className={CREATOR_INSIGHTS_BODY_INNER_CLASS}>
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
        </div>
      </div>
    </main>
  );
}
