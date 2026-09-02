/**
 * Static Insights inventory of locked kit objects (WHA-299).
 * In-file examples only — not Postgres, not Graph, not live Instagram.
 * Seed Insights stay null; do not pretend they exist.
 */

export const INVENTORY_TITLE = "Static inventory";

export const INVENTORY_INTRO =
  "Locked kit objects for Design. Not a look lock. Ugly stacked Cards on purpose.";

export const EXAMPLE_DATA_NOTE = "example data, not live Instagram";

export const ENGAGEMENT_FORMULA = "(likes + comments) ÷ followers";

export const TYPICAL_REACH_CAPTION = "Unique accounts who usually see a post.";

export const TYPICAL_SAVES_CAPTION = "Typical post.";

export const CHART_SLOT_TITLE = "30-day reach chart";

export const CHART_SLOT_CAPTION =
  "Labeled empty slot. Not a 5th number. WMDS Chart is not in this app yet.";

export const SIX_POSTS_RANK = "Ranked saves, then reach, then likes. Last 30 days.";

export const COUNTRY_MIX_CAPTION =
  "percent of people Instagram located, not of all followers";

export const CITY_MIX_CAPTION = "Ranked city mix. Not hometown. Not pins.";

export const HIDDEN_WHEN_BLANK = "hidden when blank";

/** Instagram follower_demographics age bands. Do not invent others. */
export const AGE_BRACKETS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;

/** What Meta typically returns. Do not add buckets. */
export const GENDER_BUCKETS = ["female", "male", "unknown"] as const;

export const INVENTORY_ITEM_IDS = [
  "engagement-rate",
  "followers",
  "typical-reach",
  "saves",
  "reach-chart",
  "six-posts",
  "country-mix",
  "city-mix",
  "age-mix",
  "gender-mix",
  "bio",
  "website",
] as const;

export type InventoryItemId = (typeof INVENTORY_ITEM_IDS)[number];

export type RankedShare = {
  label: string;
  percent: number;
};

/** Example typical reach — seed media.reach stays null. */
export const EXAMPLE_TYPICAL_REACH = 2_400;

/** Example typical saves — seed media.saves stays null. */
export const EXAMPLE_TYPICAL_SAVES = 42;

export const EXAMPLE_COUNTRY_MIX: RankedShare[] = [
  { label: "United States", percent: 37 },
  { label: "United Kingdom", percent: 14 },
  { label: "Canada", percent: 9 },
  { label: "Australia", percent: 7 },
  { label: "Germany", percent: 5 },
];

export const EXAMPLE_CITY_MIX: RankedShare[] = [
  { label: "New York, United States", percent: 8 },
  { label: "Los Angeles, United States", percent: 6 },
  { label: "London, United Kingdom", percent: 5 },
  { label: "Toronto, Canada", percent: 4 },
  { label: "Austin, United States", percent: 3 },
];

export const EXAMPLE_AGE_MIX: RankedShare[] = [
  { label: "13-17", percent: 4 },
  { label: "18-24", percent: 28 },
  { label: "25-34", percent: 34 },
  { label: "35-44", percent: 18 },
  { label: "45-54", percent: 9 },
  { label: "55-64", percent: 5 },
  { label: "65+", percent: 2 },
];

export const EXAMPLE_GENDER_MIX: RankedShare[] = [
  { label: "female", percent: 61 },
  { label: "male", percent: 36 },
  { label: "unknown", percent: 3 },
];

/** Demo profile has no bio. Inventory shows the hide-when-blank pattern. */
export const INVENTORY_BIO: string | null = null;

/** Demo profile has no website. Inventory shows the hide-when-blank pattern. */
export const INVENTORY_WEBSITE: string | null = null;

export function formatShare(row: RankedShare): string {
  return `${row.label} ${row.percent}%`;
}
