import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AGE_BRACKETS,
  CHART_SLOT_TITLE,
  COUNTRY_MIX_CAPTION,
  ENGAGEMENT_FORMULA,
  EXAMPLE_AGE_MIX,
  EXAMPLE_CITY_MIX,
  EXAMPLE_COUNTRY_MIX,
  EXAMPLE_DATA_NOTE,
  EXAMPLE_GENDER_MIX,
  GENDER_BUCKETS,
  HIDDEN_WHEN_BLANK,
  INVENTORY_BIO,
  INVENTORY_ITEM_IDS,
  INVENTORY_WEBSITE,
  formatShare,
} from "./inventory";
import { USER_COLUMNS } from "./schema";
import { seedMedia, seedUser } from "./seed";

const FORBIDDEN = [
  "rates",
  "stories",
  "impressions",
  "hometown",
  "industry",
  "profile views",
  "bio-link clicks",
];

describe("insights static inventory", () => {
  it("locks all 12 kit objects and no forbidden extras", () => {
    assert.deepEqual([...INVENTORY_ITEM_IDS], [
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
    ]);
    assert.equal(INVENTORY_ITEM_IDS.length, 12);
    assert.match(ENGAGEMENT_FORMULA, /likes \+ comments/);
    assert.equal(CHART_SLOT_TITLE, "30-day reach chart");
    assert.match(COUNTRY_MIX_CAPTION, /Instagram located/);
    assert.match(COUNTRY_MIX_CAPTION, /not of all followers/);
    assert.match(EXAMPLE_DATA_NOTE, /example data, not live Instagram/);
    for (const word of FORBIDDEN) {
      assert.equal(
        INVENTORY_ITEM_IDS.some((id) => id.includes(word.replaceAll(" ", "-"))),
        false,
        word,
      );
    }
  });

  it("uses API-style age brackets and Meta gender buckets only", () => {
    assert.deepEqual([...AGE_BRACKETS], ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"]);
    assert.deepEqual(
      EXAMPLE_AGE_MIX.map((row) => row.label),
      [...AGE_BRACKETS],
    );
    assert.deepEqual([...GENDER_BUCKETS], ["female", "male", "unknown"]);
    assert.deepEqual(
      EXAMPLE_GENDER_MIX.map((row) => row.label),
      [...GENDER_BUCKETS],
    );
    assert.equal(
      EXAMPLE_CITY_MIX.some((row) => /hometown/i.test(row.label)),
      false,
    );
    assert.equal(formatShare(EXAMPLE_COUNTRY_MIX[0]!), "United States 37%");
  });

  it("keeps bio/website/geo off Postgres and seed; hide-when-blank when empty", () => {
    for (const column of ["bio", "website", "country", "city", "age", "gender", "hometown"]) {
      assert.equal((USER_COLUMNS as readonly string[]).includes(column), false, column);
      assert.equal(column in seedUser, false, column);
    }
    assert.equal(INVENTORY_BIO, null);
    assert.equal(INVENTORY_WEBSITE, null);
    assert.equal(HIDDEN_WHEN_BLANK, "hidden when blank");
    assert.equal(
      seedMedia.every((row) => row.reach == null && row.saves == null),
      true,
    );
  });
});
