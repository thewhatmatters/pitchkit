import {
  hasLiveAuthSecrets,
  readSecrets,
} from "@/lib/env";
import {
  handleAfterReconnect,
  pitchkitHandleFromUsername,
  uniqueHandle,
} from "@/lib/handle";
import {
  authorizeUrl,
  exchangeCodeForTokens,
  newOAuthState,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE,
  oauthCallbackError,
  resolveRedirectUri,
} from "@/lib/instagram-oauth";
import {
  createGraphClient,
  fetchMe,
  igUserIdFromMe,
  isPersonalAccount,
  isProfessionalAccount,
} from "@/lib/graph";
import {
  listTakenHandles,
  readGraphSnapshotByIgUserId,
  writeGraphSnapshot,
} from "@/lib/graph-store";
import { pollInsights } from "@/lib/poll";
import { encryptTokenIfPossible } from "@/lib/token-crypto";
import {
  isHttpsRequest,
  serializeSessionCookie,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionClearCookieHeader,
  stubConnect,
} from "@/lib/session";

export const dynamic = "force-dynamic";

// WHA-313: live reconnect may offer optional kit URL update when Instagram
// returns a username different from users.handle (`update_handle=1`).
// Default = keep. Seed `demo` stays frozen. Stub Connect has no rename UI.

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

function parseCookie(request: Request, name: string): string | null {
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

/** Failed live OAuth finish: drop oauth state and any leftover seed `demo` session. */
function oauthFinishAbortCookies(request: Request): string[] {
  const secure = isHttpsRequest(request);
  return [
    cookieHeader(OAUTH_STATE_COOKIE, "", secure, 0),
    sessionClearCookieHeader(secure),
  ];
}

async function beginOAuth(request: Request): Promise<Response> {
  const secrets = await readSecrets("route");
  if (!hasLiveAuthSecrets(secrets)) {
    return stubConnect(request);
  }

  const redirectUri = resolveRedirectUri(request, secrets);
  const state = newOAuthState();
  const secure = isHttpsRequest(request);
  const url = authorizeUrl({
    appId: secrets.IG_APP_ID!,
    redirectUri,
    state,
  });
  return new Response(null, {
    status: 303,
    headers: {
      Location: url,
      "Set-Cookie": cookieHeader(OAUTH_STATE_COOKIE, state, secure, OAUTH_STATE_MAX_AGE),
      "Cache-Control": "no-store",
    },
  });
}

async function finishOAuth(request: Request, code: string, state: string | null): Promise<Response> {
  const secrets = await readSecrets("route");
  const secure = isHttpsRequest(request);
  const abortCookies = oauthFinishAbortCookies(request);
  const clearState = cookieHeader(OAUTH_STATE_COOKIE, "", secure, 0);

  if (state) {
    const expected = parseCookie(request, OAUTH_STATE_COOKIE);
    if (!expected || expected !== state) {
      return redirectWithCookies(request, "/", abortCookies);
    }
  }

  const redirectUri = resolveRedirectUri(request, secrets);
  const exchanged = await exchangeCodeForTokens({
    code,
    secrets,
    redirectUri,
  });
  if (!exchanged.ok) {
    return redirectWithCookies(request, "/", abortCookies);
  }

  const client = createGraphClient({
    token: exchanged.tokens.accessToken,
    version: secrets.GRAPH_API_VERSION,
  });
  const me = await fetchMe(client);
  if (!me.ok) {
    return redirectWithCookies(request, "/", abortCookies);
  }
  if (isPersonalAccount(me.data.account_type) || (me.data.account_type != null && !isProfessionalAccount(me.data.account_type))) {
    return redirectWithCookies(request, "/?error=personal", abortCookies);
  }

  const igUserId = igUserIdFromMe(me.data) ?? exchanged.tokens.userId;
  if (!igUserId) {
    return redirectWithCookies(request, "/", abortCookies);
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
  if (!polled.ok) {
    if (polled.reason === "personal") {
      return redirectWithCookies(request, "/?error=personal", abortCookies);
    }
    return redirectWithCookies(request, "/", abortCookies);
  }

  const tokenEncrypted = await encryptTokenIfPossible(exchanged.tokens.accessToken, secrets.TOKEN_KEY);
  const snapshot = {
    ...polled.snapshot,
    user: {
      ...polled.snapshot.user,
      handle,
      token_encrypted: tokenEncrypted,
      token_expires_at: exchanged.tokens.expiresAt,
    },
  };
  const persisted = await writeGraphSnapshot(snapshot, "route");
  if (!persisted) {
    return redirectWithCookies(request, "/?error=persist", abortCookies);
  }

  const sessionCookie = cookieHeader(
    SESSION_COOKIE,
    snapshot.user.handle,
    secure,
    SESSION_MAX_AGE,
  );
  return redirectWithCookies(request, "/insights", [sessionCookie, clearState]);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const denied = oauthCallbackError(url.searchParams);
  if (denied === "personal") {
    return redirectWithCookies(request, "/?error=personal", oauthFinishAbortCookies(request));
  }
  if (denied === "denied") {
    return redirectWithCookies(request, "/", oauthFinishAbortCookies(request));
  }

  const code = url.searchParams.get("code");
  if (code) {
    return finishOAuth(request, code, url.searchParams.get("state"));
  }

  return beginOAuth(request);
}

export async function POST(request: Request) {
  return beginOAuth(request);
}
