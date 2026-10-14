import { hasLiveAuthSecrets, readSecrets } from "./env";
import { eraseCreatorData } from "./creator-erase";
import { readGraphSnapshotByHandle } from "./graph-store";
import type { HiddenKitAccess } from "./hidden-kit-kv";
import { DEMO_HANDLE, DEMO_USER_ID, seedUsers } from "./seed";
import { createServerSession, deleteServerSession, readServerSession } from "./session-store";

/**
 * Pitchkit session cookie — our login, not an Instagram token. The value is a
 * random opaque token; the handle lives server-side in KV (`session-store.ts`).
 */
export const SESSION_COOKIE = "pitchkit_session";

/** httpOnly hide overlay — owner reload mirror. SQL writes `media.hidden_from_kit_at` when Hyperdrive is bound. */
export const HIDDEN_COOKIE = "pitchkit_hidden";

/**
 * Stub and future live Instagram Login share this path. FE posts here; cookie write stays here.
 * WHA-313: live reconnect may offer optional kit URL update when IG username ≠ users.handle.
 * Stub Connect stays seed `demo` — no rename UI.
 */
export const AUTH_CONNECT_PATH = "/auth/instagram";

/** FE posts here; cookie clear stays here. */
export const AUTH_SIGNOUT_PATH = "/auth/sign-out";

/** FE posts here; persist disconnect + cookie clear stay here. */
export const AUTH_DISCONNECT_PATH = "/auth/disconnect";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type Session = {
  handle: string;
  userId: string;
};

export function isHttpsRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

export function sessionCookieSetOptions(secure: boolean) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure,
    maxAge: SESSION_MAX_AGE,
  };
}

export function sessionCookieClearOptions(secure: boolean) {
  return {
    ...sessionCookieSetOptions(secure),
    maxAge: 0,
  };
}

function serializeCookie(name: string, value: string, secure: boolean, maxAge: number): string {
  const parts = [
    `${name}=${value}`,
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

export function serializeSessionCookie(
  name: string,
  value: string,
  secure: boolean,
  maxAge: number,
): string {
  return serializeCookie(name, value, secure, maxAge);
}

/**
 * Creates a server-side session for `handle` and returns its `Set-Cookie`.
 * Null when KV is unavailable — callers must fail closed (no signed-in cookie).
 */
export async function createSessionCookie(
  input: { handle: string; userId: string },
  secure: boolean,
  access: HiddenKitAccess = "route",
): Promise<string | null> {
  const token = await createServerSession(input, SESSION_MAX_AGE, access);
  if (!token) {
    return null;
  }
  return serializeCookie(SESSION_COOKIE, token, secure, SESSION_MAX_AGE);
}

export function sessionClearCookieHeader(secure: boolean): string {
  return serializeCookie(SESSION_COOKIE, "", secure, 0);
}

export function hiddenCookieClearHeader(secure: boolean): string {
  return serializeCookie(HIDDEN_COOKIE, "", secure, 0);
}

/** Read one cookie from a Request `Cookie` header. */
export function readRequestCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) {
    return null;
  }
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return rest.join("=");
    }
  }
  return null;
}

/** Seed row for a handle (stub path only). Not a cookie parser. */
export function parseSessionValue(value: string | undefined | null): Session | null {
  if (!value) {
    return null;
  }

  const user = seedUsers.find((row) => row.handle === value);
  if (!user || user.disconnected_at) {
    return null;
  }

  return { handle: user.handle, userId: user.id };
}

/**
 * Cookie token → KV session record → owner still connected.
 * Username-only (legacy) or forged cookies have no KV record and resolve null.
 */
export async function resolveSession(
  value: string | undefined | null,
  access: HiddenKitAccess = "page",
): Promise<Session | null> {
  const record = await readServerSession(value, access);
  if (!record) {
    return null;
  }
  const seed = parseSessionValue(record.handle);
  if (seed) {
    if (seed.userId !== record.userId) {
      return null;
    }
    const secrets = await readSecrets(access);
    // Live Instagram Login is configured — leftover seed `demo` is not signed in.
    // Public `/k/demo` stays; this gate is the owner cookie only.
    if (!hasLiveAuthSecrets(secrets)) {
      return seed;
    }
    return null;
  }
  const snapshot = await readGraphSnapshotByHandle(record.handle, access);
  if (!snapshot || snapshot.user.disconnected_at || snapshot.user.id !== record.userId) {
    return null;
  }
  return { handle: snapshot.user.handle, userId: snapshot.user.id };
}

/** `/insights` without a valid Pitchkit session goes home. */
export function insightsGate(session: Session | null): session is Session {
  return session != null;
}

/** True when the Pitchkit session cookie owns this handle. */
export function sessionOwnsHandle(session: Session | null, handle: string): boolean {
  return session != null && session.handle === handle;
}

/** 303 so a POST connect/sign-out follows as GET. */
export function sessionRedirect(request: Request, path: string, setCookie: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(path, request.url).toString(),
      "Set-Cookie": setCookie,
      "Cache-Control": "no-store",
    },
  });
}

/** Seed `demo` only. WHA-313 optional "Update kit URL to @{new}" waits on live OAuth. */
export async function stubConnect(request: Request): Promise<Response> {
  const cookie = await createSessionCookie(
    { handle: DEMO_HANDLE, userId: DEMO_USER_ID },
    isHttpsRequest(request),
  );
  if (!cookie) {
    return sessionRedirect(request, "/?error=persist", sessionClearCookieHeader(isHttpsRequest(request)));
  }
  return sessionRedirect(request, "/insights", cookie);
}

function signOutResponse(request: Request): Response {
  const secure = isHttpsRequest(request);
  const headers = new Headers({
    Location: new URL("/", request.url).toString(),
    "Cache-Control": "no-store",
  });
  headers.append("Set-Cookie", sessionClearCookieHeader(secure));
  headers.append("Set-Cookie", hiddenCookieClearHeader(secure));
  return new Response(null, { status: 303, headers });
}

/** Sign out = delete the server-side session + clear cookies (kit stays public). */
export async function stubSignOut(request: Request): Promise<Response> {
  await deleteServerSession(readRequestCookie(request, SESSION_COOKIE), "route");
  return signOutResponse(request);
}

/**
 * Disconnect = real data delete for the signed-in owner (`lib/creator-erase.ts`):
 * SQL `users` + `media`, every KV key for the creator (`graph:*`, `hidden:`,
 * all indexed `session:` records), then both cookies clear. The kit URL 404s.
 * Idempotent; reconnecting starts from an empty kit.
 */
export async function disconnectOwner(request: Request): Promise<Response> {
  const value = readRequestCookie(request, SESSION_COOKIE);
  const session = await resolveSession(value, "route");
  if (session) {
    await eraseCreatorData({ userId: session.userId, handle: session.handle }, "route");
  }
  await deleteServerSession(value, "route");
  return signOutResponse(request);
}
