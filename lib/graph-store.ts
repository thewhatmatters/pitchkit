/**
 * Persist Graph poll snapshots.
 * Hyperdrive bound → SQL is preferred SoT for users / media (DATA.md columns).
 * If SQL write fails or the SQL store is missing, fall back to KV `HIDDEN_KIT`
 * under `graph:` keys (same as pre-Hyperdrive). Never refuse KV solely because
 * Hyperdrive is bound. False only when both writes fail / KV is missing.
 * `reach_series` + audience stay on the kit payload, not SQL — stored as
 * `graph:payload:` extras when SQL owns the rows.
 */

import type { RankedShare } from "./audience";
import {
  readHiddenKitBinding,
  resolveHiddenKitStore,
  type HiddenKitAccess,
  type HiddenKitNamespace,
} from "./hidden-kit-kv";
import { resolveHasHyperdrive } from "./hyperdrive";
import type { ReachPoint } from "./reach-series";
import type { Media, User } from "./schema";
import { resolveSqlStore } from "./sql-store";

export const GRAPH_USER_PREFIX = "graph:id:";
export const GRAPH_HANDLE_PREFIX = "graph:handle:";
export const GRAPH_IG_PREFIX = "graph:ig:";
export const GRAPH_PAYLOAD_PREFIX = "graph:payload:";

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

function payloadKey(userId: string): string {
  return `${GRAPH_PAYLOAD_PREFIX}${userId}`;
}

export type GraphPayloadExtras = {
  reach_series: ReachPoint[];
  audience: AudienceMixes;
  polled_at: string;
};

function extrasFromSnapshot(snapshot: GraphSnapshot): GraphPayloadExtras {
  return {
    reach_series: snapshot.reach_series,
    audience: snapshot.audience,
    polled_at: snapshot.polled_at,
  };
}

function emptyExtras(polledAt = ""): GraphPayloadExtras {
  return {
    reach_series: [],
    audience: EMPTY_AUDIENCE,
    polled_at: polledAt,
  };
}

function isPayloadExtras(value: unknown): value is GraphPayloadExtras {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as GraphPayloadExtras;
  return (
    Array.isArray(row.reach_series) &&
    row.audience != null &&
    typeof row.polled_at === "string"
  );
}

function parsePayloadExtras(raw: string | null): GraphPayloadExtras | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPayloadExtras(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function readPayloadExtras(
  userId: string,
  access: HiddenKitAccess,
  fallbackPolledAt: string,
): Promise<GraphPayloadExtras> {
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return emptyExtras(fallbackPolledAt);
  }
  return parsePayloadExtras(await ns.get(payloadKey(userId))) ?? emptyExtras(fallbackPolledAt);
}

async function writePayloadExtras(
  userId: string,
  extras: GraphPayloadExtras,
  access: HiddenKitAccess,
): Promise<void> {
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return;
  }
  try {
    await ns.put(payloadKey(userId), JSON.stringify(extras));
  } catch {
    // Payload extras are not SQL. Kit still loads users/media.
  }
}

function snapshotFromSql(
  user: User,
  media: Media[],
  extras: GraphPayloadExtras,
): GraphSnapshot {
  return {
    user,
    media,
    reach_series: extras.reach_series,
    audience: extras.audience,
    polled_at: extras.polled_at,
  };
}

async function applyHiddenOverlayFromKv(
  userId: string,
  media: Media[],
  access: HiddenKitAccess,
): Promise<Media[]> {
  const store = await resolveHiddenKitStore(access);
  if (!store) {
    return media;
  }
  const hidden = await store.get(userId);
  if (!hidden) {
    return media;
  }
  return media.map((row) => ({
    ...row,
    hidden_from_kit_at: row.hidden_from_kit_at ?? hidden[row.id] ?? null,
  }));
}

async function writeSqlSnapshot(
  snapshot: GraphSnapshot,
  access: HiddenKitAccess,
): Promise<boolean> {
  try {
    const sql = await resolveSqlStore(access);
    if (!sql) {
      return false;
    }
    const media = await applyHiddenOverlayFromKv(snapshot.user.id, snapshot.media, access);
    if (!(await sql.upsertUser(snapshot.user))) {
      return false;
    }
    if (!(await sql.replaceUserMedia(snapshot.user.id, media))) {
      return false;
    }
    await writePayloadExtras(snapshot.user.id, extrasFromSnapshot(snapshot), access);
    return true;
  } catch {
    // Thrown DB / overlay errors must not escape writeGraphSnapshot.
    return false;
  }
}

async function readSqlSnapshotByUserId(
  userId: string,
  access: HiddenKitAccess,
): Promise<GraphSnapshot | null> {
  try {
    const sql = await resolveSqlStore(access);
    if (!sql) {
      return null;
    }
    const user = await sql.findUserById(userId);
    if (!user) {
      return null;
    }
    const media = await sql.listMediaByUserId(userId);
    const extras = await readPayloadExtras(userId, access, user.connected_at);
    return snapshotFromSql(user, media, extras);
  } catch {
    return null;
  }
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
  const fromSql = await readSqlSnapshotByUserId(userId, access);
  if (fromSql) {
    return fromSql;
  }
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
  try {
    const sql = await resolveSqlStore(access);
    if (sql) {
      const user = await sql.findUserByHandle(handle);
      if (user) {
        const media = await sql.listMediaByUserId(user.id);
        const extras = await readPayloadExtras(user.id, access, user.connected_at);
        return snapshotFromSql(user, media, extras);
      }
    }
  } catch {
    // SQL threw — fall through to KV so a KV persist is still resolvable.
  }
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
  try {
    const sql = await resolveSqlStore(access);
    if (sql) {
      const user = await sql.findUserByIgUserId(igUserId);
      if (user) {
        const media = await sql.listMediaByUserId(user.id);
        const extras = await readPayloadExtras(user.id, access, user.connected_at);
        return snapshotFromSql(user, media, extras);
      }
    }
  } catch {
    // SQL threw — fall through to KV.
  }
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
  try {
    const sql = await resolveSqlStore(access);
    if (sql) {
      return new Set<string>(["demo", ...(await sql.listHandles())]);
    }
  } catch {
    // SQL threw — seed `demo` only (KV has no list).
  }
  // KV has no list in this binding surface. Taken set is the requested handle
  // plus any snapshot we can resolve — callers also pass seed `demo`.
  void access;
  return new Set<string>(["demo"]);
}

export async function writeGraphSnapshot(
  snapshot: GraphSnapshot,
  access: HiddenKitAccess = "page",
): Promise<boolean> {
  try {
    const sql = await resolveSqlStore(access);
    if (sql) {
      try {
        if (await writeSqlSnapshot(snapshot, access)) {
          return true;
        }
      } catch {
        // SQL upsert threw — still try KV so OAuth can persist.
      }
    }
  } catch {
    // resolveSqlStore / Hyperdrive client threw — still try KV.
  }
  try {
    return await writeKvSnapshot(snapshot, access);
  } catch {
    return false;
  }
}

async function writeKvSnapshot(
  snapshot: GraphSnapshot,
  access: HiddenKitAccess,
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
 * Persist disconnect: SQL `disconnected_at` + null tokens when Hyperdrive
 * owns the user; else stamp the KV Graph snapshot. No row → false
 * (seed `demo` stays the public seed).
 */
export async function persistOwnerDisconnect(
  session: { handle: string; userId: string },
  access: HiddenKitAccess = "route",
  at: string = new Date().toISOString(),
): Promise<boolean> {
  const sql = await resolveSqlStore(access);
  if (sql) {
    const owned = await sql.findUserById(session.userId);
    if (owned) {
      return sql.disconnectUser(session.userId, at);
    }
    if (await resolveHasHyperdrive(access)) {
      return false;
    }
  }
  const snapshot =
    (await readGraphSnapshot(session.userId, access)) ??
    (await readGraphSnapshotByHandle(session.handle, access));
  if (!snapshot) {
    return false;
  }
  return writeGraphSnapshot(disconnectGraphSnapshot(snapshot, at), access);
}

