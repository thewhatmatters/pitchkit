import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  AUDIENCE_EMPTY_BADGE,
  AUDIENCE_EMPTY_NEXT,
  POSTS_SYNC_NOTE,
  audienceUnderMinProgress,
  audienceUnderMinTitle,
  fewPostsBadge,
  fewPostsProgress,
} from "./copy";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(tsx?|mdx?)$/.test(name) && !name.endsWith(".test.ts")) out.push(path);
  }
  return out;
}

describe("empty-state copy", () => {
  it("uses Product Designer's exact sync wording", () => {
    assert.equal(AUDIENCE_EMPTY_BADGE, "Updates when you open Pitchkit");
    assert.equal(
      AUDIENCE_EMPTY_NEXT,
      "We check again each time you open Insights or Settings, or tap Refresh.",
    );
    assert.equal(POSTS_SYNC_NOTE, "New Instagram posts show up the next time your numbers refresh.");
  });

  it("never promises a daily sync in app or lib code", () => {
    for (const file of [...walk("app"), ...walk("components"), ...walk("lib")]) {
      const text = readFileSync(file, "utf8");
      assert.doesNotMatch(text, /Checking daily|We check every day|within a day/i, file);
    }
  });

  it("counts toward 100 followers and 4 posts", () => {
    assert.equal(audienceUnderMinTitle(64), "36 followers to go");
    assert.equal(audienceUnderMinTitle(99), "1 follower to go");
    assert.equal(audienceUnderMinProgress(64), "64 of 100 followers");
    assert.equal(fewPostsBadge(1), "1 post");
    assert.equal(fewPostsBadge(2), "2 posts");
    assert.equal(fewPostsProgress(2), "2 of 4 posts so far.");
  });
});
