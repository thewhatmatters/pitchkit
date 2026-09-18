import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  handleAfterReconnect,
  handleUpdateOffer,
  pitchkitHandleFromUsername,
  uniqueHandle,
  usernameDiffersFromHandle,
} from "./handle";

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
        existingHandle: "demo",
        igUsername: "rxndy.dxniel",
        updateHandle: true,
        taken: ["demo"],
      }),
      "demo",
    );
    assert.equal(handleUpdateOffer("old", "new"), "Update kit URL to @new");
  });
});
