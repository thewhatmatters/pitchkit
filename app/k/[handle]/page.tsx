import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KitCard } from "@/components/kit-card";
import { SupportFooter } from "@/components/support-footer";
import {
  DEMO_HANDLE,
  demoEngagementRate,
  demoHasInsights,
  demoPosts,
  demoUser,
  kitPath,
} from "@/lib/demo";

type KitPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: KitPageProps): Promise<Metadata> {
  const { handle } = await params;
  if (handle !== DEMO_HANDLE) {
    return { title: "Not found" };
  }

  return {
    title: `${demoUser.name} (@${demoUser.handle})`,
    description: "Instagram media kit on Pitchkit.",
    openGraph: {
      title: `${demoUser.name} (@${demoUser.handle})`,
      url: kitPath(demoUser.handle),
    },
  };
}

export default async function KitPage({ params }: KitPageProps) {
  const { handle } = await params;
  if (handle !== DEMO_HANDLE) {
    notFound();
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <KitCard
        user={demoUser}
        posts={demoPosts}
        engagementRate={demoEngagementRate}
        hasInsights={demoHasInsights}
      />
      <SupportFooter />
    </main>
  );
}
