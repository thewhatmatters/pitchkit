import { SESSION_COOKIE, SESSION_MAX_AGE } from "./session";
import { createServerSession, isSessionTokenShape } from "./session-store";

/** Opaque token from a `pitchkit_session=<token>; ...` Set-Cookie line. */
export function sessionTokenFromSetCookie(setCookie: string | null | undefined): string | null {
  if (!setCookie) {
    return null;
  }
  const match = new RegExp(`${SESSION_COOKIE}=([^;,]*)`).exec(setCookie);
  const token = match?.[1] ?? "";
  return isSessionTokenShape(token) ? token : null;
}

/** Mint a real server-side session in the injected KV; returns the cookie token. */
export async function mintSessionToken(handle: string, userId: string): Promise<string> {
  const token = await createServerSession({ handle, userId }, SESSION_MAX_AGE, "route");
  if (!token) {
    throw new Error("mintSessionToken: no KV namespace injected");
  }
  return token;
}
