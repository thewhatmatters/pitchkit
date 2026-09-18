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
    const copy = read("lib/copy.ts");
    assert.match(button, /Continue with Instagram/);
    assert.match(page, new RegExp(`action="${AUTH_CONNECT_PATH}"`));
    assert.match(page, /method="post"/);
    assert.match(page, /DISCLOSURE/);
    assert.match(page, /PROFESSIONAL_NOTE/);
    assert.match(page, /DEMO_SESSION_NOTE/);
    assert.match(copy, /Opens the demo Insights session/);
    assert.doesNotMatch(page, /STUB_CONNECT|Stub connect|no Instagram token/);
    assert.doesNotMatch(copy, /STUB_CONNECT|Stub connect|no Instagram token/);
  });

  it("gates /insights on the session cookie", () => {
    const page = read("app/insights/page.tsx");
    assert.match(page, /insightsGate/);
    assert.match(page, /redirect\("\/"\)/);
    assert.doesNotMatch(page, /INVENTORY_CONTACT|past-brands|KitInventory/);
  });

  it("public kit is the shareable Pattern freeze; owner Edit stays off /k/", () => {
    const page = read("app/k/[handle]/page.tsx");
    const kit = read("components/shareable-kit.tsx");
    const edit = read("components/kit-edit.tsx");
    const workspace = read("components/owner-workspace.tsx");
    assert.match(page, /ShareableKit/);
    assert.match(page, /PATTERN_BRAND_CLASS/);
    assert.doesNotMatch(page, /sessionOwnsHandle|KitEdit|OwnerNav|AppFrame/);
    assert.doesNotMatch(page, /MoreMenu|Hide from kit|label="Edit"|Coming soon|PitchKitComingSoon/);
    assert.match(kit, /Verified Instagram summary/);
    assert.match(kit, /Selected posts/);
    assert.match(kit, /TextLink/);
    assert.match(kit, /Past brands/);
    assert.doesNotMatch(kit, /<MoreMenu|Hide from kit|Coming soon|variant="success"/);
    assert.match(edit, /label="Edit"/);
    assert.match(edit, /ShareableKit/);
    assert.doesNotMatch(workspace, /KitEdit/);
    assert.match(workspace, /PitchKitComingSoon/);
    assert.doesNotMatch(page, /KitInventory/);
  });

  it("owner views use hug SegmentedControl Insights | PitchKit on the Pattern shell", () => {
    const nav = read("components/owner-nav.tsx");
    const tokens = read("components/pattern-tokens.ts");
    const frame = read("components/app-frame.tsx");
    const barrel = read("components/wmds.ts");
    const insights = read("app/insights/page.tsx");
    const workspace = read("components/owner-workspace.tsx");
    const kit = read("app/k/[handle]/page.tsx");
    const settings = read("app/settings/page.tsx");

    assert.match(barrel, /SegmentedControl/);
    assert.match(barrel, /PageHeader/);
    assert.match(barrel, /Avatar/);
    assert.match(barrel, /TextLink/);
    assert.match(nav, /SegmentedControl/);
    assert.match(nav, />Insights</);
    assert.match(nav, />PitchKit</);
    assert.match(nav, /aria-label="PitchKit primary navigation"/);
    assert.match(nav, /onViewChange/);
    assert.doesNotMatch(nav, /router\.push|kitPath|usePathname|useRouter/);
    assert.match(tokens, /PATTERN_TOPBAR_CLASS/);
    assert.match(tokens, /grid-cols-\[1fr_auto_1fr\]/);
    assert.match(tokens, /PATTERN_BRAND_CLASS = "type-label text-fg text-fg"/);
    assert.match(tokens, /PATTERN_TOPBAR_END_CLASS = "justify-self-end"/);
    assert.match(nav, /<Avatar/);
    assert.match(nav, /size="sm"/);
    assert.match(nav, /PATTERN_TOPBAR_END_CLASS/);
    assert.doesNotMatch(nav, /^\s*layout="stretch"/m);
    assert.doesNotMatch(nav, /className="[^"]*w-full/);
    assert.match(frame, /OWNER_GRID_MAX = "1140px"/);
    assert.match(frame, /OWNER_GRID_COLUMN_GAP = "8px"/);
    assert.match(frame, /OWNER_GRID_CLASS/);
    assert.match(
      tokens,
      /PATTERN_PAGE_CLASS =\s*"grid-page min-h-screen bg-body \[--grid-column-gap:8px\] \[--grid-max:1140px\] \[padding-bottom:44px\]"/,
    );
    assert.match(tokens, /PATTERN_TOPBAR_BAND_CLASS = "band pb-4"/);
    assert.match(tokens, /PATTERN_CONTENT_BAND_CLASS = "band pt-6 sm:pt-8"/);
    assert.match(tokens, /PATTERN_CONTENT_CLASS = "band min-w-0 gap-y-6 sm:gap-y-8"/);
    assert.match(tokens, /CREATOR_INSIGHTS_PAGE_CLASS = PATTERN_PAGE_CLASS/);
    assert.match(tokens, /CREATOR_INSIGHTS_BODY_BAND_CLASS = PATTERN_CONTENT_BAND_CLASS/);
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
    assert.match(workspace, /CREATOR_INSIGHTS_PAGE_CLASS/);
    assert.match(workspace, /CREATOR_INSIGHTS_HEADER_BAND_CLASS/);
    assert.match(workspace, /CREATOR_INSIGHTS_BODY_BAND_CLASS/);
    assert.match(workspace, /CREATOR_INSIGHTS_BODY_INNER_CLASS/);
    assert.match(workspace, /OwnerNav/);
    assert.match(workspace, /useState<OwnerView>\("insights"\)/);
    assert.match(workspace, /<OwnerNav[\s\S]*\{view === "pitchkit"/);
    assert.match(workspace, /PitchKitComingSoon/);
    assert.doesNotMatch(workspace, /KitEdit|ShareableKit/);
    assert.doesNotMatch(workspace, /router\.(push|replace)|useRouter|usePathname|kitPath/);
    assert.match(insights, /OwnerWorkspace/);
    assert.doesNotMatch(insights, /loadPublicKit/);
    assert.match(insights, /insightsGate/);
    assert.doesNotMatch(insights, /<AppFrame/);
    assert.doesNotMatch(insights, /OWNER_GRID_MAX|OWNER_GRID_CLASS|min-h-dvh|py-6/);
    assert.doesNotMatch(kit, /OwnerNav|KitEdit/);
    assert.match(kit, /CREATOR_INSIGHTS_PAGE_CLASS/);
    assert.match(kit, /CREATOR_INSIGHTS_HEADER_BAND_CLASS/);
    assert.match(settings, /OWNER_GRID_MAX/);
    assert.doesNotMatch(settings, /OwnerNav/);
    assert.doesNotMatch(insights, /OwnerShell|AppShell|AppShell\.Mobile|NavRail/);
    assert.doesNotMatch(workspace, /OwnerShell|AppShell|AppShell\.Mobile|NavRail/);
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
    const card = read("components/shareable-kit.tsx");

    assert.match(chrome, /PageHeader/);
    assert.match(chrome, /title="Insights"/);
    assert.match(chrome, /Share kit/);
    assert.match(copy, /Private to you/);
    assert.match(chrome, /INSIGHTS_PRIVATE/);
    assert.match(stats, /label="Engagement rate"/);
    assert.doesNotMatch(stats, /label="ER"/);
    assert.match(chrome, /ENGAGEMENT_FORMULA/);
    assert.match(read("lib/inventory.ts"), /\(likes \+ comments \+ saves \+ shares\) ÷ reach/);
    assert.doesNotMatch(chrome, /÷ followers/);
    assert.doesNotMatch(card, />ER</);
    assert.match(card, /Engagement rate/);
    assert.doesNotMatch(stats, /<Stat\.Group/);
    assert.doesNotMatch(stats, /trend=/);
    assert.match(stats, /PATTERN_STAT_CLASS/);
    assert.match(read("components/pattern-tokens.ts"), /PATTERN_STAT_CLASS = "col-span-2 md:col-span-4 lg:col-span-3"/);
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
    assert.match(proof, /partitionOwnerProofPosts/);
    assert.match(proof, /setOwnerPosts\(posts\)/);
    assert.match(proof, /shown\.length\} shown/);
    assert.match(proof, /Restore to kit/);
    assert.match(proof, /Hidden/);
    assert.match(proof, /stampHiddenFromKit/);
    assert.match(proof, /clearHiddenFromKit/);
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
    assert.match(read("lib/kit-visibility.ts"), /partitionOwnerProofPosts/);
    assert.doesNotMatch(read("app/insights/page.tsx"), /mediaVisibleOnKit/);
    assert.match(audience, /Chart\.RankedBars/);
    assert.match(chart, /Chart\.Cartesian/);
    assert.match(chart, /variant="outlined"/);
    assert.match(chart, /Reach over 30 days/);
    assert.match(chart, /typicalReach/);
    assert.match(chart, /key: "typical"/);
    assert.match(chart, /Chart\.Legend/);
    assert.match(chart, /animate="none"/);
    assert.match(read("components/owner-chrome.tsx"), /typicalReach=\{typicalReach\}/);
    assert.match(read("components/wmds.ts"), /chartMaxTicksForWidth/);
    assert.match(read("package.json"), /wmds#75f8a41e8b131906378b340a4106a486ddd5173f/);
    assert.doesNotMatch(read("package.json"), /3f13630|73277bab/);
    assert.match(page, /OwnerWorkspace/);
    assert.match(read("components/owner-workspace.tsx"), /CREATOR_INSIGHTS_PAGE_CLASS/);
    assert.match(read("components/owner-workspace.tsx"), /CREATOR_INSIGHTS_HEADER_BAND_CLASS/);
    assert.match(read("components/owner-workspace.tsx"), /CREATOR_INSIGHTS_BODY_BAND_CLASS/);
    assert.match(read("components/owner-workspace.tsx"), /CREATOR_INSIGHTS_BODY_INNER_CLASS/);
    assert.doesNotMatch(page, /<AppFrame|layout="stretch"|min-h-dvh/);
    assert.doesNotMatch(read("components/owner-nav.tsx"), /^\s*layout="stretch"/m);
    assert.doesNotMatch(read("components/owner-nav.tsx"), /className="[^"]*w-full/);
    assert.doesNotMatch(page, /Owner Insights\. Brands never see this page/);
    assert.match(read("components/pattern-tokens.ts"), /examples-pitchkit--creator-insights/);
    assert.match(read("components/pattern-tokens.ts"), /examples-pitchkit--shareable-pitchkit/);
    assert.match(
      read("components/pattern-tokens.ts"),
      /PATTERN_PLACEHOLDER_CLASS =\s*"col-span-full flex min-h-\[60vh\] flex-col items-center justify-center gap-3 text-center"/,
    );
    assert.match(
      read("components/pattern-tokens.ts"),
      /PATTERN_PLACEHOLDER_TITLE_CLASS = "type-heading-1 text-fg tracking-tight"/,
    );
    assert.match(
      read("components/pattern-tokens.ts"),
      /PATTERN_PLACEHOLDER_BODY_CLASS = "type-body text-fg max-w-md text-muted"/,
    );
    assert.match(read("components/pitchkit-coming-soon.tsx"), /PITCHKIT_COMING_SOON_BADGE/);
    assert.match(read("components/pitchkit-coming-soon.tsx"), /PITCHKIT_COMING_SOON_TITLE/);
    assert.match(read("lib/copy.ts"), /PITCHKIT_COMING_SOON_BADGE = "Coming soon"/);
    assert.match(read("lib/copy.ts"), /PITCHKIT_COMING_SOON_TITLE = "Shareable PitchKit"/);
    assert.match(
      read("lib/copy.ts"),
      /verified insights, selected posts, contact details, and past-brand proof/,
    );
    assert.match(read("app/layout.tsx"), /className="bg-body min-h-screen"/);
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
    assert.match(hidden, /export async function hideFromKit/);
    assert.match(hidden, /export async function restoreToKit/);
    assert.match(hidden, /pitchkit_hidden|HIDDEN_COOKIE/);
    assert.match(hidden, /HttpOnly/);
    assert.match(store, /excludeHiddenFromPublicKit/);
    assert.match(store, /export \{ hideFromKit, restoreToKit/);
    assert.match(store, /hiddenOverlayForHandle/);
    assert.match(hidden, /mergeHiddenOverlay/);
    assert.match(read("lib/hidden-kit-kv.ts"), /getCloudflareContext/);
    assert.match(read("lib/hidden-kit-kv.ts"), /HIDDEN_KIT/);
    assert.match(read("lib/hidden-kit-kv.ts"), /hidden:\$\{userId\}/);
    assert.match(read("lib/hidden-kit-kv.ts"), /async: true/);
    assert.match(read("wrangler.jsonc"), /"binding": "HIDDEN_KIT"/);
    assert.match(read("wrangler.jsonc"), /8a50f78eca5e4bf7bbabc96d9f9df63c/);
    assert.doesNotMatch(hidden, /__pitchkitHiddenFromKit/);
    assert.match(kit, /excludeHiddenFromPublicKit/);
    assert.match(publicKit, /hiddenOverlayForHandle/);
    assert.doesNotMatch(publicKit, /HIDDEN_COOKIE|sessionOwnsHandle/);
    assert.match(schema, /hidden_from_kit_at/);
    assert.match(data, /hidden_from_kit_at/);
    assert.match(migration, /hidden_from_kit_at timestamptz/);
    assert.match(insights, /hiddenOverlayForHandle/);
    assert.match(insights, /HIDDEN_COOKIE/);
    assert.doesNotMatch(publicKit, /HIDDEN_COOKIE/);
    assert.doesNotMatch(hidden, /localStorage/);
    assert.doesNotMatch(store, /localStorage/);
    assert.doesNotMatch(hide, /localStorage/);
    assert.doesNotMatch(restore, /localStorage/);
  });

  it("Workers Builds wrangler upload generates the OpenNext worker first", () => {
    const wrangler = read("wrangler.jsonc");
    const pkg = read("package.json");
    assert.match(wrangler, /"main": "\.open-next\/worker\.js"/);
    assert.match(wrangler, /opennextjs-cloudflare build/);
    assert.match(pkg, /opennextjs-cloudflare build && opennextjs-cloudflare deploy/);
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
