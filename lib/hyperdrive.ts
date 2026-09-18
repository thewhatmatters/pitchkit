/**
 * Explicit Hyperdrive binding detection. Fail-closed: missing / empty /
 * malformed bindings are off. node:test never inherits a local connection
 * string from the shell.
 *
 * Workers: `env.HYPERDRIVE.connectionString` (prod) or `HYPERDRIVE_PREVIEW`.
 * Local Next without a Worker binding: optional `HYPERDRIVE_LOCAL_CONNECTION_STRING`.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { HiddenKitAccess } from "./hidden-kit-kv";

export const HYPERDRIVE_BINDING = "HYPERDRIVE";
export const HYPERDRIVE_PREVIEW_BINDING = "HYPERDRIVE_PREVIEW";
export const LOCAL_CONNECTION_ENV = "HYPERDRIVE_LOCAL_CONNECTION_STRING";

export type HyperdriveBinding = {
  connectionString: string;
};

let injectedBinding: HyperdriveBinding | null | undefined;
let injectedFlag: boolean | undefined;

/** Tests: pass a binding, `null` for absent, or `undefined` to restore default. */
export function setHyperdriveBindingForTests(
  binding: HyperdriveBinding | null | undefined,
): void {
  injectedBinding = binding;
  injectedFlag = binding === undefined ? undefined : binding != null;
}

/** Tests: force the feature flag without a connection string. */
export function setHasHyperdriveForTests(flag: boolean | undefined): void {
  injectedFlag = flag;
  if (flag === undefined && injectedBinding === undefined) {
    return;
  }
  if (flag === false) {
    injectedBinding = injectedBinding === undefined ? undefined : null;
  }
}

export function resetHyperdriveForTests(): void {
  injectedBinding = undefined;
  injectedFlag = undefined;
}

function nonEmptyConnectionString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function bindingFromUnknown(value: unknown): HyperdriveBinding | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const connectionString = nonEmptyConnectionString(
    (value as { connectionString?: unknown }).connectionString,
  );
  if (!connectionString) {
    return null;
  }
  return { connectionString };
}

/** Prod `HYPERDRIVE` wins over preview when both are present and valid. */
export function hyperdriveFromEnv(env: unknown): HyperdriveBinding | null {
  if (!env || typeof env !== "object") {
    return null;
  }
  const rec = env as Record<string, unknown>;
  return (
    bindingFromUnknown(rec[HYPERDRIVE_BINDING]) ??
    bindingFromUnknown(rec[HYPERDRIVE_PREVIEW_BINDING])
  );
}

function localConnectionBinding(): HyperdriveBinding | null {
  if (process.env.NODE_TEST_CONTEXT) {
    return null;
  }
  const connectionString = nonEmptyConnectionString(process.env[LOCAL_CONNECTION_ENV]);
  return connectionString ? { connectionString } : null;
}

/**
 * Sync peek for tests and comments. Default is off (fail-closed).
 * Live Workers / pages must use `resolveHasHyperdrive`.
 */
export function hasHyperdrive(): boolean {
  if (injectedFlag !== undefined) {
    return injectedFlag;
  }
  if (process.env.NODE_TEST_CONTEXT) {
    return false;
  }
  return false;
}

export async function readHyperdriveBinding(
  access: HiddenKitAccess = "page",
): Promise<HyperdriveBinding | null> {
  if (injectedBinding !== undefined) {
    return injectedBinding;
  }
  if (process.env.NODE_TEST_CONTEXT) {
    return null;
  }

  try {
    const ctx =
      access === "page" ? await getCloudflareContext({ async: true }) : getCloudflareContext();
    const fromWorker = hyperdriveFromEnv(ctx.env);
    if (fromWorker) {
      return fromWorker;
    }
  } catch {
    // Local Next or missing Cloudflare context.
  }

  return localConnectionBinding();
}

/** True only when a usable Hyperdrive (or local) connection string is present. */
export async function resolveHasHyperdrive(
  access: HiddenKitAccess = "page",
): Promise<boolean> {
  if (injectedFlag !== undefined) {
    return injectedFlag;
  }
  return (await readHyperdriveBinding(access)) != null;
}
