import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
}

/** User-facing brand is "Pitchkit". "PitchKit" may live only in identifiers and comments. */
describe("wordmark", () => {
  const sources = [...files("app"), ...files("components"), "lib/copy.ts"];
  for (const path of sources) {
    it(`${path} never shows "PitchKit" to users`, () => {
      const source = readFileSync(path, "utf8");
      assert.doesNotMatch(source, />[^<{\n]*\bPitchKit\b[^<\n]*</);
      assert.doesNotMatch(source, /"[^"\n]*\bPitchKit\b[^"\n]*"/);
      assert.doesNotMatch(source, /'[^'\n]*\bPitchKit\b[^'\n]*'/);
    });
  }

  it("public kit header reads Pitchkit", () => {
    assert.match(readFileSync("app/k/[handle]/page.tsx", "utf8"), />Pitchkit<\/span>/);
  });
});

describe("post card metrics fit 2-across", () => {
  it("uses a flex row with WMDS gap-2, not a fixed 2-col grid", () => {
    const tokens = readFileSync("components/pattern-tokens.ts", "utf8");
    assert.match(tokens, /PATTERN_KIT_POST_METRICS_CLASS = "flex w-full justify-between gap-2"/);
    assert.match(readFileSync("components/shareable-kit.tsx", "utf8"), /\["Comments", post\.comments_count\]/);
  });
});
