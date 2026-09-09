import type { Media } from "./schema";
import { seedMedia } from "./seed";
import {
  HIDDEN_COOKIE,
  parseSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type Session,
} from "./session";

export { HIDDEN_COOKIE };

/** Process-global seed SoT. Cookie is a cold-start / owner-reload mirror. */
const HIDDEN_STORE_KEY = "__pitchkitHiddenFromKit";

type HiddenByUser = Map<string, Record<string, string>>;

function hiddenFromKitStore(): HiddenByUser {
  const g = globalThis as typeof globalThis & { [HIDDEN_STORE_KEY]?: HiddenByUser };
  if (!g[HIDDEN_STORE_KEY]) {
    g[HIDDEN_STORE_KEY] = new Map();
  }
  return g[HIDDEN_STORE_KEY];
}

export function readHiddenFromKitStore(userId: string): Record<string, string> | undefined {
  const hidden = hiddenFromKitStore().get(userId);
  return hidden ? { ...hidden } : undefined;
}

export function writeHiddenFromKitStore(userId: string, hidden: Record<string, string>): void {
  hiddenFromKitStore().set(userId, { ...hidden });
}

/** Test helper — isolate tests from leftover hide/restore writes. */
export function resetHiddenFromKitStore(): void {
  hiddenFromKitStore().clear();
}

export type HiddenOverlay = {
  userId: string;
  hidden: Record<string, string>;
};

export type HideRestoreResult = {
  mediaId: string;
  hiddenFromKitAt: string | null;
};

export type MediaVisibilityError =
  | "unauthenticated"
  | "invalid_body"
  | "not_found"
  | "forbidden"
  | "persist_failed";

export const MEDIA_VISIBILITY_STATUS: Record<MediaVisibilityError, number> = {
  unauthenticated: 401,
  invalid_body: 400,
  not_found: 404,
  forbidden: 403,
  persist_failed: 500,
};

export type HideRestoreFailure = {
  ok: false;
  status: number;
  error: MediaVisibilityError;
};

export type HideRestoreSuccess = {
  ok: true;
  mediaId: string;
  hiddenFromKitAt: string | null;
  overlay: HiddenOverlay;
};

export type HideRestoreOutcome = HideRestoreFailure | HideRestoreSuccess;

export type HiddenPersist = {
  write(userId: string, mediaId: string, hiddenFromKitAt: string | null): boolean;
};

/** Seed overlay persist. Hyperdrive SQL is not wired — inject a failing write to test 500. */
export const defaultHiddenPersist: HiddenPersist = {
  write() {
    return true;
  },
};

export function parseMediaId(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const mediaId = (body as { mediaId?: unknown }).mediaId;
  if (typeof mediaId !== "string" || mediaId.length === 0) {
    return null;
  }
  return mediaId;
}

export function parseHiddenOverlay(value: string | undefined | null): HiddenOverlay | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const rec = parsed as { userId?: unknown; hidden?: unknown };
    if (typeof rec.userId !== "string" || rec.userId.length === 0) {
      return null;
    }
    if (!rec.hidden || typeof rec.hidden !== "object" || Array.isArray(rec.hidden)) {
      return null;
    }
    const hidden: Record<string, string> = {};
    for (const [mediaId, at] of Object.entries(rec.hidden)) {
      if (typeof at === "string" && at.length > 0) {
        hidden[mediaId] = at;
      }
    }
    return { userId: rec.userId, hidden };
  } catch {
    return null;
  }
}

export function serializeHiddenOverlay(overlay: HiddenOverlay): string {
  return encodeURIComponent(JSON.stringify(overlay));
}

export function hiddenCookieSetOptions(secure: boolean) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure,
    maxAge: SESSION_MAX_AGE,
  };
}

export function hiddenCookieClearOptions(secure: boolean) {
  return {
    ...hiddenCookieSetOptions(secure),
    maxAge: 0,
  };
}

function serializeHiddenCookie(value: string, secure: boolean, maxAge: number): string {
  const parts = [
    `${HIDDEN_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function hiddenCookieSetHeader(overlay: HiddenOverlay, secure: boolean): string {
  return serializeHiddenCookie(serializeHiddenOverlay(overlay), secure, SESSION_MAX_AGE);
}

export function cookieValue(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) {
    return undefined;
  }

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    if (trimmed.slice(0, eq) === name) {
      return trimmed.slice(eq + 1);
    }
  }
  return undefined;
}

export function overlayForUser(
  overlay: HiddenOverlay | null,
  userId: string,
): HiddenOverlay {
  if (overlay && overlay.userId === userId) {
    return { userId, hidden: { ...overlay.hidden } };
  }
  return { userId, hidden: {} };
}

/**
 * Seed overlay for a user. Map is SoT in this isolate (wins conflicts).
 * Cookie fills only when this isolate has no Map row yet (cold start).
 */
export function mergeHiddenOverlay(
  userId: string,
  cookie: HiddenOverlay | null = null,
): HiddenOverlay {
  const stored = readHiddenFromKitStore(userId);
  if (stored !== undefined) {
    // Map is SoT in this isolate. Cookie-only keys are ignored so restore wins
    // over a stale overlay. Cookie fills when this user has no Map row (cold start).
    return { userId, hidden: { ...stored } };
  }
  return overlayForUser(cookie, userId);
}

function overlayBaseForWrite(
  userId: string,
  cookie: HiddenOverlay | null,
): Record<string, string> {
  const stored = readHiddenFromKitStore(userId);
  if (stored !== undefined) {
    return { ...stored };
  }
  return overlayForUser(cookie, userId).hidden;
}

/** Stamp overlay timestamps onto copies. Caller skips this when Hyperdrive owns the column. */
export function applyHiddenOverlay(
  media: Media[],
  overlay: HiddenOverlay | null,
  userId: string,
): Media[] {
  const scoped = overlayForUser(overlay, userId);
  return media.map((row) => ({
    ...row,
    hidden_from_kit_at: scoped.hidden[row.id] ?? row.hidden_from_kit_at ?? null,
  }));
}

export function findMediaRow(
  mediaId: string,
  catalog: readonly Media[] = seedMedia,
): Media | undefined {
  return catalog.find((row) => row.id === mediaId);
}

function failure(error: MediaVisibilityError): HideRestoreFailure {
  return { ok: false, status: MEDIA_VISIBILITY_STATUS[error], error };
}

function authorize(
  session: Session | null,
  mediaId: unknown,
  catalog: readonly Media[],
): HideRestoreFailure | { ok: true; session: Session; mediaId: string; row: Media } {
  if (!session) {
    return failure("unauthenticated");
  }
  const id = typeof mediaId === "string" && mediaId.length > 0 ? mediaId : null;
  if (!id) {
    return failure("invalid_body");
  }
  const row = findMediaRow(id, catalog);
  if (!row) {
    return failure("not_found");
  }
  if (row.user_id !== session.userId) {
    return failure("forbidden");
  }
  return { ok: true, session, mediaId: id, row };
}

export function hideFromKit(input: {
  session: Session | null;
  mediaId: unknown;
  overlay: HiddenOverlay | null;
  now?: Date;
  catalog?: readonly Media[];
  persist?: HiddenPersist;
}): HideRestoreOutcome {
  const authorized = authorize(input.session, input.mediaId, input.catalog ?? seedMedia);
  if (!authorized.ok) {
    return authorized;
  }

  const persist = input.persist ?? defaultHiddenPersist;
  const hidden = overlayBaseForWrite(authorized.session.userId, input.overlay);
  const hiddenFromKitAt =
    hidden[authorized.mediaId] ?? (input.now ?? new Date()).toISOString();

  if (!persist.write(authorized.session.userId, authorized.mediaId, hiddenFromKitAt)) {
    return failure("persist_failed");
  }

  hidden[authorized.mediaId] = hiddenFromKitAt;
  writeHiddenFromKitStore(authorized.session.userId, hidden);

  return {
    ok: true,
    mediaId: authorized.mediaId,
    hiddenFromKitAt,
    overlay: { userId: authorized.session.userId, hidden },
  };
}

export function restoreToKit(input: {
  session: Session | null;
  mediaId: unknown;
  overlay: HiddenOverlay | null;
  catalog?: readonly Media[];
  persist?: HiddenPersist;
}): HideRestoreOutcome {
  const authorized = authorize(input.session, input.mediaId, input.catalog ?? seedMedia);
  if (!authorized.ok) {
    return authorized;
  }

  const persist = input.persist ?? defaultHiddenPersist;
  if (!persist.write(authorized.session.userId, authorized.mediaId, null)) {
    return failure("persist_failed");
  }

  const hidden = overlayBaseForWrite(authorized.session.userId, input.overlay);
  delete hidden[authorized.mediaId];
  writeHiddenFromKitStore(authorized.session.userId, hidden);

  return {
    ok: true,
    mediaId: authorized.mediaId,
    hiddenFromKitAt: null,
    overlay: { userId: authorized.session.userId, hidden },
  };
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function mediaVisibilityResponse(
  request: Request,
  action: "hide" | "restore",
): Promise<Response> {
  const session = parseSessionValue(cookieValue(request, SESSION_COOKIE));
  const overlay = parseHiddenOverlay(cookieValue(request, HIDDEN_COOKIE));
  const mediaId = parseMediaId(await readJsonBody(request));
  const outcome =
    action === "hide"
      ? hideFromKit({ session, mediaId, overlay })
      : restoreToKit({ session, mediaId, overlay });

  if (!outcome.ok) {
    return Response.json(
      { error: outcome.error },
      { status: outcome.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  });
  headers.append(
    "Set-Cookie",
    hiddenCookieSetHeader(outcome.overlay, new URL(request.url).protocol === "https:"),
  );

  const body: HideRestoreResult = {
    mediaId: outcome.mediaId,
    hiddenFromKitAt: outcome.hiddenFromKitAt,
  };
  return new Response(JSON.stringify(body), { status: 200, headers });
}
