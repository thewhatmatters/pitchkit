import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankedSharesFromDemographics } from "./demographics";

describe("follower_demographics", () => {
  it("hides 0-row payloads and never uses followers as the denominator", () => {
    assert.deepEqual(
      rankedSharesFromDemographics({ data: [{ total_value: { breakdowns: [{ results: [] }] } }] }),
      [],
    );
    assert.deepEqual(rankedSharesFromDemographics({ data: [] }), []);
  });

  it("ranks percent of the located sample (top 45)", () => {
    const rows = rankedSharesFromDemographics({
      data: [
        {
          total_value: {
            breakdowns: [
              {
                results: [
                  { dimension_values: ["US"], value: 30 },
                  { dimension_values: ["CA"], value: 10 },
                  { dimension_values: ["XX"], value: 0 },
                ],
              },
            ],
          },
        },
      ],
    });
    assert.deepEqual(rows, [
      { label: "US", percent: 75 },
      { label: "CA", percent: 25 },
    ]);
    assert.equal(rows.reduce((sum, row) => sum + row.percent, 0), 100);
  });
});
