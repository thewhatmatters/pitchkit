import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OwnerChrome } from "@/components/owner-chrome";
import { PageTitle } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
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
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <PageTitle>Insights</PageTitle>
      <p>Owner Insights. Brands never see this page.</p>
      <OwnerChrome
        user={kit.user}
        posts={kit.posts}
        engagementRate={kit.engagementRate}
        gridReady={gridReady}
      />
      <SupportFooter />
    </main>
  );
}
