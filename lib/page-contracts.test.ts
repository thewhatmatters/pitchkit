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
