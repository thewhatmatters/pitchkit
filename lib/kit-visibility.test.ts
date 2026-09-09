import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyHide,
  applyOverlayToMedia,
  applyRestore,
  hiddenIdsFromOverlay,
  hideFromKit,
  hideInOverlay,
  MEDIA_HIDE_PATH,
  MEDIA_RESTORE_PATH,
  mediaVisibleOnKit,
  mediaVisibilityErrorMessage,
  mediaVisibilityStatus,
  parseHiddenCookie,
  parseMediaIdBody,
  restoreInOverlay,
  restoreToKit,
  serializeHiddenCookie,
} from "./kit-visibility";

describe("kit visibility overlay", () => {
  it("parses and serializes mediaId → ISO timestamps", () => {
    const overlay = hideInOverlay({}, "media-1", "2026-09-02T12:00:00.000Z");
    assert.deepEqual(hiddenIdsFromOverlay(overlay), ["media-1"]);
    assert.equal(parseHiddenCookie(serializeHiddenCookie(overlay))["media-1"], "2026-09-02T12:00:00.000Z");
    assert.deepEqual(parseHiddenCookie("not-json"), {});
    assert.deepEqual(parseHiddenCookie(undefined), {});
    assert.deepEqual(parseHiddenCookie('{"demo":["media-1"]}'), {});
  });

  it("hides and restores the same media id (idempotent)", () => {
    let overlay = hideInOverlay({}, "a", "2026-09-02T12:00:00.000Z");
    overlay = hideInOverlay(overlay, "a", "2026-09-03T00:00:00.000Z");
    assert.equal(overlay.a, "2026-09-02T12:00:00.000Z");
    overlay = restoreInOverlay(overlay, "a");
    assert.deepEqual(overlay, {});
    overlay = restoreInOverlay(overlay, "a");
    assert.deepEqual(overlay, {});
  });

  it("filters hidden media before kit assembly", () => {
    const rows = [
      { id: "keep", hidden_from_kit_at: null },
      { id: "drop", hidden_from_kit_at: "2026-09-02T12:00:00.000Z" },
    ];
    assert.deepEqual(
      mediaVisibleOnKit(rows).map((row) => row.id),
      ["keep"],
    );
    assert.deepEqual(
      mediaVisibleOnKit(
        [
          { id: "keep", hidden_from_kit_at: null },
          { id: "overlay-drop", hidden_from_kit_at: null },
        ],
        { "overlay-drop": "2026-09-02T12:00:00.000Z" },
      ).map((row) => row.id),
      ["keep"],
    );
  });

  it("stamps overlay onto media.hidden_from_kit_at without dropping owner rows", () => {
    const rows = [
      { id: "keep", hidden_from_kit_at: null as string | null },
      { id: "hide", hidden_from_kit_at: null as string | null },
    ];
    const stamped = applyOverlayToMedia(rows, { hide: "2026-09-02T12:00:00.000Z" });
    assert.equal(stamped.length, 2);
    assert.equal(stamped[1]?.hidden_from_kit_at, "2026-09-02T12:00:00.000Z");
    assert.equal(stamped[0]?.hidden_from_kit_at, null);
  });

  it("confirm hide then undo restores the same record", () => {
    const posts = [{ id: "coastal-table" }, { id: "morning-studio" }];
    const hidden = posts[0]!;
    const afterHide = applyHide(posts, hidden.id);
    assert.deepEqual(
      afterHide.map((post) => post.id),
      ["morning-studio"],
    );
    const afterUndo = applyRestore(afterHide, hidden);
    assert.deepEqual(
      afterUndo.map((post) => post.id),
      ["morning-studio", "coastal-table"],
    );
    assert.equal(applyRestore(afterUndo, hidden).length, 2);
  });

  it("maps stamped failure codes to honest copy and HTTP status", () => {
    assert.equal(mediaVisibilityStatus("unauthenticated"), 401);
    assert.equal(mediaVisibilityStatus("invalid_body"), 400);
    assert.equal(mediaVisibilityStatus("not_found"), 404);
    assert.equal(mediaVisibilityStatus("forbidden"), 403);
    assert.equal(mediaVisibilityStatus("persist_failed"), 500);
    assert.equal(mediaVisibilityErrorMessage("unauthenticated"), "Sign in to change kit posts.");
    assert.equal(mediaVisibilityErrorMessage("invalid_body", "hide"), "That hide request was invalid.");
    assert.equal(mediaVisibilityErrorMessage("invalid_body", "restore"), "That restore request was invalid.");
    assert.equal(mediaVisibilityErrorMessage("not_found"), "That post was not found.");
    assert.equal(mediaVisibilityErrorMessage("forbidden"), "You cannot change this post.");
    assert.equal(mediaVisibilityErrorMessage("persist_failed", "hide"), "Hide could not be saved.");
    assert.equal(mediaVisibilityErrorMessage("persist_failed", "restore"), "Restore could not be saved.");
  });

  it("accepts { mediaId } and rejects invalid bodies", () => {
    assert.equal(parseMediaIdBody({ mediaId: "abc" }), "abc");
    assert.equal(parseMediaIdBody({ mediaId: "" }), null);
    assert.equal(parseMediaIdBody({ mediaId: 1 }), null);
    assert.equal(parseMediaIdBody({}), null);
    assert.equal(parseMediaIdBody(null), null);
  });
});

describe("hideFromKit / restoreToKit", () => {
  const originalFetch = globalThis.fetch;

  function mockFetch(handler: typeof fetch) {
    globalThis.fetch = handler;
  }

  function restoreFetch() {
    globalThis.fetch = originalFetch;
  }

  it("posts { mediaId } to the stamped hide and restore routes", async () => {
    const calls: Array<{ path: string; body: unknown }> = [];
    mockFetch(async (input, init) => {
      calls.push({
        path: String(input),
        body: JSON.parse(String(init?.body)),
      });
      const mediaId = (calls.at(-1)?.body as { mediaId: string }).mediaId;
      const hiddenFromKitAt = String(input) === MEDIA_HIDE_PATH ? "2026-09-02T12:00:00.000Z" : null;
      return new Response(JSON.stringify({ mediaId, hiddenFromKitAt }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    try {
      assert.deepEqual(await hideFromKit("media-1"), {
        ok: true,
        mediaId: "media-1",
        hiddenFromKitAt: "2026-09-02T12:00:00.000Z",
      });
      assert.deepEqual(await restoreToKit("media-1"), {
        ok: true,
        mediaId: "media-1",
        hiddenFromKitAt: null,
      });
      assert.deepEqual(calls, [
        { path: MEDIA_HIDE_PATH, body: { mediaId: "media-1" } },
        { path: MEDIA_RESTORE_PATH, body: { mediaId: "media-1" } },
      ]);
    } finally {
      restoreFetch();
    }
  });

  it("returns stamped persist_failed when the API is unreachable", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    try {
      const hide = await hideFromKit("media-1");
      const restore = await restoreToKit("media-1");
      assert.deepEqual(hide, {
        ok: false,
        code: "persist_failed",
        error: "Hide could not be saved.",
      });
      assert.deepEqual(restore, {
        ok: false,
        code: "persist_failed",
        error: "Restore could not be saved.",
      });
    } finally {
      restoreFetch();
    }
  });

  it("returns stamped HTTP errors without a local persist", async () => {
    mockFetch(async () => {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    });
    try {
      assert.deepEqual(await hideFromKit("media-1"), {
        ok: false,
        code: "unauthenticated",
        error: "Sign in to change kit posts.",
      });
    } finally {
      restoreFetch();
    }
  });
});
