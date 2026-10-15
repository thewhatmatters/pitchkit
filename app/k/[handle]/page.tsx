import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
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
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  PITCHKIT_ORIGIN,
  shareImagePath,
  sharePreview,
} from "@/lib/share-preview";
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

  const preview = sharePreview(kit);
  // og:image must be absolute and served by this deployment (previews too).
  const host = (await headers()).get("host");
  const local = host != null && /^(127\.0\.0\.1|localhost)(:|$)/.test(host);
  const origin = host ? `${local ? "http" : "https"}://${host}` : PITCHKIT_ORIGIN;
  const image = {
    url: `${origin}${shareImagePath(kit.user.handle)}`,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: preview.imageAlt,
    type: "image/png",
  };

  return {
    title: { absolute: preview.title },
    description: preview.description,
    alternates: { canonical: `${PITCHKIT_ORIGIN}${kitPath(kit.user.handle)}` },
    openGraph: {
      type: "profile",
      siteName: "Pitchkit",
      title: preview.title,
      description: preview.description,
      url: `${PITCHKIT_ORIGIN}${kitPath(kit.user.handle)}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: preview.title,
      description: preview.description,
      images: [{ url: image.url, alt: image.alt }],
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
    <main data-theme={kit.theme} className={CREATOR_INSIGHTS_PAGE_CLASS}>
      <div className={CREATOR_INSIGHTS_HEADER_BAND_CLASS}>
        <header className={PATTERN_TOPBAR_CLASS}>
          <span className={PATTERN_BRAND_CLASS}>Pitchkit</span>
        </header>
      </div>
      <div className={CREATOR_INSIGHTS_BODY_BAND_CLASS}>
        <div className={CREATOR_INSIGHTS_BODY_INNER_CLASS}>
          <ShareableKit
            user={kit.user}
            posts={kit.posts}
            engagementRate={kit.engagementRate}
            typicalReach={kit.typicalReach}
            typicalSaves={kit.typicalSaves}
            reachSeries={kit.reach_series}
            hasInsights={kit.hasInsights}
            countries={kit.audience?.country}
            intro={kit.intro}
            pastBrands={kit.past_brands}
            showCreateBand={session == null}
            hideEmpty
          />
        </div>
      </div>
      <SupportFooter />
    </main>
  );
}
