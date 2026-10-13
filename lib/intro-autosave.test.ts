import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { persistOwnerKitProfile } from "./graph-store";
import { createMemoryHiddenKit, setHiddenKitNamespaceForTests } from "./hidden-kit";
import { setHasHyperdriveForTests, resetHyperdriveForTests } from "./hyperdrive";
import {
  PITCHKIT_INTRO_HELP,
  PITCHKIT_THEME_DEFAULT,
  introSaveDescription,
} from "./kit-profile";
import { DEMO_HANDLE, DEMO_USER_ID, seedUser } from "./seed";
import { createMemorySqlStore, resetSqlStoreForTests, setSqlStoreForTests } from "./sql-store";
import { loadOwnerKit, loadPublicKit } from "./store";

const NOW = new Date("2026-10-13T12:00:00.000Z");
const demo = { handle: DEMO_HANDLE, userId: DEMO_USER_ID };
const profile = (intro: string) => ({ intro, past_brands: [], theme: PITCHKIT_THEME_DEFAULT });

afterEach(() => {
  setHiddenKitNamespaceForTests(undefined);
  resetSqlStoreForTests();
  resetHyperdriveForTests();
});

describe("intro autosave", () => {
  it("labels Saving…, Saved and failure ahead of the helper copy", () => {
    assert.equal(introSaveDescription("idle"), PITCHKIT_INTRO_HELP);
    assert.equal(introSaveDescription("saving"), `Saving… · ${PITCHKIT_INTRO_HELP}`);
    assert.equal(introSaveDescription("saved"), `Saved · ${PITCHKIT_INTRO_HELP}`);
    assert.match(introSaveDescription("error"), /^Not saved/);
  });

  it("persists the intro and a fresh load (reload) returns it", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    assert.equal(await persistOwnerKitProfile(demo, profile("This is my intro")), true);
    assert.equal((await loadOwnerKit(DEMO_HANDLE, NOW))?.intro, "This is my intro");
    assert.equal(await persistOwnerKitProfile(demo, profile("Second edit")), true);
    assert.equal((await loadOwnerKit(DEMO_HANDLE, NOW))?.intro, "Second edit");
    assert.equal((await loadPublicKit(DEMO_HANDLE, NOW))?.intro, "Second edit");
  });

  it("round-trips through the SQL (Hyperdrive) path", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    setSqlStoreForTests(createMemorySqlStore({ users: [seedUser] }));
    setHasHyperdriveForTests(true);
    assert.equal(await persistOwnerKitProfile(demo, profile("Stored via SQL")), true);
    assert.equal((await loadOwnerKit(DEMO_HANDLE, NOW))?.intro, "Stored via SQL");
  });

  it("reports failure instead of Saved when nothing can store it", async () => {
    setHiddenKitNamespaceForTests(null as never);
    assert.equal(await persistOwnerKitProfile(demo, profile("Lost")), false);
  });
});
