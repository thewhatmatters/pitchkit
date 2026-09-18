import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  AppFrame,
  CREATOR_INSIGHTS_BODY_BAND_CLASS,
  CREATOR_INSIGHTS_BODY_INNER_CLASS,
  CREATOR_INSIGHTS_HEADER_BAND_CLASS,
  CREATOR_INSIGHTS_PAGE_CLASS,
} from "@/components/app-frame";
import { KitEdit } from "@/components/kit-edit";
import { OwnerNav } from "@/components/owner-nav";
import { SupportFooter } from "@/components/support-footer";
import { kitPath } from "@/lib/kit";
import { parseSessionValue, SESSION_COOKIE, sessionOwnsHandle } from "@/lib/session";
import { hiddenOverlayForHandle, loadPublicKit } from "@/lib/store";

type KitPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: KitPageProps): Promise<Metadata> {
  const { handle } = await params;
  const overlay = await hiddenOverlayForHandle(handle);
  const kit = await loadPublicKit(handle, new Date(), overlay);
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
  const cookieStore = await cookies();
  const overlay = await hiddenOverlayForHandle(handle);
  const kit = await loadPublicKit(handle, new Date(), overlay);
  if (!kit) {
    notFound();
  }

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
      <main className={CREATOR_INSIGHTS_PAGE_CLASS}>
        <div className={CREATOR_INSIGHTS_HEADER_BAND_CLASS}>
          <OwnerNav handle={kit.user.handle} name={kit.user.name} />
        </div>
        <div className={CREATOR_INSIGHTS_BODY_BAND_CLASS}>
          <div className={CREATOR_INSIGHTS_BODY_INNER_CLASS}>
            {card}
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

  return (
    <AppFrame>
      {card}
      <SupportFooter />
    </AppFrame>
  );
}
