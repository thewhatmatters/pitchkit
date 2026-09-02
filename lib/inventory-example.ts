import { EXAMPLE_DATA_BANNER, INVENTORY_BIO_EXAMPLE, INVENTORY_WEBSITE_EXAMPLE } from "./copy";
import { engagementRate } from "./engagement";
import { compareMediaRank } from "./kit";
import type { Media } from "./schema";

/** Meta `follower_demographics` gender buckets. Do not invent more. */
export const META_GENDER_BUCKETS = ["F", "M", "U"] as const;

export type MetaGenderBucket = (typeof META_GENDER_BUCKETS)[number];

/** Instagram age brackets. Do not invent other bands. */
export const AGE_BRACKETS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;

export type AgeBracket = (typeof AGE_BRACKETS)[number];

export type RankedShare = {
  label: string;
  percent: number;
};

export type GenderShare = {
  bucket: MetaGenderBucket;
  label: string;
  percent: number;
};

export type AgeShare = {
  bracket: AgeBracket;
  percent: number;
};

export type InventoryPost = Media & {
  saves: number;
  reach: number;
};

/**
 * Example Insights overlays on demo posts so ranking is visible.
 * Keys are seed `ig_media_id`. Likes stay from the public seed.
 */
export const EXAMPLE_POST_INSIGHTS: Record<string, { saves: number; reach: number }> = {
  "demo-4": { saves: 410, reach: 6200 },
  "demo-6": { saves: 410, reach: 5100 },
  "demo-2": { saves: 300, reach: 9000 },
  "demo-1": { saves: 220, reach: 8000 },
  "demo-5": { saves: 80, reach: 4000 },
  "demo-3": { saves: 40, reach: 3500 },
};

/** Example country mix — ranked % of the located sample, not of all followers. */
export const EXAMPLE_COUNTRY_MIX: RankedShare[] = [
  { label: "United States", percent: 37 },
  { label: "United Kingdom", percent: 14 },
  { label: "Canada", percent: 11 },
  { label: "Australia", percent: 8 },
  { label: "Germany", percent: 6 },
  { label: "France", percent: 5 },
  { label: "Mexico", percent: 4 },
];

/** Example city mix — not hometown, not pins. */
export const EXAMPLE_CITY_MIX: RankedShare[] = [
  { label: "Los Angeles, California", percent: 9 },
  { label: "New York, New York", percent: 7 },
  { label: "London, United Kingdom", percent: 5 },
  { label: "Toronto, Canada", percent: 4 },
  { label: "Austin, Texas", percent: 3 },
];

/** Example age mix — API brackets only. */
export const EXAMPLE_AGE_MIX: AgeShare[] = [
  { bracket: "13-17", percent: 4 },
  { bracket: "18-24", percent: 28 },
  { bracket: "25-34", percent: 34 },
  { bracket: "35-44", percent: 18 },
  { bracket: "45-54", percent: 9 },
  { bracket: "55-64", percent: 5 },
  { bracket: "65+", percent: 2 },
];

/** Example gender mix — Meta F / M / U only. */
export const EXAMPLE_GENDER_MIX: GenderShare[] = [
  { bucket: "F", label: "Female", percent: 62 },
  { bucket: "M", label: "Male", percent: 35 },
  { bucket: "U", label: "Unknown", percent: 3 },
];

export type ExampleInventory = {
  banner: string;
  example: true;
  followers: number;
  engagementRate: number | null;
  typicalReach: number;
  typicalSaves: number;
  posts: InventoryPost[];
  countryMix: RankedShare[];
  cityMix: RankedShare[];
  ageMix: AgeShare[];
  genderMix: GenderShare[];
  bio: string;
  website: string;
};

export function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error("median of empty list");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

/** Overlay example saves/reach on seed posts and rank saves → reach → likes. */
export function exampleRankedPosts(posts: Media[]): InventoryPost[] {
  const overlaid: InventoryPost[] = posts.map((post) => {
    const overlay = EXAMPLE_POST_INSIGHTS[post.ig_media_id];
    return {
      ...post,
      saves: overlay?.saves ?? 0,
      reach: overlay?.reach ?? 0,
    };
  });

  return [...overlaid].sort(compareMediaRank);
}

/**
 * Fully filled EXAMPLE inventory for Design.
 * Does not mutate the public `/k/demo` seed (Insights stay missing there).
 */
export function buildExampleInventory(posts: Media[], followers = 10_000): ExampleInventory {
  const ranked = exampleRankedPosts(posts);

  return {
    banner: EXAMPLE_DATA_BANNER,
    example: true,
    followers,
    engagementRate: engagementRate(ranked, followers),
    typicalReach: median(ranked.map((post) => post.reach)),
    typicalSaves: median(ranked.map((post) => post.saves)),
    posts: ranked,
    countryMix: EXAMPLE_COUNTRY_MIX,
    cityMix: EXAMPLE_CITY_MIX,
    ageMix: EXAMPLE_AGE_MIX,
    genderMix: EXAMPLE_GENDER_MIX,
    bio: INVENTORY_BIO_EXAMPLE,
    website: INVENTORY_WEBSITE_EXAMPLE,
  };
}
