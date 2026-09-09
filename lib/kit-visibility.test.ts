import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyHide,
  applyRestore,
  hiddenIdsForHandle,
  hideFromKitStore,
  mediaVisibleOnKit,
  parseHiddenCookie,
  restoreToKitStore,
  serializeHiddenCookie,
} from "./kit-visibility";

describe("kit visibility store", () => {
  it("parses and serializes handle-keyed media ids", () => {
    const map = hideFromKitStore({}, "demo", "media-1");
    assert.deepEqual(hiddenIdsForHandle(map, "demo"), ["media-1"]);
    assert.equal(parseHiddenCookie(serializeHiddenCookie(map)).demo?.[0], "media-1");
    assert.deepEqual(parseHiddenCookie("not-json"), {});
    assert.deepEqual(parseHiddenCookie(undefined), {});
  });

  it("hides and restores the same media id", () => {
    let map = hideFromKitStore({}, "demo", "a");
    map = hideFromKitStore(map, "demo", "a");
    assert.deepEqual(hiddenIdsForHandle(map, "demo"), ["a"]);
    map = restoreToKitStore(map, "demo", "a");
    assert.deepEqual(hiddenIdsForHandle(map, "demo"), []);
    assert.equal("demo" in map, false);
  });

  it("filters hidden media before kit assembly", () => {
    const rows = [{ id: "keep" }, { id: "drop" }];
    assert.deepEqual(
      mediaVisibleOnKit(rows, ["drop"]).map((row) => row.id),
      ["keep"],
    );
  });

  it("confirm hide then undo restores the same record", () => {
    const posts = [
      { id: "coastal-table" },
      { id: "morning-studio" },
    ];
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
});
