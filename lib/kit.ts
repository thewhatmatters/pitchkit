import type { RankedShare } from "./audience";
import { engagementRate, typicalFromPosts } from "./engagement";
import {
  EMPTY_KIT_PROFILE,
  PITCHKIT_THEME_DEFAULT,
  type KitProfile,
  type PastBrand,
  type PitchKitTheme,
} from "./kit-profile";
import { isUtcDay, shouldShowReachChart, type ReachPoint } from "./reach-series";
import type { Media, User } from "./schema";

export type { ReachPoint } from "./reach-series";
export { isUtcDay };

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type KitAudience = {
  country: RankedShare[];
  city: RankedShare[];
  age: RankedShare[];
  gender: RankedShare[];
};

export type PublicKit = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  hasInsights: boolean;
  /**
   * One series: account reach (stories + ads).
   * Insights missing → omit (graph-unavailable). Unusable series → []
   * (insufficient-reach empty band). Do not zero-fill a missing window.
   */
  reach_series?: ReachPoint[];
  typicalReach: number | null;
  typicalSaves: number | null;
  /** Owner Insights only. Live Graph or empty — never EXAMPLE percents. */
  audience?: KitAudience;
  /** Pitchkit-owned intro. Empty → public omit. */
  intro: string | null;
  /** Ordered `{ id, name, logo_key?, result_label? }`. Empty → public omit. */
  past_brands: PastBrand[];
  /** Public kit appearance. Default light. */
  theme: PitchKitTheme;
  /** When the Insights shown were polled (ISO). null → no poll yet. */
  polled_at: string | null;
  /** graph = polled from Instagram Insights; example = seed demo data (labelled, never "Verified"). */
  source: KitDataSource;
};

export type KitDataSource = "graph" | "example";

export type AssembleKitOptions = {
  /** Seed/example or poll-derived. Ignored when Insights are missing. */
  reach_series?: ReachPoint[];
  audience?: KitAudience;
  intro?: string | null;
  past_brands?: PastBrand[];
  theme?: PitchKitTheme;
  polled_at?: string | null;
  source?: KitDataSource;
};

/** Instagram returns follower_demographics only for accounts with 100+ followers. */
export const AUDIENCE_MIN_FOLLOWERS = 100;
/** Public audience block: top N countries and cities (Modash baseline is 5). */
export const PUBLIC_AUDIENCE_TOP = 5;

export type PublicAudience =
  | { state: "min-followers" }
  | { state: "empty" }
  | { state: "ready"; age: RankedShare[]; gender: RankedShare[]; country: RankedShare[]; city: RankedShare[] };

const visible = (rows: readonly RankedShare[] | null | undefined) =>
  (rows ?? []).filter((row) => Number.isFinite(row.percent) && row.percent > 0);

/** Full audience for the public kit. Under 100 followers Instagram has none, so say so instead of empty cells. */
export function publicAudience(audience: KitAudience | null | undefined, followers: number): PublicAudience {
  if (followers < AUDIENCE_MIN_FOLLOWERS) {
    return { state: "min-followers" };
  }
  const byPercent = (rows: readonly RankedShare[] | null | undefined) =>
    [...visible(rows)].sort((a, b) => b.percent - a.percent);
  const age = visible(audience?.age);
  const gender = byPercent(audience?.gender);
  const country = byPercent(audience?.country).slice(0, PUBLIC_AUDIENCE_TOP);
  const city = byPercent(audience?.city).slice(0, PUBLIC_AUDIENCE_TOP);
  if (!age.length && !gender.length && !country.length && !city.length) {
    return { state: "empty" };
  }
  return { state: "ready", age, gender, country, city };
}

/** Typical reach as a whole percent of followers. null when either is missing or followers is 0. */
export function reachToFollowerPercent(typicalReach: number | null, followers: number): number | null {
  if (typicalReach == null || !Number.isFinite(typicalReach) || !(followers > 0)) {
    return null;
  }
  return Math.round((typicalReach / followers) * 100);
}

/** Stamp time, deterministic on server and client: "Sep 2, 2026, 12:00 PM UTC". */
export function formatPolledAt(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

/** Public kit reach well — always keep the Card. Chart only when plottable. */
export type PublicReachState = "resolved" | "insufficient";

export function publicReachState(
  hasInsights: boolean,
  series?: ReachPoint[] | null,
): PublicReachState {
  return hasInsights && shouldShowReachChart(series) ? "resolved" : "insufficient";
}

export function kitPath(handle: string) {
  return `/k/${handle}`;
}

/** Missing Insights sort last, then saves, reach, likes (all descending). */
export function compareMediaRank(a: Media, b: Media): number {
  const saves = compareNullableDesc(a.saves, b.saves);
  if (saves !== 0) {
    return saves;
  }

  const reach = compareNullableDesc(a.reach, b.reach);
  if (reach !== 0) {
    return reach;
  }

  return b.like_count - a.like_count;
}

function compareNullableDesc(a: number | null, b: number | null): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  return b - a;
}

/** Public kit only: drop hidden rows before `selectSixPosts`. */
export function excludeHiddenFromPublicKit(media: Media[]): Media[] {
  return media.filter((row) => row.hidden_from_kit_at == null);
}

/**
 * Six posts: last 30 days, ranked saves then reach then likes.
 * Fill from older fetched posts only if we do not have six in-window.
 */
export function selectSixPosts(media: Media[], now: Date = new Date()): Media[] {
  const windowStart = now.getTime() - THIRTY_DAYS_MS;
  const inWindow: Media[] = [];
  const older: Media[] = [];

  for (const row of media) {
    if (new Date(row.posted_at).getTime() >= windowStart) {
      inWindow.push(row);
    } else {
      older.push(row);
    }
  }

  const picked = [...inWindow].sort(compareMediaRank).slice(0, 6);
  if (picked.length < 6) {
    picked.push(...[...older].sort(compareMediaRank).slice(0, 6 - picked.length));
  }

  return picked;
}

/** Insights missing → hide Engagement rate (or —); hide reach, saves, and the chart. */
export function kitHasInsights(posts: Media[]): boolean {
  return posts.some(
    (post) =>
      post.insights_fetched_at != null ||
      post.reach != null ||
      post.saves != null ||
      post.shares != null ||
      post.impressions != null,
  );
}

export function assemblePublicKit(
  user: User,
  media: Media[],
  now: Date = new Date(),
  options: AssembleKitOptions = {},
): PublicKit | null {
  if (user.disconnected_at) {
    return null;
  }

  const posts = selectSixPosts(media, now);
  const typical = typicalFromPosts(posts);
  const hasInsights = kitHasInsights(posts);

  return {
    user,
    posts,
    engagementRate: engagementRate(posts),
    hasInsights,
    typicalReach: typical.typicalReach,
    typicalSaves: typical.typicalSaves,
    // Insights missing → omit (graph-unavailable). Unusable series → [] (empty band).
    ...(hasInsights
      ? {
          reach_series: shouldShowReachChart(options.reach_series)
            ? (options.reach_series ?? [])
            : [],
        }
      : {}),
    ...(options.audience ? { audience: options.audience } : {}),
    intro: options.intro ?? EMPTY_KIT_PROFILE.intro,
    past_brands: options.past_brands ?? EMPTY_KIT_PROFILE.past_brands,
    theme: options.theme ?? PITCHKIT_THEME_DEFAULT,
    polled_at: options.polled_at ?? null,
    source: options.source ?? "graph",
  };
}

export function attachKitProfile<T extends object>(kit: T, profile: KitProfile): T & KitProfile {
  return {
    ...kit,
    intro: profile.intro,
    past_brands: profile.past_brands,
    theme: profile.theme,
  };
}
