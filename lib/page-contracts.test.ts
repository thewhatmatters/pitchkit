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

  it("owner views use SegmentedControl on a 960 grid, not AppShell", () => {
    const nav = read("components/owner-nav.tsx");
    const frame = read("components/app-frame.tsx");
    const barrel = read("components/wmds.ts");
    const insights = read("app/insights/page.tsx");
    const kit = read("app/k/[handle]/page.tsx");
    const settings = read("app/settings/page.tsx");

    assert.doesNotMatch(barrel, /AppShell|NavRail|PageHeader/);
    assert.match(barrel, /SegmentedControl/);
    assert.match(barrel, /GridOverlay/);
    assert.match(nav, /SegmentedControl/);
    assert.match(nav, />Insights</);
    assert.match(nav, />Pitch</);
    assert.doesNotMatch(nav, />PitchKit</);
    assert.match(nav, /router\.push\("\/insights"\)/);
    assert.match(nav, /kitPath/);
    assert.match(frame, /OWNER_GRID_MAX = "960px"/);
    assert.match(frame, /OWNER_GRID_COLUMN_GAP = "8px"/);
    assert.match(frame, /\[--grid-max:960px\]/);
    assert.match(frame, /\[--grid-column-gap:8px\]/);
    assert.match(frame, /\[--grid-gutter:8px\]/);
    assert.match(frame, /\[--grid-cols:12\]/);
    assert.doesNotMatch(frame, /style=\{/);
    assert.match(frame, /grid-page/);
    assert.match(frame, /band/);
    assert.match(frame, /<OwnerGridOverlay \/>/);
    assert.match(frame, /grid-page[\s\S]*<OwnerGridOverlay \/>[\s\S]*className="band"/);
    assert.doesNotMatch(frame, /col-span-full flex flex-col/);
    assert.match(frame, /<div className="band">\{children\}<\/div>/);
    assert.doesNotMatch(frame, /["']use client["']/);
    assert.match(insights, /OWNER_GRID_MAX/);
    assert.match(insights, /OwnerNav/);
    assert.match(insights, /insightsGate/);
    assert.match(kit, /OwnerNav/);
    assert.match(kit, /OWNER_GRID_MAX/);
    assert.match(kit, /sessionOwnsHandle/);
    assert.match(settings, /OWNER_GRID_MAX/);
    assert.doesNotMatch(settings, /OwnerNav/);
    assert.doesNotMatch(insights, /OwnerShell|AppShell|AppShell\.Mobile|NavRail/);
    assert.doesNotMatch(kit, /OwnerShell|AppShell|AppShell\.Mobile|NavRail/);
    assert.doesNotMatch(settings, /OwnerShell|AppShell|AppShell\.Mobile|NavRail/);
    assert.doesNotMatch(nav, /AppShell|NavRail|PageHeader/);
  });

  it("AppFrame mounts WMDS GridOverlay before band", () => {
    const frame = read("components/app-frame.tsx");
    const overlay = read("components/owner-grid-overlay.tsx");
    const barrel = read("components/wmds.ts");
    const kit = read("app/k/[handle]/page.tsx");

    assert.match(barrel, /GridOverlay/);
    assert.match(overlay, /["']use client["']/);
    assert.match(overlay, /<GridOverlay visibleByDefault/);
    assert.match(frame, /<OwnerGridOverlay \/>/);
    assert.match(frame, /grid-page[\s\S]*<OwnerGridOverlay \/>[\s\S]*className="band"/);
    assert.doesNotMatch(frame, /col-span-full flex flex-col/);
    assert.match(frame, /<div className="band">\{children\}<\/div>/);
    assert.doesNotMatch(frame, /["']use client["']/);
    assert.doesNotMatch(kit, /OwnerGridOverlay|GridOverlay/);
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
    const headline =
      stats.match(/<div className="col-span-full">[\s\S]*?<Stat\s+size="md"[\s\S]*?\/>/)?.[0] ?? "";
    assert.match(headline, /label="Typical reach"/);
    assert.doesNotMatch(headline, /label="Engagement rate"/);
    assert.match(stats, /size="sm"[\s\S]*label="Engagement rate"/);
    assert.doesNotMatch(stats, /label="ER"/);
    assert.match(stats, /size="md"/);
    assert.doesNotMatch(stats, /<Stat\.Group/);
    assert.doesNotMatch(stats, /statGroupGridClasses/);
    assert.doesNotMatch(stats, /className="[^"]*gap-4/);
    assert.doesNotMatch(stats, /grid-cols-4/);
    assert.doesNotMatch(stats, /columns=\{columns\}/);
    assert.doesNotMatch(stats, /md:grid-cols-4/);
    assert.doesNotMatch(stats, /KPI_TILE_SPAN/);
    const tileWraps = stats.match(/<div className="col-span-6 md:col-span-3">/g) ?? [];
    assert.equal(tileWraps.length, 4);
    assert.doesNotMatch(stats, /md:col-span-2/);
    assert.match(read("package.json"), /wmds#975b649499da7b54cbc3acbac70dde5e2d9bb915/);
    assert.doesNotMatch(stats, /trend=/);
    assert.match(chrome, /className="col-span-full"/);
    assert.match(read("components/owner-nav.tsx"), /col-span-full/);
    assert.match(read("components/support-footer.tsx"), /col-span-full/);
    assert.match(read("components/reach-chart.tsx"), /col-span-full/);
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
    assert.match(read("components/wmds.ts"), /cardLayoutBodyOccupantPadYClasses/);
    assert.match(read("components/wmds.ts"), /cardLayoutBodyOccupantWellClasses/);
    assert.match(read("components/wmds.ts"), /cardLayoutBodyOccupantInsetXClasses/);
    assert.match(chart, /chartMaxTicksForWidth/);
    assert.match(chart, /reachChartDateTickCount/);
    assert.match(chart, /shouldRenderReachChartBand/);
    assert.match(chart, /animate="none"/);
    assert.match(chart, /<Chart\.Cartesian[\s\S]*animate="none"/);
    assert.match(chart, /<Card[\s\S]*<Chart\.Cartesian/);
    assert.match(chart, /<Chart\.Cartesian\.Tooltip \/>/);
    assert.match(chart, /shape="rounded"/);
    assert.match(chart, /bodyTerminal/);
    assert.match(chart, /padding="none"/);
    assert.match(
      chart,
      /flex flex-col gap-3 \$\{cardLayoutBodyOccupantPadYClasses\} \$\{cardLayoutBodyOccupantWellClasses\} \$\{cardLayoutBodyOccupantInsetXClasses\}/,
    );
    assert.match(chart, /<Card\.Body>[\s\S]*reachChartOccupantWellClasses/);
    assert.match(chart, /<ReachChartCard slot="loading">[\s\S]*Chart\.Loading/);
    assert.match(chart, /<ReachChartCard slot="reach"[\s\S]*hostRef/);
    assert.doesNotMatch(chart, /max-w-lg/);
    assert.doesNotMatch(chart, /Chart\.Legend/);
    assert.doesNotMatch(chart, /<Select/);
  });

  it("hide/restore persist through owner APIs and an httpOnly overlay, not localStorage", () => {
    const hide = read("app/api/media/hide/route.ts");
    const restore = read("app/api/media/restore/route.ts");
    const hidden = read("lib/hidden-kit.ts");
    const store = read("lib/store.ts");
    const data = read("DATA.md");
    const migration = read("db/005_media_hidden_from_kit.sql");
    const schema = read("lib/schema.ts");
    const kit = read("lib/kit.ts");
    const insights = read("app/insights/page.tsx");
    const publicKit = read("app/k/[handle]/page.tsx");

    assert.match(hide, /mediaVisibilityResponse/);
    assert.match(hide, /"hide"/);
    assert.match(restore, /mediaVisibilityResponse/);
    assert.match(restore, /"restore"/);
    assert.match(hidden, /export function hideFromKit/);
    assert.match(hidden, /export function restoreToKit/);
    assert.match(hidden, /pitchkit_hidden|HIDDEN_COOKIE/);
    assert.match(hidden, /HttpOnly/);
    assert.match(store, /excludeHiddenFromPublicKit/);
    assert.match(store, /export \{ hideFromKit, restoreToKit/);
    assert.match(store, /hiddenOverlayForHandle/);
    assert.match(hidden, /globalThis/);
    assert.match(hidden, /mergeHiddenOverlay/);
    assert.match(hidden, /__pitchkitHiddenFromKit/);
    assert.match(kit, /excludeHiddenFromPublicKit/);
    assert.match(publicKit, /hiddenOverlayForHandle/);
    assert.match(schema, /hidden_from_kit_at/);
    assert.match(data, /hidden_from_kit_at/);
    assert.match(migration, /hidden_from_kit_at timestamptz/);
    assert.match(insights, /hiddenOverlayForHandle/);
    assert.match(publicKit, /HIDDEN_COOKIE/);
    assert.doesNotMatch(hidden, /localStorage/);
    assert.doesNotMatch(store, /localStorage/);
    assert.doesNotMatch(hide, /localStorage/);
    assert.doesNotMatch(restore, /localStorage/);
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
