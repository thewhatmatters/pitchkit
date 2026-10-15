import { formatCount, formatEngagementRate } from "./engagement";
import { publicReachState, type PublicKit } from "./kit";
import { DEMO_HANDLE } from "./seed";

/** Link-preview card size (Apple TN3156: ≥900px wide). */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const PITCHKIT_ORIGIN = "https://pitchkit.app";
export const SHARE_DESCRIPTION_GENERIC =
  "Instagram media kit with recent posts, verified from Instagram Insights.";
/** Under this many followers the card and description never show the count. */
export const SHARE_MIN_FOLLOWERS = 100;

export type SharePreview = {
  title: string;
  description: string;
  imageAlt: string;
  /** null → show the "Instagram media kit" pill instead of numbers. */
  kpis: { followers: string; engagement: string | null } | null;
  example: boolean;
};

/** Never site name in the title (TN3156). Never a small or zero number on the card. */
export function sharePreview(kit: Pick<PublicKit, "user" | "engagementRate" | "hasInsights" | "reach_series">): SharePreview {
  const { user } = kit;
  const name = user.name?.trim() || `@${user.handle}`;
  const title = user.name?.trim() ? `${name} (@${user.handle})` : `@${user.handle}`;
  const resolved = publicReachState(kit.hasInsights, kit.reach_series) === "resolved";
  const engagement = resolved && kit.engagementRate != null ? kit.engagementRate : null;
  const example = user.handle === DEMO_HANDLE;
  const enough = user.followers >= SHARE_MIN_FOLLOWERS;
  const kpis = enough
    ? {
        followers: formatCount(user.followers),
        engagement: engagement != null ? formatEngagementRate(engagement) : null,
      }
    : null;
  let description = SHARE_DESCRIPTION_GENERIC;
  if (kpis) {
    const parts = [`${kpis.followers} followers`];
    if (kpis.engagement) parts.push(`${kpis.engagement} engagement`);
    description = example
      ? `Example Instagram media kit: ${parts.join(", ")}. Example data.`
      : `Instagram media kit: ${parts.join(", ")}. Numbers verified from Instagram Insights.`;
  } else if (example) {
    description = "Example Instagram media kit with recent posts. Example data.";
  }
  return { title, description, imageAlt: `${name}’s Pitchkit media kit`, kpis, example };
}

export function shareImagePath(handle: string): string {
  return `/k/${encodeURIComponent(handle)}/og`;
}
