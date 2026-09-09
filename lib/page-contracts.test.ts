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

  it("owner views use SegmentedControl Insights | PitchKit on a 1140 grid", () => {
    const nav = read("components/owner-nav.tsx");
    const frame = read("components/app-frame.tsx");
    const barrel = read("components/wmds.ts");
    const insights = read("app/insights/page.tsx");
    const kit = read("app/k/[handle]/page.tsx");
    const settings = read("app/settings/page.tsx");

    assert.match(barrel, /SegmentedControl/);
    assert.match(barrel, /PageHeader/);
    assert.match(nav, /SegmentedControl/);
    assert.match(nav, />Insights</);
    assert.match(nav, />PitchKit</);
    assert.match(nav, /aria-label="PitchKit primary navigation"/);
    assert.match(nav, /router\.push\("\/insights"\)/);
    assert.match(nav, /kitPath/);
    assert.match(frame, /OWNER_GRID_MAX = "1140px"/);
    assert.match(frame, /OWNER_GRID_COLUMN_GAP = "8px"/);
    assert.match(frame, /\[--grid-max:1140px\]/);
    assert.match(frame, /\[--grid-column-gap:8px\]/);
    assert.match(frame, /\[--grid-gutter:8px\]/);
    assert.doesNotMatch(frame, /style=\{/);
    assert.match(frame, /grid-page/);
    assert.match(frame, /band/);
    assert.doesNotMatch(frame, /<OwnerGridOverlay|<GridOverlay|ExampleGridControls/);
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
    assert.doesNotMatch(nav, /AppShell|NavRail/);
  });

  it("does not ship GridOverlay as product chrome", () => {
    const frame = read("components/app-frame.tsx");
    const chrome = read("components/owner-chrome.tsx");
    const insights = read("app/insights/page.tsx");
    const kit = read("app/k/[handle]/page.tsx");
    const layout = read("app/layout.tsx");

    assert.doesNotMatch(frame, /<OwnerGridOverlay|<GridOverlay|ExampleGridControls/);
    assert.doesNotMatch(chrome, /<GridOverlay|ExampleGridControls/);
    assert.doesNotMatch(insights, /<GridOverlay|ExampleGridControls/);
    assert.doesNotMatch(kit, /<OwnerGridOverlay|<GridOverlay|ExampleGridControls/);
    assert.doesNotMatch(layout, /<GridOverlay|ExampleGridControls/);
  });

  it("mounts one Toaster at the app root", () => {
    const layout = read("app/layout.tsx");
    const toaster = read("components/app-toaster.tsx");
    const barrel = read("components/wmds.ts");

    assert.match(barrel, /Toaster/);
    assert.match(barrel, /toast,/);
    assert.match(toaster, /<Toaster position="bottom-right" \/>/);
    assert.match(layout, /<AppToaster \/>/);
    assert.doesNotMatch(read("components/owner-chrome.tsx"), /<Toaster/);
    assert.doesNotMatch(read("components/proof-posts.tsx"), /<Toaster/);
  });

  it("Insights chrome matches creator Insights pattern", () => {
    const page = read("app/insights/page.tsx");
    const chrome = read("components/owner-chrome.tsx");
    const stats = read("components/insights-stats.tsx");
    const proof = read("components/proof-posts.tsx");
    const chart = read("components/reach-chart.tsx");
    const audience = read("components/audience-fit.tsx");
    const copy = read("lib/copy.ts");
    const card = read("components/kit-card.tsx");

    assert.match(chrome, /PageHeader/);
    assert.match(chrome, /title="Insights"/);
    assert.match(chrome, /Share kit/);
    assert.match(copy, /Private to you/);
    assert.match(chrome, /INSIGHTS_PRIVATE/);
    assert.match(stats, /label="Engagement rate"/);
    assert.doesNotMatch(stats, /label="ER"/);
    assert.doesNotMatch(card, />ER</);
    assert.match(card, /Engagement rate/);
    assert.doesNotMatch(stats, /<Stat\.Group/);
    assert.doesNotMatch(stats, /trend=/);
    assert.match(stats, /col-span-2 w-full min-w-0 md:col-span-4 lg:col-span-3/);
    assert.match(proof, /Recent proof/);
    assert.doesNotMatch(chrome, /Six posts|Top-performing posts/);
    assert.doesNotMatch(proof, /Six posts|Top-performing posts/);
    assert.match(proof, /Tab\.Group/);
    assert.match(proof, /value="reach"/);
    assert.match(proof, /value="engagement"/);
    assert.match(proof, /value="saves"/);
    assert.match(proof, /MoreMenu/);
    assert.match(proof, /Hide from kit/);
    assert.match(proof, /AlertDialog/);
    assert.match(proof, /confirmLabel="Hide from kit"/);
    assert.match(proof, /toast\.add\(/);
    assert.match(proof, /label: "Undo"/);
    assert.match(proof, /hideFromKit\(hiddenPost\.id\)/);
    assert.match(proof, /restoreToKit\(hiddenPost\.id\)/);
    assert.match(proof, /result\.error/);
    assert.match(read("lib/kit-visibility.ts"), /POST \/api\/media\/hide/);
    assert.match(read("lib/kit-visibility.ts"), /POST \/api\/media\/restore/);
    assert.match(read("app/api/media/hide/route.ts"), /mediaVisibilityResponse\(request, "hide"\)/);
    assert.match(read("app/api/media/restore/route.ts"), /mediaVisibilityResponse\(request, "restore"\)/);
    assert.doesNotMatch(read("lib/kit-visibility.ts"), /\/api\/kit\/visibility/);
    assert.doesNotMatch(read("lib/kit-visibility.ts"), /localStorage\.(get|set)Item/);
    assert.doesNotMatch(read("lib/kit-visibility.ts"), /persistLocalStub/);
    assert.doesNotMatch(read("components/proof-posts.tsx"), /localStorage/);
    assert.match(read("lib/schema.ts"), /hidden_from_kit_at/);
    assert.match(read("lib/store.ts"), /hiddenOverlayForHandle/);
    assert.match(read("lib/store.ts"), /Includes every owner row/);
    assert.doesNotMatch(read("app/insights/page.tsx"), /mediaVisibleOnKit/);
    assert.match(audience, /Chart\.RankedBars/);
    assert.match(chart, /Chart\.Cartesian/);
    assert.match(chart, /variant="outlined"/);
    assert.match(chart, /Reach over 30 days/);
    assert.match(chart, /shouldRenderReachChartBand/);
    assert.match(chart, /animate="none"/);
    assert.doesNotMatch(chart, /Chart\.Legend/);
    assert.match(read("components/wmds.ts"), /chartMaxTicksForWidth/);
    assert.match(read("package.json"), /wmds#2f3d828374e02566af5419f21e937c02b958135f/);
    assert.doesNotMatch(page, /Owner Insights\. Brands never see this page/);
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
