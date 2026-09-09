import { getCloudflareContext } from "@opennextjs/cloudflare";

/** wrangler binding — namespace `pitchkit-hidden-kit`. */
export const HIDDEN_KIT_BINDING = "HIDDEN_KIT";

export type HiddenRecord = Record<string, string>;

/** Minimal Workers KV surface. Injectable for unit tests. */
export type HiddenKitNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

export type HiddenKitStore = {
  get(userId: string): Promise<HiddenRecord | undefined>;
  put(userId: string, hidden: HiddenRecord): Promise<boolean>;
};

/** Route handlers use sync context; pages / metadata use async context. */
export type HiddenKitAccess = "route" | "page";

let injectedNamespace: HiddenKitNamespace | null | undefined;

export function hiddenKitKey(userId: string): string {
  return `hidden:${userId}`;
}

export function parseHiddenRecord(raw: string | null | undefined): HiddenRecord | undefined {
  if (raw == null || raw === "") {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined;
    }
    const hidden: HiddenRecord = {};
    for (const [mediaId, at] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof at === "string" && at.length > 0) {
        hidden[mediaId] = at;
      }
    }
    return hidden;
  } catch {
    return undefined;
  }
}

export function serializeHiddenRecord(hidden: HiddenRecord): string {
  return JSON.stringify(hidden);
}

/** In-memory KV stand-in. Seed with `userId → Record<mediaId, ISO>`. */
export function createMemoryHiddenKit(
  seed: Record<string, HiddenRecord> = {},
): HiddenKitNamespace {
  const data = new Map<string, string>();
  for (const [userId, hidden] of Object.entries(seed)) {
    data.set(hiddenKitKey(userId), serializeHiddenRecord(hidden));
  }
  return {
    async get(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    async put(key, value) {
      data.set(key, value);
    },
  };
}

export function hiddenKitStoreFromNamespace(ns: HiddenKitNamespace): HiddenKitStore {
  return {
    async get(userId) {
      return parseHiddenRecord(await ns.get(hiddenKitKey(userId)));
    },
    async put(userId, hidden) {
      try {
        await ns.put(hiddenKitKey(userId), serializeHiddenRecord(hidden));
        return true;
      } catch {
        return false;
      }
    },
  };
}

/** Tests: pass a fake namespace, or `null` to simulate a missing binding. */
export function setHiddenKitNamespaceForTests(ns: HiddenKitNamespace | null | undefined): void {
  injectedNamespace = ns;
}

function hiddenKitFromEnv(env: unknown): HiddenKitNamespace | null {
  if (!env || typeof env !== "object") {
    return null;
  }
  const ns = (env as { HIDDEN_KIT?: HiddenKitNamespace }).HIDDEN_KIT;
  if (!ns || typeof ns.get !== "function" || typeof ns.put !== "function") {
    return null;
  }
  return ns;
}

/**
 * Routes: `getCloudflareContext().env.HIDDEN_KIT`.
 * Pages: `await getCloudflareContext({ async: true }).env.HIDDEN_KIT`.
 */
export async function readHiddenKitBinding(
  access: HiddenKitAccess,
): Promise<HiddenKitNamespace | null> {
  if (injectedNamespace !== undefined) {
    return injectedNamespace;
  }

  try {
    if (access === "page") {
      const { env } = await getCloudflareContext({ async: true });
      return hiddenKitFromEnv(env);
    }
    const { env } = getCloudflareContext();
    return hiddenKitFromEnv(env);
  } catch {
    return null;
  }
}

export async function resolveHiddenKitStore(
  access: HiddenKitAccess,
): Promise<HiddenKitStore | null> {
  const ns = await readHiddenKitBinding(access);
  return ns ? hiddenKitStoreFromNamespace(ns) : null;
}
