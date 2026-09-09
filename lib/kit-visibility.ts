/**
 * Hide-from-kit / restore seam (WHA-311 FE, WHA-312 contract).
 *
 * Product code calls `hideFromKit(mediaId)` / `restoreToKit(mediaId)` only.
 * Do not persist hide state in React memory without going through this module.
 * Owner Insights partitions `hidden_from_kit_at` (`partitionOwnerProofPosts`) so
 * **"N shown"** excludes hidden rows; hidden rows stay for Restore.
 *
 * Routes:
 *   hideFromKit(mediaId)    → POST /api/media/hide    body { mediaId }
 *   restoreToKit(mediaId)   → POST /api/media/restore body { mediaId }
 * Success 200: { mediaId, hiddenFromKitAt }  // ISO string or null
 * Failures: 401 unauthenticated, 400 invalid_body, 404 not_found,
 *           403 forbidden, 500 persist_failed
 * Idempotent. Schema field: media.hidden_from_kit_at
 *
 * Product SoT is the POST routes — not window.localStorage.
 * Seed SoT is KV `HIDDEN_KIT` until Neon; owner cookie is a reload mirror.
 * FE just calls the routes. API failure returns a stamped error only.
 */

export const HIDDEN_COOKIE = "pitchkit_hidden";

export const MEDIA_HIDE_PATH = "/api/media/hide";
export const MEDIA_RESTORE_PATH = "/api/media/restore";

export type MediaVisibilityAction = "hide" | "restore";

export type MediaVisibilityError =
  | "unauthenticated"
  | "invalid_body"
  | "not_found"
  | "forbidden"
  | "persist_failed";

/** mediaId → ISO timestamp. Absent key = visible on the public kit. */
export type HiddenOverlay = Record<string, string>;

export type MediaVisibilitySuccess = {
  mediaId: string;
  hiddenFromKitAt: string | null;
};

export type MediaVisibilityResult =
  | ({ ok: true } & MediaVisibilitySuccess)
  | { ok: false; error: string; code: MediaVisibilityError };

const ERROR_STATUS: Record<MediaVisibilityError, number> = {
  unauthenticated: 401,
  invalid_body: 400,
  not_found: 404,
  forbidden: 403,
  persist_failed: 500,
};

const STATUS_ERROR: Record<number, MediaVisibilityError> = {
  401: "unauthenticated",
  400: "invalid_body",
  404: "not_found",
  403: "forbidden",
  500: "persist_failed",
};

export function isMediaVisibilityError(value: unknown): value is MediaVisibilityError {
  return (
    value === "unauthenticated" ||
    value === "invalid_body" ||
    value === "not_found" ||
    value === "forbidden" ||
    value === "persist_failed"
  );
}

export function mediaVisibilityStatus(code: MediaVisibilityError): number {
  return ERROR_STATUS[code];
}

/** Honest copy for the failure codes. */
export function mediaVisibilityErrorMessage(
  code: MediaVisibilityError,
  action: MediaVisibilityAction = "hide",
): string {
  switch (code) {
    case "unauthenticated":
      return "Sign in to change kit posts.";
    case "invalid_body":
      return action === "restore" ? "That restore request was invalid." : "That hide request was invalid.";
    case "not_found":
      return "That post was not found.";
    case "forbidden":
      return "You cannot change this post.";
    case "persist_failed":
      return action === "restore" ? "Restore could not be saved." : "Hide could not be saved.";
  }
}

export function parseMediaIdBody(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }
  const mediaId = (body as { mediaId?: unknown }).mediaId;
  if (typeof mediaId !== "string" || mediaId.length === 0) {
    return null;
  }
  return mediaId;
}

export function parseHiddenCookie(value: string | undefined | null): HiddenOverlay {
  if (!value) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const next: HiddenOverlay = {};
    for (const [mediaId, hiddenAt] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof mediaId !== "string" || mediaId.length === 0) {
        continue;
      }
      if (typeof hiddenAt !== "string" || hiddenAt.length === 0) {
        continue;
      }
      next[mediaId] = hiddenAt;
    }
    return next;
  } catch {
    return {};
  }
}

export function serializeHiddenCookie(overlay: HiddenOverlay): string {
  return JSON.stringify(overlay);
}

export function hiddenIdsFromOverlay(overlay: HiddenOverlay): string[] {
  return Object.keys(overlay);
}

export function hideInOverlay(
  overlay: HiddenOverlay,
  mediaId: string,
  hiddenFromKitAt: string,
): HiddenOverlay {
  if (overlay[mediaId]) {
    return overlay;
  }
  return { ...overlay, [mediaId]: hiddenFromKitAt };
}

export function restoreInOverlay(overlay: HiddenOverlay, mediaId: string): HiddenOverlay {
  if (!(mediaId in overlay)) {
    return overlay;
  }
  const next = { ...overlay };
  delete next[mediaId];
  return next;
}

export function applyOverlayToMedia<T extends { id: string; hidden_from_kit_at: string | null }>(
  media: readonly T[],
  overlay: HiddenOverlay,
): T[] {
  return media.map((row) => ({
    ...row,
    hidden_from_kit_at: overlay[row.id] ?? row.hidden_from_kit_at,
  }));
}

/** Public kit: drop hidden rows before selectSixPosts. */
export function mediaVisibleOnKit<T extends { id: string; hidden_from_kit_at?: string | null }>(
  media: readonly T[],
  overlay: HiddenOverlay = {},
): T[] {
  return media.filter((row) => row.hidden_from_kit_at == null && overlay[row.id] == null);
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

export function isHiddenFromKit<T extends { hidden_from_kit_at?: string | null }>(row: T): boolean {
  return row.hidden_from_kit_at != null;
}

/** Owner Insights: keep hidden rows for Restore; rank + "N shown" use `shown` only. */
export function partitionOwnerProofPosts<T extends { hidden_from_kit_at?: string | null }>(
  posts: readonly T[],
): { shown: T[]; hidden: T[] } {
  const shown: T[] = [];
  const hidden: T[] = [];
  for (const post of posts) {
    if (isHiddenFromKit(post)) {
      hidden.push(post);
    } else {
      shown.push(post);
    }
  }
  return { shown, hidden };
}

export function stampHiddenFromKit<T extends { id: string; hidden_from_kit_at: string | null }>(
  posts: readonly T[],
  mediaId: string,
  hiddenFromKitAt: string,
): T[] {
  return posts.map((post) =>
    post.id === mediaId && post.hidden_from_kit_at == null
      ? { ...post, hidden_from_kit_at: hiddenFromKitAt }
      : post,
  );
}

export function clearHiddenFromKit<T extends { id: string; hidden_from_kit_at: string | null }>(
  posts: readonly T[],
  mediaId: string,
): T[] {
  return posts.map((post) => (post.id === mediaId ? { ...post, hidden_from_kit_at: null } : post));
}

function parseSuccess(payload: unknown, mediaId: string): MediaVisibilitySuccess | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const body = payload as { mediaId?: unknown; hiddenFromKitAt?: unknown };
  if (body.mediaId !== mediaId) {
    return null;
  }
  if (body.hiddenFromKitAt !== null && typeof body.hiddenFromKitAt !== "string") {
    return null;
  }
  return { mediaId, hiddenFromKitAt: body.hiddenFromKitAt };
}

function errorFromResponse(status: number, payload: unknown): MediaVisibilityError {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const code = (payload as { error?: unknown }).error;
    if (isMediaVisibilityError(code)) {
      return code;
    }
  }
  return STATUS_ERROR[status] ?? "persist_failed";
}

async function postMediaVisibility(
  action: MediaVisibilityAction,
  mediaId: string,
): Promise<MediaVisibilityResult> {
  const path = action === "hide" ? MEDIA_HIDE_PATH : MEDIA_RESTORE_PATH;
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mediaId }),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (response.ok) {
      const success = parseSuccess(payload, mediaId);
      if (!success) {
        return {
          ok: false,
          code: "persist_failed",
          error: mediaVisibilityErrorMessage("persist_failed", action),
        };
      }
      return { ok: true, ...success };
    }
    const code = errorFromResponse(response.status, payload);
    return { ok: false, code, error: mediaVisibilityErrorMessage(code, action) };
  } catch {
    return {
      ok: false,
      code: "persist_failed",
      error: mediaVisibilityErrorMessage("persist_failed", action),
    };
  }
}

/** Owner Insights MoreMenu → AlertDialog confirm. */
export function hideFromKit(mediaId: string): Promise<MediaVisibilityResult> {
  return postMediaVisibility("hide", mediaId);
}

/** Toast Undo. Restores the same media id. */
export function restoreToKit(mediaId: string): Promise<MediaVisibilityResult> {
  return postMediaVisibility("restore", mediaId);
}
