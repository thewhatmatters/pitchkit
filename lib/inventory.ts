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

export const NAME_CAPTION = "Sourced identity from the demo seed when present.";

export const USERNAME_CAPTION = "Frozen Pitchkit handle.";

export const PHOTO_CAPTION = "Avatar from the demo seed when present.";

export const LAST_UPDATED_CAPTION =
  "Seed media fetched_at. Not a live Graph timestamp.";

export const CONTACT_CAPTION =
  "Typed hole (email door). Hidden when blank. Do not invent an address.";

export const PAST_BRANDS_CAPTION =
  "Typed hole (proof). Hidden when blank. Not a highlights gallery.";

/** Instagram follower_demographics age bands. Do not invent others. */
export const AGE_BRACKETS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;

/** What Meta typically returns. Do not add buckets. */
export const GENDER_BUCKETS = ["female", "male", "unknown"] as const;

/** Identity / typed holes added for Design. Not extra Postgres columns. */
export const IDENTITY_SLOT_IDS = [
  "name",
  "username",
  "photo",
  "last-updated",
  "contact",
  "past-brands",
] as const;

/** Original WHA-299 locked kit objects. Keep all 12. */
export const LOCKED_KIT_OBJECT_IDS = [
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

export const INVENTORY_ITEM_IDS = [...IDENTITY_SLOT_IDS, ...LOCKED_KIT_OBJECT_IDS] as const;

export type IdentitySlotId = (typeof IDENTITY_SLOT_IDS)[number];
export type LockedKitObjectId = (typeof LOCKED_KIT_OBJECT_IDS)[number];
export type InventoryItemId = (typeof INVENTORY_ITEM_IDS)[number];

/**
 * First sentence only from GLOSSARY.md (PR 2 / cursor/v1-stats-lock-43e8).
 * Tooltip = first sentence. Do not invent if a term is missing.
 */
export const GLOSSARY_FIRST_SENTENCE: Partial<Record<InventoryItemId, string>> = {
  "engagement-rate": "Share of followers who interact with a typical post.",
  followers: "Accounts following this profile right now.",
  "typical-reach": "Unique accounts that usually see a post.",
  saves: "People who bookmarked a typical post to come back.",
  "reach-chart":
    "Reach over the last 30 days so a brand (and the creator before they share) can see typical vs a spike.",
  "six-posts": "Recent work a brand can match to the public grid.",
  "country-mix": "Are they in my market?",
  "city-mix": "Which cities, same job finer.",
  "age-mix": "Are they the buying age?",
  "gender-mix": "Does the split match the customer?",
  bio: "IG User `biography` (Public).",
  website: "IG User `website` (Public).",
};

export const GLOSSARY_DEFINITION_MISSING = "Definition missing — GLOSSARY.md";

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

/** Typed hole — email door. Do not invent an address. Not a Postgres column. */
export const INVENTORY_CONTACT: string | null = null;

/** Typed hole — past brand proof. Not a highlights gallery. Not a Postgres column. */
export const INVENTORY_PAST_BRANDS: readonly string[] = [];

export function formatShare(row: RankedShare): string {
  return `${row.label} ${row.percent}%`;
}

export function sourcedText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Last-updated from seed media fetched_at when present.
 * Do not invent a live Graph timestamp or use Date.now().
 */
export function inventoryLastUpdated(
  posts: { fetched_at: string | null }[],
): string | null {
  const stamps = posts
    .map((row) => sourcedText(row.fetched_at))
    .filter((value): value is string => value != null);
  if (stamps.length === 0) {
    return null;
  }
  return stamps.reduce((latest, stamp) => (stamp > latest ? stamp : latest));
}
