import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  handleAfterReconnect,
  handleUpdateOffer,
  liveOAuthHandle,
  pitchkitHandleFromUsername,
  uniqueHandle,
  usernameDiffersFromHandle,
} from "./handle";
import { DEMO_HANDLE } from "./seed";

describe("WHA-313 handle freeze", () => {
  it("keeps dots and underscores and suffixes -2 on collision", () => {
    assert.equal(pitchkitHandleFromUsername("rxndy.dxniel"), "rxndy.dxniel");
    assert.equal(uniqueHandle("demo", ["demo"]), "demo-2");
    assert.equal(uniqueHandle("taken", ["taken", "taken-2"]), "taken-3");
  });

  it("keeps the frozen URL on reconnect unless they opt in", () => {
    assert.equal(usernameDiffersFromHandle("old.handle", "new.handle"), true);
    assert.equal(
      handleAfterReconnect({
        existingHandle: "old.handle",
        igUsername: "new.handle",
        taken: ["old.handle"],
      }),
      "old.handle",
    );
    assert.equal(
      handleAfterReconnect({
        existingHandle: "old.handle",
        igUsername: "new.handle",
        updateHandle: true,
        taken: ["old.handle", "new.handle"],
      }),
      "new.handle-2",
    );
    assert.equal(
      handleAfterReconnect({
        existingHandle: DEMO_HANDLE,
        igUsername: DEMO_HANDLE,
        updateHandle: true,
        taken: [DEMO_HANDLE],
      }),
      DEMO_HANDLE,
    );
    assert.equal(handleUpdateOffer("old", "new"), "Update kit URL to @new");
  });

  it("escapes a snapshot stuck on demo when the Instagram username is not demo", () => {
    assert.equal(
      handleAfterReconnect({
        existingHandle: DEMO_HANDLE,
        igUsername: "rxndy.dxniel",
        taken: [DEMO_HANDLE],
      }),
      "rxndy.dxniel",
    );
    assert.equal(
      handleAfterReconnect({
        existingHandle: DEMO_HANDLE,
        igUsername: "rxndy.dxniel",
        updateHandle: true,
        taken: [DEMO_HANDLE, "rxndy.dxniel"],
      }),
      "rxndy.dxniel-2",
    );
  });

  it("live OAuth handle is never demo, even if the snapshot or username is", () => {
    assert.equal(
      liveOAuthHandle({
        existingHandle: DEMO_HANDLE,
        igUsername: "rxndy.dxniel",
        taken: [DEMO_HANDLE],
      }),
      "rxndy.dxniel",
    );
    assert.equal(
      liveOAuthHandle({
        existingHandle: DEMO_HANDLE,
        igUsername: DEMO_HANDLE,
        taken: [DEMO_HANDLE],
      }),
      "demo-2",
    );
    assert.equal(
      liveOAuthHandle({
        igUsername: "rxndy.dxniel",
        taken: [DEMO_HANDLE],
      }),
      "rxndy.dxniel",
    );
    assert.equal(
      liveOAuthHandle({
        existingHandle: "old.handle",
        igUsername: "new.handle",
        taken: ["old.handle"],
      }),
      "old.handle",
    );
  });
});
