import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ER_FORMULA, ER_TOOLTIP, GLOSSARY, LOCATED_SAMPLE_CAPTION } from "./glossary";

describe("glossary first sentences", () => {
  it("uses GLOSSARY.md first sentences as definitions — no invented copy", () => {
    assert.equal(
      GLOSSARY.engagementRate.definition,
      "Share of followers who interact with a typical post.",
    );
    assert.equal(GLOSSARY.followers.definition, "Accounts following this profile right now.");
    assert.equal(GLOSSARY.typicalReach.definition, "Unique accounts that usually see a post.");
    assert.equal(
      GLOSSARY.saves.definition,
      "People who bookmarked a typical post to come back.",
    );
    assert.equal(
      GLOSSARY.chart.definition,
      "Reach over the last 30 days so a brand (and the creator before they share) can see typical vs a spike.",
    );
    assert.equal(GLOSSARY.sixPosts.definition, "Recent work a brand can match to the public grid.");
    assert.equal(GLOSSARY.countryMix.definition, "Are they in my market?");
    assert.equal(GLOSSARY.cityMix.definition, "Which cities, same job finer.");
    assert.equal(GLOSSARY.ageMix.definition, "Are they the buying age?");
    assert.equal(GLOSSARY.genderMix.definition, "Does the split match the customer?");
    assert.equal(GLOSSARY.bio.definition, "IG User biography (Public).");
    assert.equal(GLOSSARY.website.definition, "IG User website (Public).");
  });

  it("keeps the locked ER formula and of-followers tooltip", () => {
    assert.equal(ER_FORMULA, "(likes + comments) ÷ followers");
    assert.equal(ER_TOOLTIP, "of followers, likes + comments only");
  });

  it("says mix percents are of people Instagram located, not of followers", () => {
    assert.match(LOCATED_SAMPLE_CAPTION, /people Instagram located/);
    assert.match(LOCATED_SAMPLE_CAPTION, /not of the follower total/);
    assert.match(LOCATED_SAMPLE_CAPTION, /less than 100%/);
    assert.equal(GLOSSARY.countryMix.help, LOCATED_SAMPLE_CAPTION);
    assert.equal(GLOSSARY.ageMix.help, LOCATED_SAMPLE_CAPTION);
    assert.equal(GLOSSARY.genderMix.help, LOCATED_SAMPLE_CAPTION);
    assert.match(GLOSSARY.cityMix.help, /hometown/);
    assert.match(GLOSSARY.cityMix.help, /people Instagram located/);
  });
});
