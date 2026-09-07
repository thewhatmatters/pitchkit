import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { AUTH_CONNECT_PATH, AUTH_SIGNOUT_PATH } from "./session";

function read(rel: string) {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("critical page contracts", () => {
  it("landing Continue posts stub Instagram auth", () => {
    const page = read("app/page.tsx");
    const button = read("components/connect-button.tsx");
    assert.match(button, /Continue with Instagram/);
    assert.match(page, new RegExp(`action="${AUTH_CONNECT_PATH}"`));
    assert.match(page, /method="post"/);
  });

  it("gates /insights on the session cookie", () => {
    const page = read("app/insights/page.tsx");
    assert.match(page, /insightsGate/);
    assert.match(page, /redirect\("\/"\)/);
    assert.doesNotMatch(page, /INVENTORY_CONTACT|past-brands|KitInventory/);
  });

  it("public kit stays view; owner Edit is session-owned", () => {
    const page = read("app/k/[handle]/page.tsx");
    const edit = read("components/kit-edit.tsx");
    assert.match(page, /sessionOwnsHandle/);
    assert.match(page, /KitEdit/);
    assert.match(edit, /label="Edit"/);
    assert.match(edit, /KitCard/);
    assert.doesNotMatch(page, /KitInventory/);
  });

  it("owner chrome consumes AppShell with an explicit PageHeader", () => {
    const shell = read("components/owner-shell.tsx");
    const barrel = read("components/wmds.ts");
    assert.match(barrel, /AppShell/);
    assert.match(shell, /<AppShell[\s\S]*items=/);
    assert.match(shell, /<AppShell\.Body>/);
    assert.match(shell, /<AppShell\.Mobile/);
    assert.match(shell, /<PageHeader/);
    assert.doesNotMatch(shell, /NavRail/);
    assert.doesNotMatch(shell, /secondaryNav/);
  });

  it("Insights chrome has no duplicate tabs and spells Engagement rate", () => {
    const page = read("app/insights/page.tsx");
    const chrome = read("components/owner-chrome.tsx");
    const stats = read("components/insights-stats.tsx");
    const posts = read("components/post-grid.tsx");
    const chart = read("components/reach-chart.tsx");
    const copy = read("lib/copy.ts");

    assert.doesNotMatch(chrome, /Tab\.Group|Owner views/);
    assert.doesNotMatch(chrome, /<Tab[\s\S]*Insights/);
    assert.doesNotMatch(chrome, /Media kit/);
    assert.doesNotMatch(page, /Owner Insights\. Brands never see this page/);
    assert.doesNotMatch(chrome, /Brands never see this page/);
    assert.match(copy, /Private to you/);
    assert.match(page, /INSIGHTS_PRIVATE/);
    assert.match(page, /Badge/);
    const headline = stats.match(/<Stat\s+size="md"[\s\S]*?\/>/)?.[0] ?? "";
    assert.match(headline, /label="Typical reach"/);
    assert.doesNotMatch(headline, /label="Engagement rate"/);
    assert.match(stats, /size="sm"[\s\S]*label="Engagement rate"/);
    assert.doesNotMatch(stats, /label="ER"/);
    assert.match(stats, /size="md"/);
    assert.match(stats, /columns=\{columns\}/);
    assert.match(stats, /md:grid-cols-4/);
    assert.doesNotMatch(stats, /trend=/);
    assert.match(chrome, /Top-performing posts/);
    assert.doesNotMatch(chrome, /Six posts/);
    assert.match(chrome, /SegmentedControl/);
    assert.match(chrome, /value="reach"/);
    assert.match(chrome, /value="engagement"/);
    assert.match(chrome, /value="saves"/);
    assert.match(chrome, /layout="rows"/);
    assert.match(posts, /layout = "grid"/);
    assert.match(posts, /layout === "rows"/);
    assert.match(read("components/wmds.ts"), /SegmentedControl/);
    assert.match(read("components/wmds.ts"), /chartMaxTicksForWidth/);
    assert.match(chart, /chartMaxTicksForWidth/);
    assert.match(chart, /reachChartDateTickCount/);
    assert.match(chart, /shouldRenderReachChartBand/);
    assert.match(chart, /animate="none"/);
    assert.match(chart, /<Chart\.Cartesian[\s\S]*animate="none"/);
  });

  it("settings is account only", () => {
    const page = read("app/settings/page.tsx");
    const settings = read("components/account-settings.tsx");
    assert.match(page, /insightsGate/);
    assert.match(settings, /Reconnect Instagram/);
    assert.match(settings, new RegExp(AUTH_SIGNOUT_PATH));
    assert.doesNotMatch(settings, /past brand|Past brand|contact for collab/i);
    assert.doesNotMatch(page, /past brand|Past brand/i);
  });
});
