import { DEMO_HANDLE, seedUsers } from "./seed";

/** Pitchkit session cookie — our login, not an Instagram token. */
export const SESSION_COOKIE = "pitchkit_session";

/** Stub and future live Instagram Login share this path. */
export const AUTH_CONNECT_PATH = "/auth/instagram";

export const AUTH_SIGNOUT_PATH = "/auth/sign-out";

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

function serializeCookie(value: string, secure: boolean, maxAge: number): string {
  const parts = [
    `${SESSION_COOKIE}=${value}`,
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

/** Sets the session for seed handle `demo`. Value is the handle, not a token. */
export function sessionSetCookieHeader(secure: boolean): string {
  return serializeCookie(DEMO_HANDLE, secure, SESSION_MAX_AGE);
}

export function sessionClearCookieHeader(secure: boolean): string {
  return serializeCookie("", secure, 0);
}

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

/** `/insights` without a valid Pitchkit session goes home. */
export function insightsGate(session: Session | null): session is Session {
  return session != null;
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

export function stubConnect(request: Request): Response {
  return sessionRedirect(request, "/insights", sessionSetCookieHeader(isHttpsRequest(request)));
}

export function stubSignOut(request: Request): Response {
  return sessionRedirect(request, "/", sessionClearCookieHeader(isHttpsRequest(request)));
}
