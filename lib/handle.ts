/**
 * WHA-313: freeze handle at first connect by default.
 * Keep `.` and `_`. Collision suffix `-2` (then `-3`…). Do not hyphenate periods.
 */

import { DEMO_HANDLE } from "./seed";

export const HANDLE_UPDATE_LABEL_PREFIX = "Update kit URL to @";

export function pitchkitHandleFromUsername(username: string): string {
  return username.trim();
}

export function usernameDiffersFromHandle(handle: string, igUsername: string): boolean {
  return pitchkitHandleFromUsername(igUsername) !== handle;
}

export function isHandleTaken(handle: string, taken: Iterable<string>): boolean {
  const set = taken instanceof Set ? taken : new Set(taken);
  return set.has(handle);
}

/** First unused slug: `desired`, then `desired-2`, `desired-3`, … */
export function uniqueHandle(desired: string, taken: Iterable<string>): string {
  const slug = pitchkitHandleFromUsername(desired);
  const set = taken instanceof Set ? taken : new Set(taken);
  if (!set.has(slug)) {
    return slug;
  }
  let n = 2;
  while (set.has(`${slug}-${n}`)) {
    n += 1;
  }
  return `${slug}-${n}`;
}

/**
 * Reconnect: default keep the frozen URL. Opt-in (`updateHandle`) moves to @{new}.
 * Seed `/k/demo` stays reserved. A live snapshot stuck on `demo` whose
 * Instagram username is not `demo` escapes the freeze and takes a unique handle.
 */
export function handleAfterReconnect(input: {
  existingHandle: string;
  igUsername: string;
  updateHandle?: boolean;
  taken: Iterable<string>;
  frozenHandles?: Iterable<string>;
}): string {
  const frozen = new Set(input.frozenHandles ?? [DEMO_HANDLE]);
  const desired = pitchkitHandleFromUsername(input.igUsername);
  if (frozen.has(input.existingHandle)) {
    if (desired === input.existingHandle) {
      return input.existingHandle;
    }
    const taken = new Set(input.taken);
    for (const handle of frozen) {
      taken.add(handle);
    }
    return uniqueHandle(desired, taken);
  }
  if (!input.updateHandle) {
    return input.existingHandle;
  }
  if (desired === input.existingHandle) {
    return input.existingHandle;
  }
  const taken = new Set(input.taken);
  taken.delete(input.existingHandle);
  return uniqueHandle(desired, taken);
}

/**
 * Live Instagram OAuth kit handle. Never `demo` — `resolveSession("demo")` is
 * null when live secrets exist, so a `pitchkit_session=demo` cookie is a
 * Connect loop. First connect and reconnect share unique-handle rules; a
 * snapshot stuck on `demo` with a real `/me` username escapes.
 */
export function liveOAuthHandle(input: {
  existingHandle?: string | null;
  igUsername: string;
  updateHandle?: boolean;
  taken: Iterable<string>;
}): string {
  const taken = new Set(input.taken);
  taken.add(DEMO_HANDLE);
  const handle = input.existingHandle
    ? handleAfterReconnect({
        existingHandle: input.existingHandle,
        igUsername: input.igUsername,
        updateHandle: input.updateHandle,
        taken,
      })
    : uniqueHandle(pitchkitHandleFromUsername(input.igUsername), taken);
  if (handle !== DEMO_HANDLE) {
    return handle;
  }
  return uniqueHandle(pitchkitHandleFromUsername(input.igUsername), taken);
}

export function handleUpdateOffer(existingHandle: string, igUsername: string): string | null {
  if (!usernameDiffersFromHandle(existingHandle, igUsername)) {
    return null;
  }
  return `${HANDLE_UPDATE_LABEL_PREFIX}${pitchkitHandleFromUsername(igUsername)}`;
}
