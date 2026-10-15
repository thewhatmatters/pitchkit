import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedUsers } from "./seed";
import { SHARE_DESCRIPTION_GENERIC, sharePreview, shareImagePath } from "./share-preview";
import type { User } from "./schema";

const base: User = { ...seedUsers[0], handle: "maya.makes", name: "Maya Ortiz", followers: 12_400 };
const series = Array.from({ length: 30 }, (_, i) => ({ day: `2026-09-${String(i + 1).padStart(2, "0")}`, reach: 900 + i * 10 }));

describe("share preview", () => {
  it("title is the person, never the site name", () => {
    const p = sharePreview({ user: base, engagementRate: 0.052, hasInsights: true, reach_series: series as never });
    assert.equal(p.title, "Maya Ortiz (@maya.makes)");
    assert.doesNotMatch(p.title, /Pitchkit/);
    assert.equal(p.imageAlt, "Maya Ortiz’s Pitchkit media kit");
  });
  it("description carries the numbers", () => {
    const p = sharePreview({ user: base, engagementRate: 0.052, hasInsights: true, reach_series: series as never });
    assert.match(p.description, /12,400 followers/);
    assert.match(p.description, /verified from Instagram Insights/);
  });
  it("never shows a small or zero number under 100 followers", () => {
    const p = sharePreview({ user: { ...base, followers: 64 }, engagementRate: null, hasInsights: false });
    assert.equal(p.kpis, null);
    assert.equal(p.description, SHARE_DESCRIPTION_GENERIC);
    assert.doesNotMatch(p.description, /\b0\b|64/);
  });
  it("demo says Example data, never Verified", () => {
    const p = sharePreview({ user: seedUsers[0], engagementRate: null, hasInsights: false });
    assert.equal(p.example, true);
    assert.match(p.description, /Example data/);
    assert.doesNotMatch(p.description, /[Vv]erified/);
  });
  it("image path is per creator", () => {
    assert.equal(shareImagePath("maya.makes"), "/k/maya.makes/og");
  });
});

describe("Example data pill", () => {
  it("is on /k/demo only", () => {
    assert.equal(sharePreview({ user: seedUsers[0], engagementRate: null, hasInsights: false }).example, true);
  });
  it("never on a real kit", () => {
    const real = { ...base, id: "11111111-1111-4111-8111-111111111111" };
    const p = sharePreview({ user: real, engagementRate: 0.05, hasInsights: true, reach_series: series as never });
    assert.equal(p.example, false);
    assert.doesNotMatch(p.description, /Example/);
  });
  it("never on a real creator whose handle is demo", () => {
    const p = sharePreview({ user: { ...base, id: "22222222-2222-4222-8222-222222222222", handle: "demo" }, engagementRate: null, hasInsights: false });
    assert.equal(p.example, false);
  });
  it("og route only draws the pill from preview.example", async () => {
    const { readFileSync } = await import("node:fs");
    const route = readFileSync("app/k/[handle]/og/route.tsx", "utf8");
    assert.match(route, /\{preview\.example \? \(/);
    assert.equal((route.match(/Example data/g) ?? []).length, 1);
  });
});
