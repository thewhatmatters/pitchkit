import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { before, describe, it } from "node:test";
import { JSDOM } from "jsdom";

const JSDOM_KEYS = [
  "window",
  "document",
  "HTMLElement",
  "Node",
  "Element",
  "HTMLDivElement",
  "DocumentFragment",
  "Text",
  "Comment",
  "Document",
  "Event",
  "CustomEvent",
  "KeyboardEvent",
  "MouseEvent",
  "FocusEvent",
  "MutationObserver",
] as const;

type InstalledKey = (typeof JSDOM_KEYS)[number];

function defineGlobal(name: string, value: unknown) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value,
  });
}

function installJsdom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
  });
  const { window } = dom;
  for (const key of JSDOM_KEYS) {
    defineGlobal(key, window[key as InstalledKey]);
  }
  defineGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 16),
  );
  defineGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  defineGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  defineGlobal("matchMedia", () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  }));
  defineGlobal("getComputedStyle", window.getComputedStyle.bind(window));
}

describe("fail-closed: Hide-from-kit AlertDialog role=dialog", () => {
  before(() => {
    installJsdom();
  });

  it("ProofPosts mounts WMDS AlertDialog with confirmLabel Hide from kit", () => {
    const proof = readFileSync(join(process.cwd(), "components/proof-posts.tsx"), "utf8");
    assert.match(proof, /<AlertDialog/);
    assert.match(proof, /confirmLabel="Hide from kit"/);
    assert.match(proof, /title="Hide this post from PitchKit\?"/);
    assert.match(proof, /from "@\/components\/wmds"/);
    assert.match(readFileSync(join(process.cwd(), "components/wmds.ts"), "utf8"), /AlertDialog/);
  });

  it("WMDS AlertDialog confirm exposes accessible dialog semantics", async () => {
    const { createElement } = await import("react");
    const { createRoot } = await import("react-dom/client");
    const { AlertDialog } = await import("@whatmatters/wmds");

    const host = document.createElement("div");
    document.body.appendChild(host);
    createRoot(host).render(
      createElement(AlertDialog, {
        open: true,
        onOpenChange: () => {},
        title: "Hide this post from PitchKit?",
        description: "It will no longer appear in the shareable PitchKit. You can add it back later.",
        cancelLabel: "Keep post",
        confirmLabel: "Hide from kit",
        onConfirm: () => {},
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 80));

    const dialog = document.querySelector('[role="dialog"], [role="alertdialog"]');
    assert.ok(
      dialog,
      "WMDS AlertDialog must expose role=dialog (or ARIA subclass alertdialog). If this fails, WMDS must fix — do not invent a Pitchkit atom.",
    );
    const role = dialog.getAttribute("role");
    assert.match(
      role ?? "",
      /^(dialog|alertdialog)$/,
      `expected role=dialog (ARIA dialog family); got ${role ?? "null"}`,
    );
    assert.match(dialog.textContent ?? "", /Hide from kit/);
    assert.match(dialog.textContent ?? "", /Hide this post from PitchKit\?/);
  });
});
