/**
 * Live Instagram OAuth finish: persist the in-memory snapshot, then set
 * `pitchkit_session` to that handle. Do not re-read the handle from storage —
 * a KV/SQL miss after a true write recreates the Connect loop.
 */

import type { PitchkitSecrets } from "./env";
import {
  handleAfterReconnect,
  pitchkitHandleFromUsername,
  uniqueHandle,
} from "./handle";
import {
  createGraphClient,
  fetchMe,
  igUserIdFromMe,
  isPersonalAccount,
  isProfessionalAccount,
} from "./graph";
import {
  listTakenHandles,
  readGraphSnapshotByIgUserId,
  writeGraphSnapshot,
} from "./graph-store";
import {
  exchangeCodeForTokens,
  OAUTH_STATE_COOKIE,
  resolveRedirectUri,
} from "./instagram-oauth";
import { pollInsights, snapshotFromMe } from "./poll";
import { encryptTokenIfPossible } from "./token-crypto";
import {
  isHttpsRequest,
  readRequestCookie,
  serializeSessionCookie,
  sessionClearCookieHeader,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "./session";

export const OAUTH_LANDING_ERRORS = [
  "oauth_state",
  "oauth_exchange",
  "oauth_me",
  "personal",
  "oauth_poll",
  "persist",
] as const;

export type OauthLandingError = (typeof OAUTH_LANDING_ERRORS)[number];

export function oauthLandingPath(error: OauthLandingError): string {
  return `/?error=${error}`;
}

export type PersistCookieResult =
  | { ok: true; handle: string }
  | { ok: false; error: "persist" };

/**
 * After `writeGraphSnapshot` returns true, trust the in-memory handle.
 * A post-write storage re-read false-negative bounces back to Connect.
 */
export function cookieHandleAfterPersist(
  persisted: boolean,
  handle: string,
): PersistCookieResult {
  if (!persisted || handle.length === 0) {
    return { ok: false, error: "persist" };
  }
  return { ok: true, handle };
}

export function sessionCookieAfterPersist(input: {
  persisted: boolean;
  handle: string;
  secure: boolean;
}): { ok: true; cookie: string; handle: string } | { ok: false; error: "persist" } {
  const after = cookieHandleAfterPersist(input.persisted, input.handle);
  if (!after.ok) {
    return after;
  }
  return {
    ok: true,
    handle: after.handle,
    cookie: serializeSessionCookie(SESSION_COOKIE, after.handle, input.secure, SESSION_MAX_AGE),
  };
}

function cookieHeader(name: string, value: string, secure: boolean, maxAge: number): string {
  return serializeSessionCookie(name, value, secure, maxAge);
}

function redirectWithCookies(request: Request, path: string, cookies: string[]): Response {
  const headers = new Headers({
    Location: new URL(path, request.url).toString(),
    "Cache-Control": "no-store",
  });
  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(null, { status: 303, headers });
}

/** Failed live OAuth finish: drop oauth state and any leftover seed `demo` session. */
export function oauthFinishAbortCookies(request: Request): string[] {
  const secure = isHttpsRequest(request);
  return [
    cookieHeader(OAUTH_STATE_COOKIE, "", secure, 0),
    sessionClearCookieHeader(secure),
  ];
}

export async function finishLiveOAuth(input: {
  request: Request;
  code: string;
  state: string | null;
  secrets: PitchkitSecrets;
}): Promise<Response> {
  const { request, code, state, secrets } = input;
  const secure = isHttpsRequest(request);
  const abortCookies = oauthFinishAbortCookies(request);
  const clearState = cookieHeader(OAUTH_STATE_COOKIE, "", secure, 0);

  if (state) {
    const expected = readRequestCookie(request, OAUTH_STATE_COOKIE);
    if (!expected || expected !== state) {
      return redirectWithCookies(request, oauthLandingPath("oauth_state"), abortCookies);
    }
  }

  const redirectUri = resolveRedirectUri(request, secrets);
  const exchanged = await exchangeCodeForTokens({
    code,
    secrets,
    redirectUri,
  });
  if (!exchanged.ok) {
    return redirectWithCookies(request, oauthLandingPath("oauth_exchange"), abortCookies);
  }

  const client = createGraphClient({
    token: exchanged.tokens.accessToken,
    version: secrets.GRAPH_API_VERSION,
  });
  const me = await fetchMe(client);
  if (!me.ok) {
    return redirectWithCookies(request, oauthLandingPath("oauth_me"), abortCookies);
  }
  if (
    isPersonalAccount(me.data.account_type) ||
    (me.data.account_type != null && !isProfessionalAccount(me.data.account_type))
  ) {
    return redirectWithCookies(request, oauthLandingPath("personal"), abortCookies);
  }

  const igUserId = igUserIdFromMe(me.data) ?? exchanged.tokens.userId;
  if (!igUserId) {
    return redirectWithCookies(request, oauthLandingPath("oauth_me"), abortCookies);
  }

  const existing = await readGraphSnapshotByIgUserId(igUserId, "route");
  const url = new URL(request.url);
  const updateHandle = url.searchParams.get("update_handle") === "1";
  const igUsername = me.data.username ?? igUserId;
  const taken = await listTakenHandles("route");
  const handle = existing
    ? handleAfterReconnect({
        existingHandle: existing.user.handle,
        igUsername,
        updateHandle,
        taken,
      })
    : uniqueHandle(pitchkitHandleFromUsername(igUsername), taken);

  const polled = await pollInsights({
    token: exchanged.tokens.accessToken,
    secrets,
    existing,
    handle,
    userId: existing?.user.id,
  });

  let baseSnapshot;
  if (polled.ok) {
    baseSnapshot = polled.snapshot;
  } else if (polled.reason === "personal") {
    return redirectWithCookies(request, oauthLandingPath("personal"), abortCookies);
  } else {
    const fallback = snapshotFromMe({
      me: me.data,
      existing,
      handle,
      userId: existing?.user.id,
    });
    if (!fallback) {
      return redirectWithCookies(request, oauthLandingPath("oauth_poll"), abortCookies);
    }
    console.warn("pitchkit.oauth_poll", polled.reason);
    baseSnapshot = fallback;
  }

  const tokenEncrypted = await encryptTokenIfPossible(exchanged.tokens.accessToken, secrets.TOKEN_KEY);
  const snapshot = {
    ...baseSnapshot,
    user: {
      ...baseSnapshot.user,
      handle,
      token_encrypted: tokenEncrypted,
      token_expires_at: exchanged.tokens.expiresAt,
    },
  };
  const persisted = await writeGraphSnapshot(snapshot, "route");
  const after = sessionCookieAfterPersist({
    persisted,
    handle: snapshot.user.handle,
    secure,
  });
  if (!after.ok) {
    return redirectWithCookies(request, oauthLandingPath("persist"), abortCookies);
  }
  return redirectWithCookies(request, "/insights", [after.cookie, clearState]);
}
