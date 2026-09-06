import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { KitEdit } from "@/components/kit-edit";
import { OwnerShell } from "@/components/owner-shell";
import { SupportFooter } from "@/components/support-footer";
import { kitPath } from "@/lib/kit";
import { parseSessionValue, SESSION_COOKIE, sessionOwnsHandle } from "@/lib/session";
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

  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  const canEdit = sessionOwnsHandle(session, kit.user.handle);

  const card = (
    <KitEdit
      user={kit.user}
      posts={kit.posts}
      engagementRate={kit.engagementRate}
      hasInsights={kit.hasInsights}
      canEdit={canEdit}
    />
  );

  if (canEdit) {
    return (
      <OwnerShell handle={kit.user.handle} title="Media kit">
        {card}
        <SupportFooter />
      </OwnerShell>
    );
  }

  return (
    <AppFrame>
      {card}
      <SupportFooter />
    </AppFrame>
  );
}
