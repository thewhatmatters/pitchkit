import { OwnerChrome } from "@/components/owner-chrome";
import { PageTitle } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { loadOwnerKit } from "@/lib/store";

type InsightsProps = {
  searchParams: Promise<{ grid?: string; tab?: string }>;
};

export default async function InsightsPage({ searchParams }: InsightsProps) {
  const { grid, tab } = await searchParams;
  const gridReady = grid !== "pulling";
  const initialTab = tab === "kit" ? "kit" : "insights";
  const kit = loadOwnerKit();
  if (!kit) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        <PageTitle>Insights</PageTitle>
        <p>No kit yet.</p>
        <SupportFooter />
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <PageTitle>Insights</PageTitle>
      <p>Owner chrome — stub, no session cookie yet. Brands never see this page.</p>
      <OwnerChrome
        user={kit.user}
        posts={kit.posts}
        engagementRate={kit.engagementRate}
        hasInsights={kit.hasInsights}
        gridReady={gridReady}
        initialTab={initialTab}
      />
      <SupportFooter />
    </main>
  );
}
