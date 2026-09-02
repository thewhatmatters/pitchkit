/**
 * First-sentence definitions from GLOSSARY.md (pitchkit PR 2,
 * branch cursor/v1-stats-lock-43e8). Tooltip = first sentence.
 * Longer help sits under the number or chart slot. Do not invent.
 */

export type GlossaryEntry = {
  name: string;
  /** Tooltip / definition — first sentence in GLOSSARY.md. */
  definition: string;
  /** Longer help under the number or chart slot. */
  help: string;
};

export const ER_FORMULA = "(likes + comments) ÷ followers";

export const ER_TOOLTIP = "of followers, likes + comments only";

/** Country / city / age / gender — % of located sample, never of followers_count. */
export const LOCATED_SAMPLE_CAPTION =
  "Percents are of the people Instagram located, not of the follower total. Bars can add up to less than 100% of followers.";

export const GLOSSARY = {
  engagementRate: {
    name: "Engagement rate",
    definition: "Share of followers who interact with a typical post.",
    help: "Brands use this first: is the audience real, or a quiet list? Average recent posts: (likes + comments) ÷ followers. A smaller account with a high ER often beats a big one that nobody talks to.",
  },
  followers: {
    name: "Followers",
    definition: "Accounts following this profile right now.",
    help: "Scale only. Not how many people saw the last post. Read next to typical reach: a big follow with tiny reach is a warning.",
  },
  typicalReach: {
    name: "Typical reach",
    definition: "Unique accounts that usually see a post.",
    help: "This is what a brand is buying — not the follower total, not one viral. Median of recent posts, not a best-ever spike.",
  },
  saves: {
    name: "Saves",
    definition: "People who bookmarked a typical post to come back.",
    help: "Intent, not applause. Stronger commercial signal than a like.",
  },
  chart: {
    name: "30-day chart",
    definition:
      "Reach over the last 30 days so a brand (and the creator before they share) can see typical vs a spike.",
    help: "Never paint an empty chart as zeros. This is not the same number as typical post reach.",
  },
  sixPosts: {
    name: "Six posts",
    definition: "Recent work a brand can match to the public grid.",
    help: "Likes-first would look like a vanity kit. Ranked saves → reach → likes.",
  },
  countryMix: {
    name: "Country mix",
    definition: "Are they in my market?",
    help: LOCATED_SAMPLE_CAPTION,
  },
  cityMix: {
    name: "City mix",
    definition: "Which cities, same job finer.",
    help: `Audience city ≠ hometown. Do not label this as the creator’s hometown. ${LOCATED_SAMPLE_CAPTION}`,
  },
  ageMix: {
    name: "Age mix",
    definition: "Are they the buying age?",
    help: LOCATED_SAMPLE_CAPTION,
  },
  genderMix: {
    name: "Gender mix",
    definition: "Does the split match the customer?",
    help: LOCATED_SAMPLE_CAPTION,
  },
  bio: {
    name: "Bio",
    definition: "IG User biography (Public).",
    help: "Hide if empty. Not a Stat. Not a typed Later blurb.",
  },
  website: {
    name: "Website",
    definition: "IG User website (Public).",
    help: "Hide if empty. Not a Stat.",
  },
} as const satisfies Record<string, GlossaryEntry>;
