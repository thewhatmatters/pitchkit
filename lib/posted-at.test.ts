import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatPostedAt } from "./posted-at";

describe("formatPostedAt", () => {
  it("formats en-US short month + day + year in UTC", () => {
    assert.equal(formatPostedAt("2024-12-17T14:00:00.000Z"), "Dec 17, 2024");
    assert.equal(formatPostedAt("2026-08-28T14:00:00.000Z"), "Aug 28, 2026");
  });

  it("hides invalid stamps", () => {
    assert.equal(formatPostedAt("not-a-date"), "");
  });
});
