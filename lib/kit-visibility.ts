/**
 * Hide-from-kit / restore seam (WHA-311 FE, WHA-312 Backend).
 *
 * Product code calls `hideFromKit` / `restoreToKit` only. Do not persist
 * hide state in React memory without going through this module.
 *
 * Stub: durable cookie `pitchkit_hidden` keyed by frozen handle → media ids.
 * Backend replaces the cookie store with SQL (proposed `media.hidden_from_kit`
 * or `media.kit_hidden_at`) and the same route shapes.
 */

export const HIDDEN_COOKIE = "pitchkit_hidden";

export const KIT_VISIBILITY_PATH = "/api/kit/visibility";

export type HiddenByHandle = Record<string, string[]>;

export type KitVisibilityAction = "hide" | "restore";

export type KitVisibilityResult = {
  ok: boolean;
  hiddenIds: string[];
  error?: string;
};

export function parseHiddenCookie(value: string | undefined | null): HiddenByHandle {
  if (!value) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const next: HiddenByHandle = {};
    for (const [handle, ids] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof handle !== "string" || handle.length === 0) {
        continue;
      }
      if (!Array.isArray(ids)) {
        continue;
      }
      next[handle] = ids.filter((id): id is string => typeof id === "string" && id.length > 0);
    }
    return next;
  } catch {
    return {};
  }
}

export function serializeHiddenCookie(map: HiddenByHandle): string {
  return JSON.stringify(map);
}

export function hiddenIdsForHandle(map: HiddenByHandle, handle: string): string[] {
  return [...(map[handle] ?? [])];
}

export function hideFromKitStore(
  map: HiddenByHandle,
  handle: string,
  mediaId: string,
): HiddenByHandle {
  const current = new Set(hiddenIdsForHandle(map, handle));
  current.add(mediaId);
  return { ...map, [handle]: [...current] };
}

export function restoreToKitStore(
  map: HiddenByHandle,
  handle: string,
  mediaId: string,
): HiddenByHandle {
  const current = hiddenIdsForHandle(map, handle).filter((id) => id !== mediaId);
  const next = { ...map };
  if (current.length === 0) {
    delete next[handle];
  } else {
    next[handle] = current;
  }
  return next;
}

export function mediaVisibleOnKit<T extends { id: string }>(
  media: readonly T[],
  hiddenIds: readonly string[],
): T[] {
  const hidden = new Set(hiddenIds);
  return media.filter((row) => !hidden.has(row.id));
}

/** Confirm-hide then Undo — same record identity. */
export function applyHide<T extends { id: string }>(posts: readonly T[], mediaId: string): T[] {
  return posts.filter((post) => post.id !== mediaId);
}

export function applyRestore<T extends { id: string }>(
  posts: readonly T[],
  hiddenPost: T,
): T[] {
  if (posts.some((post) => post.id === hiddenPost.id)) {
    return [...posts];
  }
  return [...posts, hiddenPost];
}

async function postVisibility(
  action: KitVisibilityAction,
  handle: string,
  mediaId: string,
): Promise<KitVisibilityResult> {
  try {
    const response = await fetch(KIT_VISIBILITY_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, handle, mediaId }),
    });
    const payload = (await response.json()) as Partial<KitVisibilityResult>;
    if (!response.ok || payload.ok !== true || !Array.isArray(payload.hiddenIds)) {
      return {
        ok: false,
        hiddenIds: Array.isArray(payload.hiddenIds) ? payload.hiddenIds : [],
        error: payload.error ?? "Hide could not be saved.",
      };
    }
    return { ok: true, hiddenIds: payload.hiddenIds };
  } catch {
    return persistLocalStub(action, handle, mediaId);
  }
}

function persistLocalStub(
  action: KitVisibilityAction,
  handle: string,
  mediaId: string,
): KitVisibilityResult {
  if (typeof window === "undefined") {
    return { ok: false, hiddenIds: [], error: "Hide could not be saved." };
  }

  const map = parseHiddenCookie(window.localStorage.getItem(HIDDEN_COOKIE));
  const next = action === "hide" ? hideFromKitStore(map, handle, mediaId) : restoreToKitStore(map, handle, mediaId);
  window.localStorage.setItem(HIDDEN_COOKIE, serializeHiddenCookie(next));
  return { ok: true, hiddenIds: hiddenIdsForHandle(next, handle) };
}

/** Owner Insights MoreMenu → AlertDialog confirm. Backend plugs this. */
export function hideFromKit(handle: string, mediaId: string): Promise<KitVisibilityResult> {
  return postVisibility("hide", handle, mediaId);
}

/** Toast Undo. Restores the same media id. */
export function restoreToKit(handle: string, mediaId: string): Promise<KitVisibilityResult> {
  return postVisibility("restore", handle, mediaId);
}
