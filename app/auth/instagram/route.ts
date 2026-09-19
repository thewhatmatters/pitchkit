import {
  hasLiveAuthSecrets,
  readSecrets,
} from "@/lib/env";
import {
  authorizeUrl,
  newOAuthState,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE,
  oauthCallbackError,
  resolveRedirectUri,
} from "@/lib/instagram-oauth";
import {
  finishLiveOAuth,
  oauthFinishAbortCookies,
  oauthLandingPath,
} from "@/lib/oauth-finish";
import {
  isHttpsRequest,
  serializeSessionCookie,
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const denied = oauthCallbackError(url.searchParams);
  if (denied === "personal") {
    return redirectWithCookies(request, oauthLandingPath("personal"), oauthFinishAbortCookies(request));
  }
  if (denied === "denied") {
    return redirectWithCookies(request, "/", oauthFinishAbortCookies(request));
  }

  const code = url.searchParams.get("code");
  if (code) {
    const secrets = await readSecrets("route");
    return finishLiveOAuth({
      request,
      code,
      state: url.searchParams.get("state"),
      secrets,
    });
  }

  return beginOAuth(request);
}

export async function POST(request: Request) {
  return beginOAuth(request);
}
