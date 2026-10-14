/**
 * Meta data deletion callback (`POST /api/meta/data-deletion`).
 * https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 *
 * Meta posts `signed_request=<b64url(sig)>.<b64url(payload)>`. `sig` is
 * HMAC-SHA256 of the raw payload segment keyed by the app secret. We read the
 * secret from env `META_APP_SECRET` only; it is never logged, echoed or hardcoded.
 * Unset secret → 503 (callback switched off).
 *
 * Confirmation records: KV `deletion:<code>` → `{ status, requested_at }`.
 * No user id, handle or Instagram id is stored with the code.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eraseCreatorData } from "./creator-erase";
import { readHiddenKitBinding, type HiddenKitAccess } from "./hidden-kit-kv";

export const META_APP_SECRET_ENV = "META_APP_SECRET";
export const DELETION_STATUS_PATH = "/data-deletion/status";
export const DELETION_KEY_PREFIX = "deletion:";
/** Keep the confirmation lookup for a year; it holds no personal data. */
export const DELETION_RECORD_TTL = 60 * 60 * 24 * 365;

export type DeletionStatus = "deleted" | "no_data";
export type DeletionRecord = { status: DeletionStatus; requested_at: string };

let injectedSecret: string | null | undefined;

/** Tests: a value, `null` for unset, `undefined` to restore env lookup. */
export function setMetaAppSecretForTests(value: string | null | undefined): void {
  injectedSecret = value;
}

function nonEmpty(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export async function readMetaAppSecret(access: HiddenKitAccess = "route"): Promise<string | null> {
  if (injectedSecret !== undefined) {
    return injectedSecret;
  }
  if (process.env.NODE_TEST_CONTEXT) {
    return null;
  }
  try {
    const ctx = access === "page" ? await getCloudflareContext({ async: true }) : getCloudflareContext();
    const fromWorker = nonEmpty((ctx.env as unknown as Record<string, unknown> | undefined)?.[META_APP_SECRET_ENV]);
    if (fromWorker) {
      return fromWorker;
    }
  } catch {
    // Local Next without a Worker context — fall through to process env.
  }
  return nonEmpty(process.env[META_APP_SECRET_ENV]);
}

function base64urlToBytes(input: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(input)) {
    return null;
  }
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

export type SignedRequestPayload = {
  algorithm: string;
  user_id: string;
  issued_at?: number;
};

/** Verified payload, or null for any malformed / forged / wrong-algorithm request. */
export async function parseSignedRequest(
  signedRequest: string | null | undefined,
  secret: string,
): Promise<SignedRequestPayload | null> {
  if (typeof signedRequest !== "string") {
    return null;
  }
  const parts = signedRequest.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }
  const [sigPart, payloadPart] = parts;
  const sig = base64urlToBytes(sigPart);
  const payloadBytes = base64urlToBytes(payloadPart);
  if (!sig || !payloadBytes) {
    return null;
  }
  const expected = await hmacSha256(secret, payloadPart);
  if (!timingSafeEqual(sig, expected)) {
    return null;
  }
  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as Partial<SignedRequestPayload>;
    if (typeof payload.algorithm !== "string" || payload.algorithm.toUpperCase() !== "HMAC-SHA256") {
      return null;
    }
    const userId = typeof payload.user_id === "number" ? String(payload.user_id) : payload.user_id;
    if (typeof userId !== "string" || userId.length === 0) {
      return null;
    }
    return { algorithm: payload.algorithm, user_id: userId, issued_at: payload.issued_at };
  } catch {
    return null;
  }
}

export function newConfirmationCode(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isConfirmationCode(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[0-9a-f]{24}$/.test(value);
}

export async function readDeletionRecord(
  code: string | null | undefined,
  access: HiddenKitAccess = "page",
): Promise<DeletionRecord | null> {
  if (!isConfirmationCode(code)) {
    return null;
  }
  const ns = await readHiddenKitBinding(access);
  if (!ns) {
    return null;
  }
  try {
    const raw = await ns.get(`${DELETION_KEY_PREFIX}${code}`);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<DeletionRecord>;
    if ((parsed.status === "deleted" || parsed.status === "no_data") && typeof parsed.requested_at === "string") {
      return { status: parsed.status, requested_at: parsed.requested_at };
    }
    return null;
  } catch {
    return null;
  }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function readSignedRequestField(request: Request): Promise<string | null> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const body = (await request.json()) as { signed_request?: unknown };
      return typeof body.signed_request === "string" ? body.signed_request : null;
    }
    const text = await request.text();
    return new URLSearchParams(text).get("signed_request");
  } catch {
    return null;
  }
}

export async function handleMetaDataDeletion(
  request: Request,
  now: Date = new Date(),
): Promise<Response> {
  const secret = await readMetaAppSecret("route");
  if (!secret) {
    return json(503, { error: "data_deletion_callback_disabled" });
  }
  const signed = await readSignedRequestField(request);
  const payload = await parseSignedRequest(signed, secret);
  if (!payload) {
    return json(400, { error: "invalid_signed_request" });
  }
  const erased = await eraseCreatorData({ igUserId: payload.user_id }, "route");
  if (!erased.ok) {
    return json(500, { error: "delete_failed" });
  }
  const ns = await readHiddenKitBinding("route");
  if (!ns) {
    return json(500, { error: "delete_failed" });
  }
  const code = newConfirmationCode();
  const record: DeletionRecord = {
    status: erased.found ? "deleted" : "no_data",
    requested_at: now.toISOString(),
  };
  try {
    await ns.put(`${DELETION_KEY_PREFIX}${code}`, JSON.stringify(record), {
      expirationTtl: DELETION_RECORD_TTL,
    });
  } catch {
    return json(500, { error: "delete_failed" });
  }
  const url = new URL(`${DELETION_STATUS_PATH}?code=${code}`, request.url).toString();
  return json(200, { url, confirmation_code: code });
}
