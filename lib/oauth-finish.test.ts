import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { emptySecrets, setSecretsForTests } from "./env";
import { GRAPH_HOST } from "./graph";
import { createMemoryHiddenKit, setHiddenKitNamespaceForTests } from "./hidden-kit";
import {
  INSTAGRAM_CODE_EXCHANGE_URL,
  INSTAGRAM_LONG_LIVED_URL,
  OAUTH_STATE_COOKIE,
} from "./instagram-oauth";
import { landingErrorCopy } from "./copy";
import { EMPTY_AUDIENCE, readGraphSnapshotByHandle, writeGraphSnapshot } from "./graph-store";
import {
  cookieHandleAfterPersist,
  finishLiveOAuth,
  lastWinsSetCookie,
  oauthLandingPath,
  oauthSuccessSetCookies,
  sessionCookieAfterPersist,
} from "./oauth-finish";
import { snapshotFromMe } from "./poll";
import { DEMO_HANDLE } from "./seed";
import { resolveSession, SESSION_COOKIE, stubConnect } from "./session";
import { sessionTokenFromSetCookie } from "./session-test-helpers";

const STATE = "oauth-state-unit";
const NOW = new Date("2026-09-19T18:00:00.000Z");

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function liveSecrets() {
  return { ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" };
}

function finishRequest(
  path = `/auth/instagram?code=ok&state=${STATE}`,
  extraCookie?: string,
): Request {
  const cookie = extraCookie
    ? `${extraCookie}; ${OAUTH_STATE_COOKIE}=${STATE}`
    : `${OAUTH_STATE_COOKIE}=${STATE}`;
  return new Request(`http://localhost${path}`, {
    headers: { cookie },
  });
}

async function assertSessionOverwrite(response: Response, handle: string) {
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "http://localhost/insights");
  const cookies = response.headers.getSetCookie();
  assert.equal(cookies.length, 1);
  const token = sessionTokenFromSetCookie(cookies[0]);
  assert.ok(token, "session cookie carries an opaque token");
  assert.ok(!cookies[0].includes(`${SESSION_COOKIE}=${handle}`), "cookie is not the handle");
  assert.doesNotMatch(cookies[0], new RegExp(OAUTH_STATE_COOKIE));
  // OpenNext/Workers may keep only Headers.get("set-cookie") or the last cookie.
  assert.equal(sessionTokenFromSetCookie(response.headers.get("set-cookie")), token);
  assert.equal(sessionTokenFromSetCookie(lastWinsSetCookie(cookies)), token);
  assert.deepEqual(oauthSuccessSetCookies(cookies[0]), cookies);
  assert.equal((await resolveSession(token, "route"))?.handle, handle);
}

function graphFetch(overrides: { mediaOk?: boolean; meOk?: boolean } = {}): typeof fetch {
  const mediaOk = overrides.mediaOk !== false;
  const meOk = overrides.meOk !== false;
  return async (input) => {
    const url = String(input);
    if (url.startsWith(INSTAGRAM_CODE_EXCHANGE_URL)) {
      return jsonResponse({ access_token: "short-token", user_id: "1784" });
    }
    if (url.startsWith(INSTAGRAM_LONG_LIVED_URL)) {
      return jsonResponse({ access_token: "long-token", expires_in: 5184000 });
    }
    if (url.includes(`${GRAPH_HOST}/`) && url.includes("/me?")) {
      if (!meOk) {
        return jsonResponse({ error: { message: "me_failed" } }, 400);
      }
      return jsonResponse({
        user_id: "1784",
        username: "rxndy.dxniel",
        name: "Randy",
        account_type: "BUSINESS",
        followers_count: 200,
        media_count: 3,
      });
    }
    if (url.includes("/media?")) {
      if (!mediaOk) {
        return jsonResponse({ error: { message: "media_failed" } }, 500);
      }
      return jsonResponse({ data: [] });
    }
    if (url.includes("metric=reach") || url.includes("follower_demographics")) {
      return jsonResponse({ data: [] });
    }
    return jsonResponse({ error: { message: `unexpected ${url}` } }, 500);
  };
}

afterEach(() => {
  setSecretsForTests(undefined);
  setHiddenKitNamespaceForTests(undefined);
  mock.restoreAll();
});

describe("cookie after persist", () => {
  it("mints a server session for the in-memory handle without resolveSession", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    setSecretsForTests(liveSecrets());
    const after = cookieHandleAfterPersist(true, "rxndy.dxniel");
    assert.deepEqual(after, { ok: true, handle: "rxndy.dxniel" });
    const cookie = await sessionCookieAfterPersist({
      persisted: true,
      handle: "rxndy.dxniel",
      userId: "u-rxndy",
      secure: false,
    });
    assert.equal(cookie.ok, true);
    if (!cookie.ok) {
      return;
    }
    assert.ok(sessionTokenFromSetCookie(cookie.cookie));
    assert.doesNotMatch(cookie.cookie, /rxndy/);
    assert.match(cookie.cookie, /HttpOnly/i);
  });

  it("success Set-Cookie is only the session so a last-wins fold overwrites demo", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const session = await sessionCookieAfterPersist({
      persisted: true,
      handle: "rxndy.dxniel",
      userId: "u-rxndy",
      secure: true,
    });
    assert.equal(session.ok, true);
    if (!session.ok) {
      return;
    }
    const cookies = oauthSuccessSetCookies(session.cookie);
    assert.equal(cookies.length, 1);
    assert.equal(lastWinsSetCookie(cookies), session.cookie);
    assert.ok(sessionTokenFromSetCookie(cookies[0]));
    assert.match(cookies[0], /Secure/);
    assert.doesNotMatch(cookies[0], /pitchkit_oauth_state/);
  });

  it("does not set a cookie when write is false or KV is missing", async () => {
    assert.deepEqual(cookieHandleAfterPersist(false, "rxndy.dxniel"), {
      ok: false,
      error: "persist",
    });
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    assert.deepEqual(
      await sessionCookieAfterPersist({ persisted: false, handle: "rxndy.dxniel", userId: "u", secure: true }),
      { ok: false, error: "persist" },
    );
    setHiddenKitNamespaceForTests(null);
    assert.deepEqual(
      await sessionCookieAfterPersist({ persisted: true, handle: "rxndy.dxniel", userId: "u", secure: true }),
      { ok: false, error: "persist" },
    );
  });
});

describe("oauth landing errors", () => {
  it("uses distinct query params", () => {
    assert.equal(oauthLandingPath("oauth_state"), "/?error=oauth_state");
    assert.equal(oauthLandingPath("oauth_exchange"), "/?error=oauth_exchange");
    assert.equal(oauthLandingPath("oauth_me"), "/?error=oauth_me");
    assert.equal(oauthLandingPath("personal"), "/?error=personal");
    assert.equal(oauthLandingPath("oauth_poll"), "/?error=oauth_poll");
    assert.equal(oauthLandingPath("persist"), "/?error=persist");
    assert.match(landingErrorCopy("oauth_state") ?? "", /expired/);
    assert.match(landingErrorCopy("oauth_exchange") ?? "", /did not finish/);
    assert.match(landingErrorCopy("oauth_me") ?? "", /profile/);
    assert.match(landingErrorCopy("oauth_poll") ?? "", /Insights/);
    assert.match(landingErrorCopy("persist") ?? "", /could not save/);
    assert.match(landingErrorCopy("personal") ?? "", /Professional/);
    assert.equal(landingErrorCopy(undefined), null);
  });
});

describe("finishLiveOAuth", () => {
  it("sets pitchkit_session from the written handle without a resolveSession re-read", async () => {
    setSecretsForTests(liveSecrets());
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    mock.method(globalThis, "fetch", graphFetch());

    const response = await finishLiveOAuth({
      request: finishRequest(),
      code: "ok",
      state: STATE,
      secrets: liveSecrets(),
    });
    await assertSessionOverwrite(response, "rxndy.dxniel");
  });

  it("escapes a Graph snapshot stuck on demo when /me username is not demo", async () => {
    setSecretsForTests(liveSecrets());
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    mock.method(globalThis, "fetch", graphFetch());
    assert.equal(
      await writeGraphSnapshot({
        user: {
          id: "u-contaminated",
          ig_user_id: "1784",
          handle: DEMO_HANDLE,
          name: "Randy",
          avatar_r2_key: null,
          followers: 200,
          media_count: 3,
          token_encrypted: null,
          refresh_encrypted: null,
          token_expires_at: null,
          connected_at: "2026-09-01T00:00:00.000Z",
          disconnected_at: null,
          consent_index: false,
          ig_account_type: "BUSINESS",
          disclosure_version: 1,
        },
        media: [],
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW.toISOString(),
      }),
      true,
    );

    const response = await finishLiveOAuth({
      request: finishRequest(
        `/auth/instagram?code=ok&state=${STATE}`,
        `${SESSION_COOKIE}=${DEMO_HANDLE}`,
      ),
      code: "ok",
      state: STATE,
      secrets: liveSecrets(),
    });
    await assertSessionOverwrite(response, "rxndy.dxniel");
    assert.doesNotMatch(
      response.headers.get("set-cookie") ?? "",
      new RegExp(`${SESSION_COOKIE}=${DEMO_HANDLE}(?:;|$)`),
    );
    const migrated = await readGraphSnapshotByHandle("rxndy.dxniel", "route");
    assert.equal(migrated?.user.handle, "rxndy.dxniel");
    assert.equal(migrated?.user.ig_user_id, "1784");
    assert.equal(migrated?.user.id, "u-contaminated");
  });

  it("overwrites leftover pitchkit_session=demo with the persisted handle", async () => {
    setSecretsForTests(liveSecrets());
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    mock.method(globalThis, "fetch", graphFetch());

    const response = await finishLiveOAuth({
      request: finishRequest(
        `/auth/instagram?code=ok&state=${STATE}`,
        `${SESSION_COOKIE}=${DEMO_HANDLE}`,
      ),
      code: "ok",
      state: STATE,
      secrets: liveSecrets(),
    });
    await assertSessionOverwrite(response, "rxndy.dxniel");
    assert.doesNotMatch(response.headers.get("set-cookie") ?? "", new RegExp(`${SESSION_COOKIE}=${DEMO_HANDLE}`));
  });

  it("persists a minimal snapshot and logs in when Insights poll fails after /me", async () => {
    setSecretsForTests(liveSecrets());
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    mock.method(globalThis, "fetch", graphFetch({ mediaOk: false }));

    const response = await finishLiveOAuth({
      request: finishRequest(),
      code: "ok",
      state: STATE,
      secrets: liveSecrets(),
    });
    await assertSessionOverwrite(response, "rxndy.dxniel");
  });

  it("surfaces persist without a session cookie when both writes fail", async () => {
    setSecretsForTests(liveSecrets());
    setHiddenKitNamespaceForTests(null);
    mock.method(globalThis, "fetch", graphFetch());

    const response = await finishLiveOAuth({
      request: finishRequest(),
      code: "ok",
      state: STATE,
      secrets: liveSecrets(),
    });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "http://localhost/?error=persist");
    const cookies = response.headers.getSetCookie();
    assert.equal(cookies.length, 1);
    assert.ok(cookies.every((row) => !row.includes(`${SESSION_COOKIE}=rxndy.dxniel`)));
    assert.ok(cookies.some((row) => row.includes(`${SESSION_COOKIE}=`) && row.includes("Max-Age=0")));
    assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
  });

  it("surfaces oauth_state on mismatch and clears leftover session", async () => {
    const response = await finishLiveOAuth({
      request: finishRequest(),
      code: "ok",
      state: "other",
      secrets: liveSecrets(),
    });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "http://localhost/?error=oauth_state");
    const abortCookies = response.headers.getSetCookie();
    assert.equal(abortCookies.length, 1);
    assert.ok(abortCookies[0].includes(`${SESSION_COOKIE}=`) && abortCookies[0].includes("Max-Age=0"));
    assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
  });

  it("surfaces oauth_exchange when the token exchange fails", async () => {
    mock.method(globalThis, "fetch", async () => jsonResponse({ error: "nope" }, 400));
    const response = await finishLiveOAuth({
      request: finishRequest(),
      code: "ok",
      state: STATE,
      secrets: liveSecrets(),
    });
    assert.equal(response.headers.get("location"), "http://localhost/?error=oauth_exchange");
  });

  it("surfaces oauth_me when /me fails", async () => {
    mock.method(globalThis, "fetch", graphFetch({ meOk: false }));
    const response = await finishLiveOAuth({
      request: finishRequest(),
      code: "ok",
      state: STATE,
      secrets: liveSecrets(),
    });
    assert.equal(response.headers.get("location"), "http://localhost/?error=oauth_me");
  });
});

describe("snapshotFromMe", () => {
  it("builds empty media / reach / audience from a Professional /me", () => {
    const snapshot = snapshotFromMe({
      me: {
        user_id: "1784",
        username: "rxndy.dxniel",
        name: "Randy",
        account_type: "BUSINESS",
        followers_count: 200,
      },
      handle: "rxndy.dxniel",
      userId: "u-rxndy",
      now: NOW,
    });
    assert.ok(snapshot);
    assert.equal(snapshot.user.handle, "rxndy.dxniel");
    assert.equal(snapshot.user.ig_user_id, "1784");
    assert.deepEqual(snapshot.media, []);
    assert.deepEqual(snapshot.reach_series, []);
    assert.deepEqual(snapshot.audience, { country: [], city: [], age: [], gender: [] });
    assert.equal(snapshot.polled_at, NOW.toISOString());
  });
});

describe("stub seed session", () => {
  it("still signs in seed demo via a server session when live secrets are absent", async () => {
    setSecretsForTests(emptySecrets());
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const response = await stubConnect(new Request("http://localhost/auth/instagram"));
    assert.equal(response.status, 303);
    const token = sessionTokenFromSetCookie(response.headers.get("set-cookie"));
    assert.ok(token);
    assert.equal((await resolveSession(token, "route"))?.handle, DEMO_HANDLE);
  });
});
