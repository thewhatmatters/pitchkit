import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  CREATOR_INSIGHTS_BODY_BAND_CLASS,
  CREATOR_INSIGHTS_BODY_INNER_CLASS,
  CREATOR_INSIGHTS_HEADER_BAND_CLASS,
  CREATOR_INSIGHTS_PAGE_CLASS,
  PATTERN_BRAND_CLASS,
  PATTERN_TOPBAR_CLASS,
} from "@/components/pattern-tokens";
import { ShareableKit } from "@/components/shareable-kit";
import { SupportFooter } from "@/components/support-footer";
import { kitPath } from "@/lib/kit";
import { resolveSession, SESSION_COOKIE } from "@/lib/session";
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
  const overlay = await hiddenOverlayForHandle(handle);
  const kit = await loadPublicKit(handle, new Date(), overlay);
  if (!kit) {
    notFound();
  }

  const cookieStore = await cookies();
  const session = await resolveSession(cookieStore.get(SESSION_COOKIE)?.value, "page");

  return (
    <main className={CREATOR_INSIGHTS_PAGE_CLASS}>
      <div className={CREATOR_INSIGHTS_HEADER_BAND_CLASS}>
        <header className={PATTERN_TOPBAR_CLASS}>
          <span className={PATTERN_BRAND_CLASS}>PitchKit</span>
        </header>
      </div>
      <div className={CREATOR_INSIGHTS_BODY_BAND_CLASS}>
        <div className={CREATOR_INSIGHTS_BODY_INNER_CLASS}>
          <ShareableKit
            user={kit.user}
            posts={kit.posts}
            engagementRate={kit.engagementRate}
            showCreateBand={session == null}
          />
          <SupportFooter />
        </div>
      </div>
    </main>
  );
}
