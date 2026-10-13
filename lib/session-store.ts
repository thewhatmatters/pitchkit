/**
 * Server-side Pitchkit sessions. The `pitchkit_session` cookie holds a random
 * opaque token (32 bytes, base64url). KV `HIDDEN_KIT` stores
 * `session:<sha256(token)>` → `{ handle, userId }` with a 30-day TTL, so a
 * leaked KV listing cannot be replayed as a cookie. Legacy cookies that held
 * an Instagram username fail the token shape check and never resolve.
 */

import { readHiddenKitBinding, type HiddenKitAccess } from "./hidden-kit-kv";

export const SESSION_TOKEN_BYTES = 32;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type SessionRecord = {
  handle: string;
  userId: string;
  createdAt: string;
};

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function newSessionToken(): string {
  const bytes = new Uint8Array(SESSION_TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

export function isSessionTokenShape(value: string | null | undefined): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value);
}

export async function sessionKey(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return `session:${hex}`;
}

function parseRecord(raw: string | null): SessionRecord | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SessionRecord>;
    if (typeof parsed.handle !== "string" || typeof parsed.userId !== "string") {
      return null;
    }
    return {
      handle: parsed.handle,
      userId: parsed.userId,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : "",
    };
  } catch {
    return null;
  }
}

/** New session in KV. Null when the binding is missing or the write fails (fail closed). */
export async function createServerSession(
  input: { handle: string; userId: string },
  ttlSeconds: number,
  access: HiddenKitAccess = "route",
): Promise<string | null> {
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return null;
  }
  const token = newSessionToken();
  const record: SessionRecord = {
    handle: input.handle,
    userId: input.userId,
    createdAt: new Date().toISOString(),
  };
  try {
    await ns.put(await sessionKey(token), JSON.stringify(record), { expirationTtl: ttlSeconds });
    return token;
  } catch {
    return null;
  }
}

export async function readServerSession(
  token: string | null | undefined,
  access: HiddenKitAccess = "page",
): Promise<SessionRecord | null> {
  if (!isSessionTokenShape(token)) {
    return null;
  }
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return null;
  }
  try {
    return parseRecord(await ns.get(await sessionKey(token)));
  } catch {
    return null;
  }
}

export async function deleteServerSession(
  token: string | null | undefined,
  access: HiddenKitAccess = "route",
): Promise<void> {
  if (!isSessionTokenShape(token)) {
    return;
  }
  const ns = await readHiddenKitBinding(access);
  if (!ns?.delete) {
    return;
  }
  try {
    await ns.delete(await sessionKey(token));
  } catch {
    // Best effort; the TTL still expires it.
  }
}
