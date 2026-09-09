import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveMediaVisibility } from "./media-visibility";
import { DEMO_USER_ID, seedMedia } from "./seed";
import type { Session } from "./session";

const NOW = new Date("2026-09-09T12:00:00.000Z");
const mediaId = seedMedia[0]!.id;
const session: Session = { handle: "demo", userId: DEMO_USER_ID };

describe("WHA-312 media visibility contract", () => {
  it("hides and restores with { mediaId, hiddenFromKitAt } and stays idempotent", () => {
    const hidden = resolveMediaVisibility({
      action: "hide",
      session,
      body: { mediaId },
      overlay: {},
      now: NOW,
    });
    assert.equal(hidden.ok, true);
    if (!hidden.ok) {
      return;
    }
    assert.equal(hidden.status, 200);
    assert.deepEqual(hidden.body, { mediaId, hiddenFromKitAt: NOW.toISOString() });
    assert.equal(hidden.overlay[mediaId], NOW.toISOString());

    const hiddenAgain = resolveMediaVisibility({
      action: "hide",
      session,
      body: { mediaId },
      overlay: hidden.overlay,
      now: new Date("2026-09-10T00:00:00.000Z"),
    });
    assert.equal(hiddenAgain.ok, true);
    if (!hiddenAgain.ok) {
      return;
    }
    assert.equal(hiddenAgain.body.hiddenFromKitAt, NOW.toISOString());

    const restored = resolveMediaVisibility({
      action: "restore",
      session,
      body: { mediaId },
      overlay: hiddenAgain.overlay,
      now: NOW,
    });
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }
    assert.deepEqual(restored.body, { mediaId, hiddenFromKitAt: null });
    assert.equal(mediaId in restored.overlay, false);

    const restoredAgain = resolveMediaVisibility({
      action: "restore",
      session,
      body: { mediaId },
      overlay: {},
      now: NOW,
    });
    assert.equal(restoredAgain.ok, true);
    if (!restoredAgain.ok) {
      return;
    }
    assert.equal(restoredAgain.body.hiddenFromKitAt, null);
  });

  it("returns the stamped failure codes", () => {
    const unauthenticated = resolveMediaVisibility({
      action: "hide",
      session: null,
      body: { mediaId },
      overlay: {},
    });
    assert.deepEqual(unauthenticated, { ok: false, status: 401, body: { error: "unauthenticated" } });

    const invalid = resolveMediaVisibility({
      action: "hide",
      session,
      body: { mediaId: "" },
      overlay: {},
    });
    assert.deepEqual(invalid, { ok: false, status: 400, body: { error: "invalid_body" } });

    const missing = resolveMediaVisibility({
      action: "restore",
      session,
      body: { mediaId: "not-a-post" },
      overlay: {},
    });
    assert.deepEqual(missing, { ok: false, status: 404, body: { error: "not_found" } });

    const forbidden = resolveMediaVisibility({
      action: "hide",
      session: { handle: "demo", userId: "someone-else" },
      body: { mediaId },
      overlay: {},
    });
    assert.deepEqual(forbidden, { ok: false, status: 403, body: { error: "forbidden" } });
  });
});
