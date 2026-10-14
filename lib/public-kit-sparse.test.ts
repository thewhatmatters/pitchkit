import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  PATTERN_PUBLIC_STAT_CLASS,
  PATTERN_PUBLIC_STAT_SOLO_CLASS,
  publicStatClass,
} from "@/components/pattern-tokens";
import { publicStats } from "./public-stats";

function read(rel: string) {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("public kit hides empty sections from brands", () => {
  it("drops stats with no value; never a dash", () => {
    const stats = publicStats({
      followers: 10000,
      engagement: null,
      typicalReach: null,
      typicalSaves: null,
      hideEmpty: true,
    });
    assert.deepEqual(stats.map((s) => s.label), ["Followers"]);
    assert.ok(stats.every((s) => s.value !== "—"));
  });

  it("owner view keeps the dash placeholders", () => {
    const stats = publicStats({
      followers: 10,
      engagement: null,
      typicalReach: null,
      typicalSaves: null,
      hideEmpty: false,
    });
    assert.deepEqual(stats.map((s) => s.value), ["10", "—", "—"]);
  });

  it("full data keeps all four stats", () => {
    const stats = publicStats({
      followers: 10000,
      engagement: 0.042,
      typicalReach: 3200,
      typicalSaves: 120,
      hideEmpty: true,
    });
    assert.equal(stats.length, 4);
  });

  it("a lone stat spans the full width; four stay on the grid spine", () => {
    assert.equal(publicStatClass(0, 1), PATTERN_PUBLIC_STAT_SOLO_CLASS);
    assert.match(PATTERN_PUBLIC_STAT_SOLO_CLASS, /\bcol-span-full\b/);
    assert.match(publicStatClass(0, 3), /\bcol-span-full\b/);
    assert.equal(publicStatClass(3, 4), PATTERN_PUBLIC_STAT_CLASS);
  });

  it("/k/<handle> opts into hideEmpty; reach, posts and brands obey it", () => {
    assert.match(read("app/k/[handle]/page.tsx"), /\bhideEmpty\b/);
    const kit = read("components/shareable-kit.tsx");
    assert.match(kit, /showReach \? \(/);
    assert.match(kit, /showPosts \? \(/);
    assert.match(kit, /showStack \? \(/);
    assert.match(kit, /PATTERN_PUBLIC_POST_CARD_CLASS/);
    assert.match(kit, /<PublicPastBrands brands=\{pastBrands\} wrap=\{hideEmpty\} \/>/);
    assert.match(read("components/past-brands.tsx"), /const wrapRow = wrap \|\| reduceMotion/);
    // The off-screen measure row would widen the page at 390; skip it when wrapping.
    assert.match(read("components/past-brands.tsx"), /\{wrap \? null : \(\n\s+<ul ref=\{measureRef\}/);
  });

  it("wrapped brands skip the off-screen measure row (no sideways scroll at 390)", () => {
    assert.match(read("components/past-brands.tsx"), /\{wrap \? null : \(/);
  });

  it("public posts are 2-up on mobile", () => {
    assert.match(read("components/pattern-tokens.ts"), /PATTERN_PUBLIC_POST_CARD_CLASS = "col-span-2 /);
  });
});

describe("help and privacy reading layout", () => {
  for (const rel of ["app/help/page.tsx", "app/privacy/page.tsx"]) {
    it(`${rel} uses the reading column`, () => {
      assert.match(read(rel), /<PageCard title="[A-Za-z]+" reading>/);
    });
  }

  it("reading column is a Tailwind max-w token, centered", () => {
    assert.match(read("components/pattern-tokens.ts"), /PATTERN_READING_COLUMN_CLASS = "col-span-full mx-auto w-full max-w-2xl"/);
    assert.match(read("components/app-frame.tsx"), /band content-start/);
  });

  it("help take-down line points at Delete account", () => {
    const help = read("app/help/page.tsx").replace(/\s+/g, " ");
    assert.match(help, /To take your kit down, open Settings and choose Delete account under Danger zone\. Your kit link stops working right away\./);
    assert.match(help, /Your numbers come straight from Instagram\. Brands see only your public kit, never your private Insights\./);
  });
});
