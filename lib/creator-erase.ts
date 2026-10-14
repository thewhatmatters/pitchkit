/**
 * Real data delete for one creator. Used by owner Disconnect / Delete account
 * (`/auth/disconnect`) and Meta's data deletion callback
 * (`POST /api/meta/data-deletion`).
 *
 * Every write path that stores creator data, and where it lives:
 * - Profile, tokens, posts + metrics (incl. per-post Insights), hidden posts:
 *   SQL `users` / `media` (`media.hidden_from_kit_at`) when Hyperdrive owns the user.
 * - Same, KV fallback: `graph:id:<userId>` snapshot (user + media + reach_series
 *   + audience + intro + past_brands + theme), `graph:handle:<handle>`,
 *   `graph:ig:<igUserId>` (`lib/graph-store.ts` `putSnapshot`).
 * - Account Insights (reach_series), audience breakdowns, intro, past brands,
 *   theme when SQL owns the rows: `graph:payload:<userId>`.
 * - Hidden-post overlay: `hidden:<userId>` (`lib/hidden-kit-kv.ts`).
 * - Sessions: `session:<sha256(token)>` via `session-index:<userId>`
 *   (`lib/session-store.ts`). Cookies (`pitchkit_session`, `pitchkit_hidden`)
 *   are cleared by the route.
 * R2: no creator objects are written yet (`r2_key` holds Instagram CDN URLs),
 * so there is no bucket prefix to purge. Add it here when R2 copies land.
 *
 * Idempotent: erasing an already-erased (or unknown) creator succeeds.
 */

import {
  GRAPH_HANDLE_PREFIX,
  GRAPH_IG_PREFIX,
  GRAPH_PAYLOAD_PREFIX,
  GRAPH_USER_PREFIX,
  readGraphSnapshot,
  readGraphSnapshotByHandle,
  readGraphSnapshotByIgUserId,
} from "./graph-store";
import { hiddenKitKey, readHiddenKitBinding, type HiddenKitAccess, type HiddenKitNamespace } from "./hidden-kit-kv";
import { deleteAllServerSessionsForUser } from "./session-store";
import { resolveSqlStore } from "./sql-store";

export type EraseTarget = {
  userId?: string | null;
  handle?: string | null;
  igUserId?: string | null;
};

export type EraseResult = {
  ok: boolean;
  /** True when we found stored data for this creator before erasing. */
  found: boolean;
};

async function removeKey(ns: HiddenKitNamespace, key: string): Promise<void> {
  if (ns.delete) {
    await ns.delete(key);
    return;
  }
  // Binding without delete: overwrite with empty. Every parser treats "" as missing.
  await ns.put(key, "");
}

async function resolveIdentity(
  target: EraseTarget,
  access: HiddenKitAccess,
): Promise<{ userIds: Set<string>; handles: Set<string>; igUserIds: Set<string> }> {
  const userIds = new Set<string>();
  const handles = new Set<string>();
  const igUserIds = new Set<string>();
  if (target.userId) userIds.add(target.userId);
  if (target.handle) handles.add(target.handle);
  if (target.igUserId) igUserIds.add(target.igUserId);

  const snapshots = await Promise.all([
    target.userId ? readGraphSnapshot(target.userId, access) : null,
    target.handle ? readGraphSnapshotByHandle(target.handle, access) : null,
    target.igUserId ? readGraphSnapshotByIgUserId(target.igUserId, access) : null,
  ]);
  for (const snapshot of snapshots) {
    if (!snapshot) continue;
    userIds.add(snapshot.user.id);
    handles.add(snapshot.user.handle);
    igUserIds.add(snapshot.user.ig_user_id);
  }

  // KV pointers can outlive a snapshot (e.g. a half-written persist).
  const ns = await readHiddenKitBinding(access);
  if (ns) {
    for (const handle of handles) {
      const id = await ns.get(`${GRAPH_HANDLE_PREFIX}${handle}`);
      if (id) userIds.add(id);
    }
    for (const ig of igUserIds) {
      const id = await ns.get(`${GRAPH_IG_PREFIX}${ig}`);
      if (id) userIds.add(id);
    }
  }
  return { userIds, handles, igUserIds };
}

export async function eraseCreatorData(
  target: EraseTarget,
  access: HiddenKitAccess = "route",
): Promise<EraseResult> {
  const { userIds, handles, igUserIds } = await resolveIdentity(target, access);
  let ok = true;
  let found = false;

  try {
    const sql = await resolveSqlStore(access);
    if (sql) {
      for (const userId of userIds) {
        if (await sql.findUserById(userId)) found = true;
        if (!(await sql.deleteUser(userId))) ok = false;
      }
    }
  } catch {
    ok = false;
  }

  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    // No KV binding at all: nothing stored there, but sessions could not be revoked either.
    return { ok: false, found };
  }
  try {
    const keys: string[] = [];
    for (const userId of userIds) {
      keys.push(
        `${GRAPH_USER_PREFIX}${userId}`,
        `${GRAPH_PAYLOAD_PREFIX}${userId}`,
        hiddenKitKey(userId),
      );
    }
    for (const handle of handles) keys.push(`${GRAPH_HANDLE_PREFIX}${handle}`);
    for (const ig of igUserIds) keys.push(`${GRAPH_IG_PREFIX}${ig}`);
    for (const key of keys) {
      if (await ns.get(key)) found = true;
      await removeKey(ns, key);
    }
    for (const userId of userIds) {
      if (!(await deleteAllServerSessionsForUser(userId, access))) ok = false;
    }
  } catch {
    ok = false;
  }
  return { ok, found };
}
