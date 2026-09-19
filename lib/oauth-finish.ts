/**
 * Live Instagram OAuth finish: persist the in-memory snapshot, then set
 * `pitchkit_session` to that handle on a single `Set-Cookie`. Do not re-read
 * the handle from storage — a KV/SQL miss after a true write recreates the
 * Connect loop. Do not pair oauth-state clear on the success 303: OpenNext
 * on Workers can fold multiple Set-Cookie and leave leftover seed `demo`.
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

/**
 * OpenNext on Workers may fold multiple `Set-Cookie` (Record last-wins, or
 * comma-join via `Headers.get`). A paired oauth-state clear on the success
 * 303 can drop `pitchkit_session` and leave leftover seed `demo`.
 * Capture 2026-09-19: callback Location `/insights`, follow-up GET `/insights`
 * still sent `Cookie: pitchkit_session=demo` (Referer l.instagram.com).
 */
export function oauthSuccessSetCookies(sessionCookie: string): string[] {
  return [sessionCookie];
}

/** Last `Set-Cookie` is what a last-wins fold keeps. */
export function lastWinsSetCookie(cookies: string[]): string | undefined {
  return cookies.length === 0 ? undefined : cookies[cookies.length - 1];
}

function redirectWithCookies(request: Request, path: string, cookies: string[]): Response {
  const location = new URL(path, request.url).toString();
  // One cookie → object-form header (same as stub `sessionRedirect`).
  // Two+ still append, but the session-critical cookie must be last.
  if (cookies.length === 1) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: location,
        "Set-Cookie": cookies[0],
        "Cache-Control": "no-store",
      },
    });
  }
  const headers = new Headers({
    Location: location,
    "Cache-Control": "no-store",
  });
  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(null, { status: 303, headers });
}

/** Failed live OAuth finish: clear leftover seed `demo` (single header so a fold cannot keep it). */
export function oauthFinishAbortCookies(request: Request): string[] {
  return [sessionClearCookieHeader(isHttpsRequest(request))];
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
  return redirectWithCookies(request, "/insights", oauthSuccessSetCookies(after.cookie));
}
