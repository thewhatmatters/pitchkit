import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptySecrets } from "./env";
import {
  INSTAGRAM_AUTHORIZE_URL,
  INSTAGRAM_CODE_EXCHANGE_URL,
  authorizeUrl,
  exchangeCodeForTokens,
  oauthCallbackError,
  redirectUriCandidates,
  resolveRedirectUri,
} from "./instagram-oauth";

describe("Instagram Business Login", () => {
  it("builds the Instagram authorize URL with locked scopes and no trailing slash by default", () => {
    const url = authorizeUrl({
      appId: "app-1",
      redirectUri: "https://pitchkit.app/auth/instagram",
      state: "abc",
    });
    assert.equal(url.startsWith(INSTAGRAM_AUTHORIZE_URL), true);
    assert.match(url, /client_id=app-1/);
    assert.match(url, /redirect_uri=https%3A%2F%2Fpitchkit.app%2Fauth%2Finstagram/);
    assert.doesNotMatch(url, /auth%2Finstagram%2F/);
    assert.match(url, /instagram_business_basic/);
    assert.match(url, /instagram_business_manage_insights/);
    assert.doesNotMatch(url, /facebook\.com\/dialog/);
  });

  it("keeps both slash forms for dashboard mismatch awareness", () => {
    assert.deepEqual(redirectUriCandidates("https://pitchkit.app/auth/instagram"), [
      "https://pitchkit.app/auth/instagram",
      "https://pitchkit.app/auth/instagram/",
    ]);
    assert.ok(
      redirectUriCandidates("https://pitchkit.app/auth/instagram/").includes(
        "https://pitchkit.app/auth/instagram/",
      ),
    );
  });

  it("uses IG_REDIRECT_URI as-is when set", () => {
    const request = new Request("http://localhost:3000/auth/instagram");
    assert.equal(
      resolveRedirectUri(request, {
        ...emptySecrets(),
        IG_REDIRECT_URI: "https://pitchkit.app/auth/instagram/",
      }),
      "https://pitchkit.app/auth/instagram/",
    );
  });

  it("exchanges code → short-lived → long-lived", async () => {
    const calls: string[] = [];
    const fetchMock: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push(`${init?.method ?? "GET"} ${url}`);
      if (url === INSTAGRAM_CODE_EXCHANGE_URL) {
        return new Response(JSON.stringify({ access_token: "short", user_id: "1784" }), { status: 200 });
      }
      if (url.includes("grant_type=ig_exchange_token")) {
        return new Response(
          JSON.stringify({ access_token: "long", expires_in: 5184000 }),
          { status: 200 },
        );
      }
      return new Response("nope", { status: 500 });
    };

    const result = await exchangeCodeForTokens({
      code: "abc",
      secrets: { ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" },
      redirectUri: "https://pitchkit.app/auth/instagram",
      now: new Date("2026-09-18T00:00:00.000Z"),
      fetch: fetchMock,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.tokens.accessToken, "long");
      assert.equal(result.tokens.userId, "1784");
    }
    assert.equal(calls[0]?.startsWith("POST "), true);
  });

  it("maps callback errors", () => {
    assert.equal(oauthCallbackError(new URLSearchParams("error=access_denied")), "denied");
    assert.equal(
      oauthCallbackError(new URLSearchParams("error=access_denied&error_reason=user_denied")),
      "denied",
    );
    assert.equal(oauthCallbackError(new URLSearchParams("error=personal_account")), "personal");
    assert.equal(oauthCallbackError(new URLSearchParams()), null);
  });
});
