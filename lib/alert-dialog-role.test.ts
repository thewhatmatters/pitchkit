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

  it("OwnerPitchKit mounts WMDS AlertDialog with confirmLabel Hide from kit", () => {
    const ownerKit = readFileSync(join(process.cwd(), "components/owner-pitchkit.tsx"), "utf8");
    assert.match(ownerKit, /<AlertDialog/);
    assert.match(ownerKit, /confirmLabel="Hide from kit"/);
    assert.match(ownerKit, /title="Hide this post from PitchKit\?"/);
    assert.match(ownerKit, /from "@\/components\/wmds"/);
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

describe("fail-closed: Delete account AlertDialog initial focus lands on Cancel", () => {
  before(() => {
    installJsdom();
  });

  const settle = () => new Promise((resolve) => setTimeout(resolve, 120));

  function assertFocusOnCancel(where: string) {
    const active = document.activeElement as HTMLElement | null;
    assert.ok(active?.closest('[role="dialog"], [role="alertdialog"]'), `${where}: focus must be inside the dialog`);
    assert.equal(active?.textContent?.trim(), "Cancel", `${where}: initial focus must be Cancel`);
    assert.notEqual(active?.textContent?.trim(), "Delete account", `${where}: never the destructive button`);
  }

  it("Danger zone control wires the WMDS AlertDialog with destructive confirm and no focus override", () => {
    const control = readFileSync(join(process.cwd(), "components/delete-account-control.tsx"), "utf8");
    assert.match(control, /cancelLabel=\{DELETE_ACCOUNT_CANCEL\}/);
    assert.match(control, /confirmLabel=\{DELETE_ACCOUNT_ACTION\}/);
    assert.match(control, /confirmRole="destructive"/);
    assert.match(control, /role="destructive"/);
    assert.match(control, /action="\/auth\/disconnect"/, "keeps the full-erase path");
    assert.doesNotMatch(control, /autoFocus|initialFocus/, "do not override WMDS initial focus");
    const settings = readFileSync(join(process.cwd(), "components/account-settings.tsx"), "utf8");
    assert.match(settings, /<DeleteAccountControl/);
    assert.doesNotMatch(settings, /DISCONNECT_|setDeleteOpen|<AlertDialog/, "menu has Sign out only; delete lives in the Danger zone");
  });

  it("opening Delete account… focuses Cancel, not Delete account", async () => {
    const { createElement, act, useState } = await import("react");
    const { createRoot } = await import("react-dom/client");
    const { AlertDialog, Button } = await import("@whatmatters/wmds");
    const copy = await import("./copy");
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    function Harness() {
      const [open, setOpen] = useState(false);
      return createElement(
        "div",
        null,
        createElement(Button, { role: "destructive", size: "sm", type: "button", onClick: () => setOpen(true), children: copy.DELETE_ACCOUNT_TRIGGER }),
        createElement(AlertDialog, {
          open,
          onOpenChange: setOpen,
          title: copy.DELETE_ACCOUNT_TITLE,
          description: copy.DELETE_ACCOUNT_CONFIRM,
          cancelLabel: copy.DELETE_ACCOUNT_CANCEL,
          confirmLabel: copy.DELETE_ACCOUNT_ACTION,
          confirmRole: "destructive",
          onConfirm: () => {},
        }),
      );
    }
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => root.render(createElement(Harness)));
    const trigger = [...host.querySelectorAll("button")].find((el) => el.textContent?.trim() === copy.DELETE_ACCOUNT_TRIGGER);
    assert.ok(trigger, "Delete account… trigger");
    await act(async () => {
      trigger.focus();
      trigger.click();
    });
    await act(settle);
    assertFocusOnCancel("Danger zone");
    await act(async () => root.unmount());
    host.remove();
  });

  it("user-facing copy never says disconnect", () => {
    const files = ["lib/copy.ts", "app/privacy/page.tsx", "app/delete/page.tsx", "app/data-deletion/page.tsx", "app/data-deletion/status/page.tsx", "app/not-found.tsx", "components/account-settings.tsx", "components/delete-account-control.tsx"];
    for (const f of files) {
      const text = readFileSync(join(process.cwd(), f), "utf8").replace(/\/auth\/disconnect/g, "");
      assert.doesNotMatch(text, /disconnect/i, f);
    }
  });
});
