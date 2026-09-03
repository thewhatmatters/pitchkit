import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  AGE_BRACKETS,
  CHART_SLOT_TITLE,
  CONTACT_CAPTION,
  COUNTRY_MIX_CAPTION,
  ENGAGEMENT_FORMULA,
  EXAMPLE_AGE_MIX,
  EXAMPLE_CITY_MIX,
  EXAMPLE_COUNTRY_MIX,
  EXAMPLE_DATA_NOTE,
  EXAMPLE_GENDER_MIX,
  GENDER_BUCKETS,
  GLOSSARY_FIRST_SENTENCE,
  HIDDEN_WHEN_BLANK,
  IDENTITY_SLOT_IDS,
  INVENTORY_BIO,
  INVENTORY_CONTACT,
  INVENTORY_ITEM_IDS,
  INVENTORY_PAST_BRANDS,
  INVENTORY_WEBSITE,
  LAST_UPDATED_CAPTION,
  LOCKED_KIT_OBJECT_IDS,
  PAST_BRANDS_CAPTION,
  formatShare,
  inventoryLastUpdated,
  sourcedText,
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
  it("keeps the original 12 kit objects and adds identity / typed-hole slots", () => {
    assert.deepEqual([...LOCKED_KIT_OBJECT_IDS], [
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
    assert.deepEqual([...IDENTITY_SLOT_IDS], [
      "name",
      "username",
      "photo",
      "last-updated",
      "contact",
      "past-brands",
    ]);
    assert.deepEqual([...INVENTORY_ITEM_IDS], [
      ...IDENTITY_SLOT_IDS,
      ...LOCKED_KIT_OBJECT_IDS,
    ]);
    assert.equal(LOCKED_KIT_OBJECT_IDS.length, 12);
    assert.equal(INVENTORY_ITEM_IDS.length, 18);
    assert.match(ENGAGEMENT_FORMULA, /likes \+ comments/);
    assert.equal(CHART_SLOT_TITLE, "30-day reach chart");
    assert.match(COUNTRY_MIX_CAPTION, /Instagram located/);
    assert.match(COUNTRY_MIX_CAPTION, /not of all followers/);
    assert.match(EXAMPLE_DATA_NOTE, /example data, not live Instagram/);
    assert.match(CONTACT_CAPTION, /email door/);
    assert.match(PAST_BRANDS_CAPTION, /Not a highlights gallery/);
    assert.match(LAST_UPDATED_CAPTION, /Not a live Graph timestamp/);
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

  it("keeps bio/website/contact/geo off Postgres; hide-when-blank typed holes", () => {
    for (const column of [
      "bio",
      "website",
      "country",
      "city",
      "age",
      "gender",
      "hometown",
      "contact",
      "email",
      "past_brands",
    ]) {
      assert.equal((USER_COLUMNS as readonly string[]).includes(column), false, column);
      assert.equal(column in seedUser, false, column);
    }
    assert.equal(INVENTORY_BIO, null);
    assert.equal(INVENTORY_WEBSITE, null);
    assert.equal(INVENTORY_CONTACT, null);
    assert.deepEqual([...INVENTORY_PAST_BRANDS], []);
    assert.equal(HIDDEN_WHEN_BLANK, "hidden when blank");
    assert.equal(
      seedMedia.every((row) => row.reach == null && row.saves == null),
      true,
    );
  });

  it("sources name, username, photo, and last-updated from the demo seed", () => {
    assert.equal(sourcedText(seedUser.name), "Demo Creator");
    assert.equal(sourcedText(""), null);
    assert.equal(sourcedText("  "), null);
    assert.equal(seedUser.handle, "demo");
    assert.equal(seedUser.avatar_r2_key, `${seedUser.id}/avatar.jpg`);
    assert.equal(inventoryLastUpdated(seedMedia), "2026-09-02T12:00:00.000Z");
    assert.equal(inventoryLastUpdated([]), null);
    assert.equal(inventoryLastUpdated([{ fetched_at: null }]), null);
    assert.equal(
      inventoryLastUpdated([
        { fetched_at: "2026-08-01T00:00:00.000Z" },
        { fetched_at: "2026-09-02T12:00:00.000Z" },
      ]),
      "2026-09-02T12:00:00.000Z",
    );
  });

  it("copies the first GLOSSARY.md sentence only when the term exists", () => {
    const glossary = readFileSync(join(process.cwd(), "GLOSSARY.md"), "utf8");
    assert.match(glossary, /Tooltip = first sentence/);
    for (const id of LOCKED_KIT_OBJECT_IDS) {
      const sentence = GLOSSARY_FIRST_SENTENCE[id];
      assert.ok(sentence, id);
      assert.match(sentence, /[.]$|[?]$/, id);
      assert.equal(glossary.includes(sentence), true, id);
    }
    for (const id of IDENTITY_SLOT_IDS) {
      assert.equal(GLOSSARY_FIRST_SENTENCE[id], undefined, id);
    }
    assert.equal(Object.keys(GLOSSARY_FIRST_SENTENCE).length, 12);
  });
});
