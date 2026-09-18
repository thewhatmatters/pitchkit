/**
 * Instagram Business Login (Instagram Login — not Facebook Login).
 * Authorize + code → short-lived → long-lived. Fail soft when secrets are missing.
 */

import { AUTH_CONNECT_PATH } from "./session";
import {
  DEFAULT_REDIRECT_URI,
  INSTAGRAM_SCOPES,
  hasLiveAuthSecrets,
  type PitchkitSecrets,
} from "./env";

export const INSTAGRAM_AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize";
export const INSTAGRAM_CODE_EXCHANGE_URL = "https://api.instagram.com/oauth/access_token";
export const INSTAGRAM_LONG_LIVED_URL = "https://graph.instagram.com/access_token";
export const INSTAGRAM_REFRESH_URL = "https://graph.instagram.com/refresh_access_token";

export const OAUTH_STATE_COOKIE = "pitchkit_oauth_state";
export const OAUTH_STATE_MAX_AGE = 60 * 10;

export type OAuthTokens = {
  accessToken: string;
  expiresAt: string | null;
  userId?: string;
};

export type TokenExchangeResult =
  | { ok: true; tokens: OAuthTokens }
  | { ok: false; reason: "exchange_failed" | "missing_code" };

/** Dashboard URIs often grow a trailing slash. Compare both forms. */
export function redirectUriCandidates(uri: string): string[] {
  const trimmed = uri.trim();
  const without = trimmed.replace(/\/$/, "");
  const withSlash = `${without}/`;
  return without === trimmed || trimmed.endsWith("/")
    ? Array.from(new Set([trimmed, without, withSlash]))
    : [trimmed, without, withSlash];
}

export function normalizeRedirectUri(uri: string): string {
  return uri.trim().replace(/\/$/, "");
}

/**
 * Exact redirect used for authorize + token exchange.
 * Prefer `IG_REDIRECT_URI` (must match the App Dashboard, slash and all).
 * Else request origin + `/auth/instagram` with no trailing slash.
 */
export function resolveRedirectUri(request: Request, secrets: PitchkitSecrets): string {
  if (secrets.IG_REDIRECT_URI) {
    return secrets.IG_REDIRECT_URI.trim();
  }
  if (hasLiveAuthSecrets(secrets)) {
    const host = new URL(request.url).host;
    if (host === "pitchkit.app" || host.endsWith(".pitchkit.app")) {
      return DEFAULT_REDIRECT_URI;
    }
  }
  return new URL(AUTH_CONNECT_PATH, request.url).toString();
}

export function authorizeUrl(input: {
  appId: string;
  redirectUri: string;
  state?: string;
}): string {
  const url = new URL(INSTAGRAM_AUTHORIZE_URL);
  url.searchParams.set("client_id", input.appId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", INSTAGRAM_SCOPES.join(","));
  if (input.state) {
    url.searchParams.set("state", input.state);
  }
  return url.toString();
}

export function newOAuthState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

type ShortLivedResponse = {
  access_token?: string;
  user_id?: string | number;
  permissions?: string[];
};

type LongLivedResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
};

function expiresAtFromSeconds(now: Date, expiresIn: number | undefined): string | null {
  if (typeof expiresIn !== "number" || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    return null;
  }
  return new Date(now.getTime() + expiresIn * 1000).toISOString();
}

export async function exchangeCodeForTokens(input: {
  code: string;
  secrets: PitchkitSecrets;
  redirectUri: string;
  now?: Date;
  fetch?: typeof fetch;
}): Promise<TokenExchangeResult> {
  const { secrets } = input;
  if (!secrets.IG_APP_ID || !secrets.IG_APP_SECRET || !input.code) {
    return { ok: false, reason: input.code ? "exchange_failed" : "missing_code" };
  }
  const doFetch = input.fetch ?? fetch;
  const now = input.now ?? new Date();

  const body = new URLSearchParams({
    client_id: secrets.IG_APP_ID,
    client_secret: secrets.IG_APP_SECRET,
    grant_type: "authorization_code",
    redirect_uri: input.redirectUri,
    code: input.code,
  });

  let short: ShortLivedResponse;
  try {
    const response = await doFetch(INSTAGRAM_CODE_EXCHANGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    short = (await response.json()) as ShortLivedResponse;
    if (!response.ok || !short.access_token) {
      return { ok: false, reason: "exchange_failed" };
    }
  } catch {
    return { ok: false, reason: "exchange_failed" };
  }

  try {
    const longUrl = new URL(INSTAGRAM_LONG_LIVED_URL);
    longUrl.searchParams.set("grant_type", "ig_exchange_token");
    longUrl.searchParams.set("client_secret", secrets.IG_APP_SECRET);
    longUrl.searchParams.set("access_token", short.access_token);
    const response = await doFetch(longUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const longLived = (await response.json()) as LongLivedResponse;
    if (response.ok && longLived.access_token) {
      return {
        ok: true,
        tokens: {
          accessToken: longLived.access_token,
          expiresAt: expiresAtFromSeconds(now, longLived.expires_in),
          userId: short.user_id != null ? String(short.user_id) : undefined,
        },
      };
    }
  } catch {
    // Fall through — short-lived still lets us poll once.
  }

  return {
    ok: true,
    tokens: {
      accessToken: short.access_token,
      expiresAt: expiresAtFromSeconds(now, 3600),
      userId: short.user_id != null ? String(short.user_id) : undefined,
    },
  };
}

export function oauthCallbackError(search: URLSearchParams): "personal" | "denied" | null {
  const error = (search.get("error") ?? "").toLowerCase();
  const reason = (search.get("error_reason") ?? search.get("error_description") ?? "").toLowerCase();
  if (!error && !reason) {
    return null;
  }
  if (error.includes("personal") || reason.includes("personal")) {
    return "personal";
  }
  if (error === "access_denied" || reason.includes("denied") || reason.includes("cancel")) {
    return "denied";
  }
  return "denied";
}
