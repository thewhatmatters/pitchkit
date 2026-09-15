#!/usr/bin/env node
/**
 * Disposable-browser harness for `.cursor/skills/verify-pitchkit`.
 * Never launches the user's main Chrome profile. Session lives under
 * `.cursor/skills/verify-pitchkit/.run/` (gitignored).
 *
 * Install (scoped; does not touch the app package.json):
 *   cd .cursor/skills/verify-pitchkit/helpers && npm install
 * Chrome channel is preferred (system Google Chrome). Fallback: bundled Chromium
 *   npx playwright install chromium
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HELPERS_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(HELPERS_DIR, "..");
const DEFAULT_BASE = "https://pitchkit.app";
const SESSION_COOKIE = "pitchkit_session";
const SEED_MEDIA_IDS = [1, 2, 3, 4, 5, 6].map(
  (n) => `00000000-0000-4000-8000-00000000000${n}`,
);
const COMMON_ROLES = ["button", "tab", "radio", "link", "menuitem", "menuitemcheckbox"];

const IDENTITY_MARKERS = [
  "Pitchkit",
  "Continue with Instagram",
  "Instagram media kit",
];

function skillRunDir() {
  return process.env.PITCHKIT_VERIFY_DIR || path.join(SKILL_DIR, ".run");
}

function baseUrl() {
  return (process.env.PITCHKIT_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

function statePath() {
  return path.join(skillRunDir(), "state.json");
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(statePath(), "utf8"));
  } catch {
    return {};
  }
}

function writeState(patch) {
  const dir = skillRunDir();
  fs.mkdirSync(dir, { recursive: true });
  const next = { ...readState(), ...patch };
  fs.writeFileSync(statePath(), `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

function resolveArtifactPath(input) {
  if (!input) {
    return null;
  }
  if (path.isAbsolute(input)) {
    return input;
  }
  if (input.startsWith("artifacts/") || input.startsWith(`artifacts${path.sep}`)) {
    return path.join(SKILL_DIR, input);
  }
  return path.resolve(input);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--") {
      out._.push(...argv.slice(i + 1));
      break;
    }
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next == null || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i += 1;
      }
    } else {
      out._.push(token);
    }
  }
  return out;
}

function usage() {
  return `control-pitchkit — disposable Playwright harness for Pitchkit

Usage:
  control-pitchkit doctor [--require-session] [--base-url URL]
  control-pitchkit connect [--base-url URL]
  control-pitchkit goto <path-or-url> [--fresh]
  control-pitchkit click --name <name> [--role <role>] [--exact]
  control-pitchkit fill --name <name> --value <value> [--role <role>]
  control-pitchkit wait --name <name> [--role <role>]
  control-pitchkit wait --selector <css>
  control-pitchkit screenshot --path <path> [--fresh] [--goto <path>]
  control-pitchkit snapshot --aria [--path <path>] [--fresh] [--goto <path>]
  control-pitchkit eval --js <expression> [--fresh] [--goto <path>]
  control-pitchkit cookies [--name <cookie>]
  control-pitchkit restore-seed
  control-pitchkit cleanup [--restore-hidden]

Env:
  PITCHKIT_BASE_URL     default https://pitchkit.app
  PITCHKIT_VERIFY_DIR   disposable profile + state (default <skill>/.run)
  PITCHKIT_HEADED=1     show the window

Paths that start with artifacts/ resolve under this skill directory.
--fresh opens a one-shot context with no cookies (anon / incognito).
Never points Chromium at the user's main browser profile.`;
}

async function loadPlaywright() {
  const localEntry = path.join(HELPERS_DIR, "node_modules", "playwright", "index.mjs");
  if (fs.existsSync(localEntry)) {
    return import(pathToFileURL(localEntry).href);
  }
  try {
    return await import("playwright");
  } catch {
    const install = spawnSync("npm", ["install"], {
      cwd: HELPERS_DIR,
      stdio: "inherit",
      env: process.env,
    });
    if (install.status !== 0) {
      throw new Error(
        "Playwright is missing. From repo root run:\n  cd .cursor/skills/verify-pitchkit/helpers && npm install\nThen retry. Root package.json is unchanged — this dep stays scoped to the helper.",
      );
    }
    return import(pathToFileURL(localEntry).href);
  }
}

function viewport() {
  const raw = process.env.PITCHKIT_VIEWPORT || "1280x800";
  const [width, height] = raw.split("x").map((n) => Number(n));
  return {
    width: Number.isFinite(width) ? width : 1280,
    height: Number.isFinite(height) ? height : 800,
  };
}

async function launchPersistent(userDataDir) {
  const { chromium } = await loadPlaywright();
  const headed = process.env.PITCHKIT_HEADED === "1";
  const common = {
    headless: !headed,
    viewport: viewport(),
    ignoreHTTPSErrors: true,
  };
  try {
    return await chromium.launchPersistentContext(userDataDir, {
      ...common,
      channel: "chrome",
    });
  } catch (chromeError) {
    try {
      return await chromium.launchPersistentContext(userDataDir, common);
    } catch (bundledError) {
      const hint = spawnSync("npx", ["playwright", "install", "chromium"], {
        cwd: HELPERS_DIR,
        stdio: "inherit",
        env: process.env,
      });
      if (hint.status === 0) {
        return chromium.launchPersistentContext(userDataDir, common);
      }
      throw new Error(
        `Could not launch Chrome (${chromeError.message}) or bundled Chromium (${bundledError.message}). Install Google Chrome or run: cd .cursor/skills/verify-pitchkit/helpers && npx playwright install chromium`,
      );
    }
  }
}

async function withPage(fn, { fresh = false } = {}) {
  const userDataDir = fresh
    ? fs.mkdtempSync(path.join(os.tmpdir(), "pitchkit-verify-fresh-"))
    : path.join(skillRunDir(), "chrome");
  if (!fresh) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const context = await launchPersistent(userDataDir);
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    const result = await fn(page, context);
    if (fresh) {
      writeState({ lastFreshUrl: page.url() });
    } else {
      writeState({ lastUrl: page.url(), baseUrl: baseUrl() });
    }
    return result;
  } finally {
    await context.close();
    if (fresh) {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  }
}

function resolveTarget(target, { fresh = false } = {}) {
  if (!target) {
    const last = fresh ? readState().lastFreshUrl : readState().lastUrl;
    if (last) {
      return last;
    }
    return `${baseUrl()}/`;
  }
  if (/^https?:\/\//.test(target)) {
    return target;
  }
  const pathPart = target.startsWith("/") ? target : `/${target}`;
  return `${baseUrl()}${pathPart}`;
}

async function ensureOnPage(page, target, { fresh = false } = {}) {
  const url = resolveTarget(target, { fresh });
  if (page.url() !== url) {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    return response;
  }
  return null;
}

/** Owner Insights Reach plot waits for host width (WHA-310). Wait inside the same process as the capture. */
async function settlePage(page, flags = {}) {
  if (flags["wait-selector"]) {
    await page.waitForSelector(String(flags["wait-selector"]), { timeout: 15_000, state: "visible" });
  }
  if (flags["wait-name"]) {
    const locator = locatorFor(page, {
      role: flags.role,
      name: flags["wait-name"],
      exact: Boolean(flags.exact),
    });
    await locator.first().waitFor({ state: "visible", timeout: 15_000 });
  }
  const reachSlot = page.locator('[data-chart-slot="reach"]');
  if ((await reachSlot.count()) > 0) {
    await page.waitForSelector(
      '[aria-label="30-day account reach"], [data-chart-slot="reach"]:not([data-x-ticks="0"])',
      { timeout: 15_000 },
    );
  }
}

function locatorFor(page, { role, name, exact }) {
  const options = { name: String(name), exact: Boolean(exact) };
  if (role && role !== "auto") {
    return page.getByRole(role, options);
  }
  const locators = COMMON_ROLES.map((candidate) => page.getByRole(candidate, options));
  return locators.reduce((acc, next) => acc.or(next));
}

async function clickNamed(page, opts) {
  const locator = locatorFor(page, opts);
  await locator.first().click();
}

async function dumpAria(page) {
  const root = page.locator("html");
  if (typeof root.ariaSnapshot === "function") {
    return root.ariaSnapshot();
  }
  const snapshot = await page.accessibility.snapshot();
  return JSON.stringify(snapshot, null, 2);
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function cmdDoctor(flags) {
  const url = flags["base-url"] ? String(flags["base-url"]).replace(/\/$/, "") : baseUrl();
  if (flags["base-url"]) {
    process.env.PITCHKIT_BASE_URL = url;
  }

  let status = null;
  try {
    const response = await fetch(url, { redirect: "follow" });
    status = response.status;
  } catch (error) {
    printJson({ ok: false, url, error: `unreachable: ${error.message}` });
    process.exitCode = 1;
    return;
  }

  const pageInfo = await withPage(async (page) => {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    const body = await page.locator("body").innerText();
    const cookies = await page.context().cookies();
    const session = cookies.some((cookie) => cookie.name === SESSION_COOKIE && cookie.value);
    const identity =
      /pitchkit/i.test(title) &&
      IDENTITY_MARKERS.some((marker) => body.includes(marker) || title.includes(marker));
    return { title, identity, session, href: page.url() };
  });

  const requireSession = Boolean(flags["require-session"]);
  const ok =
    status >= 200 &&
    status < 400 &&
    pageInfo.identity &&
    (!requireSession || pageInfo.session);

  const report = {
    ok,
    url,
    status,
    title: pageInfo.title,
    href: pageInfo.href,
    identity: pageInfo.identity,
    session: pageInfo.session,
    requireSession,
  };

  if (!ok && requireSession && !pageInfo.session) {
    report.hint = "No pitchkit_session cookie. Run: control-pitchkit connect";
  }
  printJson(report);
  if (!ok) {
    process.exitCode = 1;
  }
}

async function cmdConnect(flags) {
  if (flags["base-url"]) {
    process.env.PITCHKIT_BASE_URL = String(flags["base-url"]).replace(/\/$/, "");
  }
  const result = await withPage(async (page, context) => {
    await page.goto(`${baseUrl()}/`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Continue with Instagram" }).click();
    await page.waitForURL("**/insights", { timeout: 15_000 });
    const cookies = await context.cookies();
    const session = cookies.find((cookie) => cookie.name === SESSION_COOKIE);
    return {
      ok: Boolean(session?.value) && new URL(page.url()).pathname === "/insights",
      url: page.url(),
      title: await page.title(),
      session: Boolean(session?.value),
    };
  });
  printJson(result);
  if (!result.ok) {
    process.exitCode = 1;
  }
}

async function cmdGoto(target, flags) {
  if (flags["base-url"]) {
    process.env.PITCHKIT_BASE_URL = String(flags["base-url"]).replace(/\/$/, "");
  }
  const fresh = Boolean(flags.fresh);
  const result = await withPage(async (page) => {
    const response = await page.goto(resolveTarget(target, { fresh }), { waitUntil: "domcontentloaded" });
    return {
      ok: true,
      url: page.url(),
      status: response?.status() ?? null,
      title: await page.title(),
      fresh,
    };
  }, { fresh });
  printJson(result);
}

async function cmdClick(flags) {
  const name = flags.name;
  if (!name) {
    throw new Error('click requires --name "<accessible name>"');
  }
  const result = await withPage(async (page) => {
    await ensureOnPage(page, flags.goto);
    await settlePage(page, flags);
    await clickNamed(page, {
      role: flags.role,
      name,
      exact: Boolean(flags.exact),
    });
    await page.waitForLoadState("domcontentloaded");
    return { ok: true, url: page.url(), title: await page.title(), name, role: flags.role ?? "auto" };
  });
  printJson(result);
}

async function cmdWait(flags) {
  const timeout = Number(flags.timeout) || 15_000;
  const result = await withPage(async (page) => {
    await ensureOnPage(page, flags.goto, { fresh: Boolean(flags.fresh) });
    await settlePage(page, flags);
    if (flags.selector) {
      await page.waitForSelector(String(flags.selector), { timeout, state: "visible" });
      return { ok: true, url: page.url(), selector: String(flags.selector) };
    }
    if (!flags.name) {
      throw new Error('wait requires --name "<accessible name>" or --selector "<css>"');
    }
    const locator = locatorFor(page, {
      role: flags.role,
      name: flags.name,
      exact: Boolean(flags.exact),
    });
    await locator.first().waitFor({ state: "visible", timeout });
    return { ok: true, url: page.url(), name: flags.name, role: flags.role ?? "auto" };
  }, { fresh: Boolean(flags.fresh) });
  printJson(result);
}

async function cmdFill(flags) {
  const name = flags.name;
  const value = flags.value;
  if (!name || value == null) {
    throw new Error('fill requires --name "<accessible name>" --value "<text>"');
  }
  const result = await withPage(async (page) => {
    await ensureOnPage(page, flags.goto);
    await settlePage(page, flags);
    const role = flags.role || "textbox";
    await page.getByRole(role, { name: String(name) }).fill(String(value));
    return { ok: true, url: page.url(), name, role };
  });
  printJson(result);
}

async function cmdScreenshot(flags) {
  const dest = resolveArtifactPath(flags.path);
  if (!dest) {
    throw new Error("screenshot requires --path artifacts/<feature>/name.png");
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const result = await withPage(async (page) => {
    await ensureOnPage(page, flags.goto, { fresh: Boolean(flags.fresh) });
    await settlePage(page, flags);
    await page.screenshot({ path: dest, fullPage: true });
    return { ok: true, url: page.url(), path: dest };
  }, { fresh: Boolean(flags.fresh) });
  printJson(result);
}

async function cmdSnapshot(flags) {
  const dest = resolveArtifactPath(flags.path);
  const result = await withPage(async (page) => {
    await ensureOnPage(page, flags.goto, { fresh: Boolean(flags.fresh) });
    await settlePage(page, flags);
    const aria = await dumpAria(page);
    if (dest) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, `${aria}\n`);
    } else {
      process.stdout.write(`${aria}\n`);
    }
    return { ok: true, url: page.url(), title: await page.title(), path: dest };
  }, { fresh: Boolean(flags.fresh) });
  if (dest) {
    printJson(result);
  }
}

async function cmdEval(flags) {
  const expression = flags.js;
  if (!expression) {
    throw new Error('eval requires --js "<expression>"');
  }
  const result = await withPage(async (page) => {
    await ensureOnPage(page, flags.goto, { fresh: Boolean(flags.fresh) });
    await settlePage(page, flags);
    const value = await page.evaluate((js) => {
      // eslint-disable-next-line no-eval
      return eval(js);
    }, String(expression));
    return { ok: true, url: page.url(), value };
  }, { fresh: Boolean(flags.fresh) });
  printJson(result);
}

async function cmdCookies(flags) {
  const result = await withPage(async (page) => {
    await ensureOnPage(page, flags.goto);
    const cookies = await page.context().cookies();
    const name = flags.name;
    const filtered = name ? cookies.filter((cookie) => cookie.name === name) : cookies;
    return {
      ok: true,
      url: page.url(),
      cookies: filtered.map((cookie) => ({
        name: cookie.name,
        present: Boolean(cookie.value),
        path: cookie.path,
        httpOnly: cookie.httpOnly,
      })),
    };
  });
  printJson(result);
}

async function restoreSeedOn(page) {
  const outcomes = [];
  for (const mediaId of SEED_MEDIA_IDS) {
    const response = await page.request.post(`${baseUrl()}/api/media/restore`, {
      data: { mediaId },
    });
    outcomes.push({ mediaId, status: response.status() });
  }
  return outcomes;
}

async function cmdRestoreSeed() {
  const result = await withPage(async (page, context) => {
    const cookies = await context.cookies();
    if (!cookies.some((cookie) => cookie.name === SESSION_COOKIE && cookie.value)) {
      await page.goto(`${baseUrl()}/`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Continue with Instagram" }).click();
      await page.waitForURL("**/insights", { timeout: 15_000 });
    }
    const outcomes = await restoreSeedOn(page);
    return { ok: true, outcomes };
  });
  printJson(result);
}

function cmdCleanup(flags) {
  return (async () => {
    if (flags["restore-hidden"]) {
      await cmdRestoreSeed();
    }
    const dir = skillRunDir();
    fs.rmSync(dir, { recursive: true, force: true });
    printJson({
      ok: true,
      removed: dir,
      artifactsKept: path.join(SKILL_DIR, "artifacts"),
      restored: Boolean(flags["restore-hidden"]),
    });
  })();
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const [command, ...rest] = flags._;
  if (!command || command === "help" || flags.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  switch (command) {
    case "doctor":
      await cmdDoctor(flags);
      return;
    case "connect":
      await cmdConnect(flags);
      return;
    case "goto":
      await cmdGoto(rest[0], flags);
      return;
    case "click":
      await cmdClick(flags);
      return;
    case "wait":
      await cmdWait(flags);
      return;
    case "fill":
      await cmdFill(flags);
      return;
    case "screenshot":
      await cmdScreenshot(flags);
      return;
    case "snapshot":
      if (!flags.aria && flags.path == null) {
        flags.aria = true;
      }
      await cmdSnapshot(flags);
      return;
    case "eval":
      await cmdEval(flags);
      return;
    case "cookies":
      await cmdCookies(flags);
      return;
    case "restore-seed":
      await cmdRestoreSeed();
      return;
    case "cleanup":
      await cmdCleanup(flags);
      return;
    default:
      throw new Error(`Unknown command "${command}".\n\n${usage()}`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
