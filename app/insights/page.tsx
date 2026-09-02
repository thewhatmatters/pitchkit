import { OwnerChrome } from "@/components/owner-chrome";
import { PageTitle } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { demoEngagementRate, demoHasInsights, demoPosts, demoUser } from "@/lib/demo";

type InsightsProps = {
  searchParams: Promise<{ grid?: string }>;
};

export default async function InsightsPage({ searchParams }: InsightsProps) {
  const { grid } = await searchParams;
  const gridReady = grid !== "pulling";

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <PageTitle>Insights</PageTitle>
      <p>Owner chrome — stub, no session cookie yet. Brands never see this page.</p>
      <OwnerChrome
        user={demoUser}
        posts={demoPosts}
        engagementRate={demoEngagementRate}
        hasInsights={demoHasInsights}
        gridReady={gridReady}
      />
      <SupportFooter />
    </main>
  );
}
