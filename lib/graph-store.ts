/**
 * Persist Graph poll snapshots until Hyperdrive exists.
 * Same User / Media columns as DATA.md. KV keys on HIDDEN_KIT (prefix `graph:`).
 * `reach_series` + audience stay on the kit payload, not SQL.
 */

import type { RankedShare } from "./audience";
import {
  readHiddenKitBinding,
  type HiddenKitAccess,
  type HiddenKitNamespace,
} from "./hidden-kit-kv";
import type { ReachPoint } from "./reach-series";
import type { Media, User } from "./schema";

export const GRAPH_USER_PREFIX = "graph:id:";
export const GRAPH_HANDLE_PREFIX = "graph:handle:";
export const GRAPH_IG_PREFIX = "graph:ig:";

export type AudienceMixes = {
  country: RankedShare[];
  city: RankedShare[];
  age: RankedShare[];
  gender: RankedShare[];
};

export const EMPTY_AUDIENCE: AudienceMixes = {
  country: [],
  city: [],
  age: [],
  gender: [],
};

export type GraphSnapshot = {
  user: User;
  media: Media[];
  reach_series: ReachPoint[];
  audience: AudienceMixes;
  polled_at: string;
};

function snapshotKey(userId: string): string {
  return `${GRAPH_USER_PREFIX}${userId}`;
}

function handleKey(handle: string): string {
  return `${GRAPH_HANDLE_PREFIX}${handle}`;
}

function igKey(igUserId: string): string {
  return `${GRAPH_IG_PREFIX}${igUserId}`;
}

function isSnapshot(value: unknown): value is GraphSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as GraphSnapshot;
  return (
    row.user != null &&
    typeof row.user === "object" &&
    Array.isArray(row.media) &&
    Array.isArray(row.reach_series) &&
    row.audience != null &&
    typeof row.polled_at === "string"
  );
}

function parseSnapshot(raw: string | null): GraphSnapshot | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function readGraphSnapshot(
  userId: string,
  access: HiddenKitAccess = "page",
): Promise<GraphSnapshot | null> {
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return null;
  }
  return parseSnapshot(await ns.get(snapshotKey(userId)));
}

export async function readGraphSnapshotByHandle(
  handle: string,
  access: HiddenKitAccess = "page",
): Promise<GraphSnapshot | null> {
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return null;
  }
  const userId = await ns.get(handleKey(handle));
  if (!userId) {
    return null;
  }
  return parseSnapshot(await ns.get(snapshotKey(userId)));
}

export async function readGraphSnapshotByIgUserId(
  igUserId: string,
  access: HiddenKitAccess = "page",
): Promise<GraphSnapshot | null> {
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return null;
  }
  const userId = await ns.get(igKey(igUserId));
  if (!userId) {
    return null;
  }
  return parseSnapshot(await ns.get(snapshotKey(userId)));
}

export async function listTakenHandles(access: HiddenKitAccess = "page"): Promise<Set<string>> {
  // KV has no list in this binding surface. Taken set is the requested handle
  // plus any snapshot we can resolve — callers also pass seed `demo`.
  void access;
  return new Set<string>(["demo"]);
}

export async function writeGraphSnapshot(
  snapshot: GraphSnapshot,
  access: HiddenKitAccess = "page",
): Promise<boolean> {
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return false;
  }
  return putSnapshot(ns, snapshot);
}

async function putSnapshot(ns: HiddenKitNamespace, snapshot: GraphSnapshot): Promise<boolean> {
  try {
    const previous = parseSnapshot(await ns.get(snapshotKey(snapshot.user.id)));
    if (previous && previous.user.handle !== snapshot.user.handle) {
      await ns.put(handleKey(previous.user.handle), "");
    }
    await ns.put(snapshotKey(snapshot.user.id), JSON.stringify(snapshot));
    await ns.put(handleKey(snapshot.user.handle), snapshot.user.id);
    await ns.put(igKey(snapshot.user.ig_user_id), snapshot.user.id);
    return true;
  } catch {
    return false;
  }
}

/** Taken handles from seed + a candidate we already know about. */
export function takenHandlesWith(extra: Iterable<string>): Set<string> {
  return new Set(["demo", ...extra]);
}

/** Stamp disconnect on the user row and drop stored Graph tokens. */
export function markUserDisconnected(user: User, at: string): User {
  return {
    ...user,
    disconnected_at: at,
    token_encrypted: null,
    refresh_encrypted: null,
    token_expires_at: null,
  };
}

export function disconnectGraphSnapshot(snapshot: GraphSnapshot, at: string): GraphSnapshot {
  return {
    ...snapshot,
    user: markUserDisconnected(snapshot.user, at),
  };
}

/**
 * Persist disconnect on the KV Graph snapshot (`graph:` until Neon).
 * No snapshot → nothing to stamp (seed `demo` stays the public seed).
 */
export async function persistOwnerDisconnect(
  session: { handle: string; userId: string },
  access: HiddenKitAccess = "route",
  at: string = new Date().toISOString(),
): Promise<boolean> {
  const snapshot =
    (await readGraphSnapshot(session.userId, access)) ??
    (await readGraphSnapshotByHandle(session.handle, access));
  if (!snapshot) {
    return false;
  }
  return writeGraphSnapshot(disconnectGraphSnapshot(snapshot, at), access);
}

