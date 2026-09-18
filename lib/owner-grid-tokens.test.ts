import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  CREATOR_INSIGHTS_BODY_BAND_CLASS,
  CREATOR_INSIGHTS_BODY_INNER_CLASS,
  CREATOR_INSIGHTS_HEADER_BAND_CLASS,
  CREATOR_INSIGHTS_PAGE_CLASS,
  OWNER_GRID_CLASS,
  OWNER_GRID_COLUMN_GAP,
  OWNER_GRID_MAX,
} from "../components/app-frame";

function read(rel: string) {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("fail-closed: owner grid gutter tokens (WHA-309)", () => {
  it("exports 1140 / 8px constants and forces both gap tokens on the owner class", () => {
    assert.equal(OWNER_GRID_MAX, "1140px");
    assert.equal(OWNER_GRID_COLUMN_GAP, "8px");
    assert.match(OWNER_GRID_CLASS, /\[--grid-max:1140px\]/);
    assert.match(OWNER_GRID_CLASS, /\[--grid-column-gap:8px\]/);
    assert.match(OWNER_GRID_CLASS, /\[--grid-gutter:8px\]/);
    assert.match(OWNER_GRID_CLASS, new RegExp(`\\[--grid-max:${OWNER_GRID_MAX}\\]`));
    assert.match(OWNER_GRID_CLASS, new RegExp(`\\[--grid-column-gap:${OWNER_GRID_COLUMN_GAP}\\]`));
    assert.match(OWNER_GRID_CLASS, new RegExp(`\\[--grid-gutter:${OWNER_GRID_COLUMN_GAP}\\]`));
    assert.match(OWNER_GRID_CLASS, /\bgrid-page\b/);
  });

  it("AppFrame and settings keep the exported owner class / max SoT", () => {
    const frame = read("components/app-frame.tsx");
    const settings = read("app/settings/page.tsx");

    assert.match(frame, /OWNER_GRID_CLASS/);
    assert.match(frame, /gridMax \? OWNER_GRID_CLASS/);
    assert.doesNotMatch(frame, /style=\{/);
    assert.match(settings, /OWNER_GRID_MAX/);
  });

  it("Insights and owner kit copy the Pattern — creator Insights page shell", () => {
    const insights = read("app/insights/page.tsx");
    const kit = read("app/k/[handle]/page.tsx");

    assert.equal(
      CREATOR_INSIGHTS_PAGE_CLASS,
      "grid-page min-h-screen bg-body [--grid-column-gap:8px] [--grid-max:1140px] [padding-bottom:44px]",
    );
    assert.equal(CREATOR_INSIGHTS_HEADER_BAND_CLASS, "band pb-4");
    assert.equal(CREATOR_INSIGHTS_BODY_BAND_CLASS, "band pt-8");
    assert.equal(CREATOR_INSIGHTS_BODY_INNER_CLASS, "band min-w-0 gap-y-8");
    assert.doesNotMatch(CREATOR_INSIGHTS_PAGE_CLASS, /min-h-dvh|py-6|grid-gutter/);
    assert.match(insights, /CREATOR_INSIGHTS_PAGE_CLASS/);
    assert.match(insights, /CREATOR_INSIGHTS_HEADER_BAND_CLASS/);
    assert.match(insights, /CREATOR_INSIGHTS_BODY_BAND_CLASS/);
    assert.match(insights, /CREATOR_INSIGHTS_BODY_INNER_CLASS/);
    assert.match(kit, /CREATOR_INSIGHTS_PAGE_CLASS/);
    assert.match(kit, /CREATOR_INSIGHTS_HEADER_BAND_CLASS/);
    assert.match(kit, /CREATOR_INSIGHTS_BODY_BAND_CLASS/);
    assert.match(kit, /CREATOR_INSIGHTS_BODY_INNER_CLASS/);
    assert.doesNotMatch(insights, /<AppFrame|OWNER_GRID_MAX|layout="stretch"/);
  });
});
