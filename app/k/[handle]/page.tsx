import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KitCard } from "@/components/kit-card";
import { SupportFooter } from "@/components/support-footer";
import { kitPath } from "@/lib/kit";
import { loadPublicKit } from "@/lib/store";

type KitPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: KitPageProps): Promise<Metadata> {
  const { handle } = await params;
  const kit = loadPublicKit(handle);
  if (!kit) {
    return { title: "Not found" };
  }

  return {
    title: `${kit.user.name} (@${kit.user.handle})`,
    description: "Instagram media kit on Pitchkit.",
    openGraph: {
      title: `${kit.user.name} (@${kit.user.handle})`,
      url: kitPath(kit.user.handle),
    },
  };
}

export default async function KitPage({ params }: KitPageProps) {
  const { handle } = await params;
  const kit = loadPublicKit(handle);
  if (!kit) {
    notFound();
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <KitCard
        user={kit.user}
        posts={kit.posts}
        engagementRate={kit.engagementRate}
        hasInsights={kit.hasInsights}
      />
      <SupportFooter />
    </main>
  );
}
