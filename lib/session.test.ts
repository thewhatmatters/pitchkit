import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { emptySecrets, setSecretsForTests } from "./env";
import { EMPTY_AUDIENCE, persistOwnerDisconnect, readGraphSnapshot, writeGraphSnapshot } from "./graph-store";
import { createMemoryHiddenKit, setHiddenKitNamespaceForTests } from "./hidden-kit";
import type { User } from "./schema";
import { DEMO_HANDLE, DEMO_USER_ID, seedMedia, seedUser } from "./seed";
import { loadPublicKit } from "./store";
import {
  AUTH_DISCONNECT_PATH,
  HIDDEN_COOKIE,
  SESSION_COOKIE,
  disconnectOwner,
  insightsGate,
  parseSessionValue,
  readRequestCookie,
  resolveSession,
  sessionClearCookieHeader,
  sessionCookieClearOptions,
  sessionCookieSetOptions,
  sessionOwnsHandle,
  stubConnect,
  stubSignOut,
} from "./session";
import { mintSessionToken, sessionTokenFromSetCookie } from "./session-test-helpers";
import { readServerSession, sessionKey, SESSION_TOKEN_BYTES } from "./session-store";
import { SESSION_MAX_AGE } from "./session";

const NOW = "2026-09-18T22:00:00.000Z";

function liveUser(partial: Partial<User> = {}): User {
  return {
    id: "u-rxndy",
    ig_user_id: "ig-rxndy",
    handle: "rxndy.dxniel",
    name: "Randy",
    avatar_r2_key: null,
    followers: 100,
    media_count: 10,
    token_encrypted: "enc-token",
    refresh_encrypted: "enc-refresh",
    token_expires_at: "2026-10-01T00:00:00.000Z",
    connected_at: "2026-09-01T00:00:00.000Z",
    disconnected_at: null,
    consent_index: false,
    ig_account_type: "BUSINESS",
    disclosure_version: 1,
    ...partial,
  };
}

beforeEach(() => {
  setHiddenKitNamespaceForTests(createMemoryHiddenKit());
});

afterEach(() => {
  setHiddenKitNamespaceForTests(undefined);
  setSecretsForTests(undefined);
});

describe("session cookie", () => {
  it("sets an httpOnly opaque Pitchkit session for seed demo, not the handle or an IG token", async () => {
    setSecretsForTests(emptySecrets());
    const header = (await stubConnect(new Request("http://localhost/auth/instagram"))).headers.get(
      "set-cookie",
    );
    assert.ok(header);
    assert.ok(sessionTokenFromSetCookie(header));
    assert.doesNotMatch(header, new RegExp(`${SESSION_COOKIE}=${DEMO_HANDLE}(?:;|$)`));
    assert.match(header, new RegExp(`Max-Age=${SESSION_MAX_AGE}`));
    assert.match(header, /HttpOnly/i);
    assert.match(header, /Path=\//);
    assert.match(header, /SameSite=Lax/i);
    assert.doesNotMatch(header, /Secure/i);
    assert.equal(seedUser.token_encrypted, null);
    assert.equal(seedUser.refresh_encrypted, null);
    assert.notEqual(header.includes("demo-ig-user"), true);

    const options = sessionCookieSetOptions(false);
    assert.equal(options.httpOnly, true);
    assert.equal(options.path, "/");
    assert.equal(options.sameSite, "lax");
    assert.equal(options.secure, false);
    assert.ok((options.maxAge ?? 0) > 0);
  });

  it("clears the session cookie", async () => {
    const header = (await stubSignOut(new Request("http://localhost/auth/sign-out"))).headers.get(
      "set-cookie",
    );
    assert.ok(header);
    assert.match(header, new RegExp(`${SESSION_COOKIE}=`));
    assert.match(header, /Max-Age=0/);
    assert.match(header, /HttpOnly/i);
    assert.match(header, /Path=\//);

    const options = sessionCookieClearOptions(true);
    assert.equal(options.maxAge, 0);
    assert.equal(options.httpOnly, true);
    assert.equal(options.secure, true);
    assert.equal(sessionClearCookieHeader(true).includes("Secure"), true);
  });
});

describe("insights gate", () => {
  it("parses the demo session and rejects missing or unknown handles", () => {
    assert.deepEqual(parseSessionValue(DEMO_HANDLE), {
      handle: DEMO_HANDLE,
      userId: DEMO_USER_ID,
    });
    assert.equal(parseSessionValue(undefined), null);
    assert.equal(parseSessionValue(""), null);
    assert.equal(parseSessionValue("nope"), null);
  });

  it("sends /insights home without a cookie and allows a valid session", () => {
    assert.equal(insightsGate(null), false);
    assert.equal(insightsGate(parseSessionValue(DEMO_HANDLE)), true);
  });

  it("owner Edit only when the session handle matches the kit handle", () => {
    const session = parseSessionValue(DEMO_HANDLE);
    assert.equal(sessionOwnsHandle(session, DEMO_HANDLE), true);
    assert.equal(sessionOwnsHandle(session, "someone-else"), false);
    assert.equal(sessionOwnsHandle(null, DEMO_HANDLE), false);
  });

  it("POST/GET stub connect sets the cookie and 303s to /insights; sign-out 303s home", async () => {
    setSecretsForTests(emptySecrets());
    for (const method of ["GET", "POST"] as const) {
      const connect = await stubConnect(
        new Request("http://localhost/auth/instagram", { method }),
      );
      assert.equal(connect.status, 303);
      assert.equal(connect.headers.get("location"), "http://localhost/insights");
      const token = sessionTokenFromSetCookie(connect.headers.get("set-cookie"));
      assert.ok(token);

      const signOut = await stubSignOut(
        new Request("http://localhost/auth/sign-out", {
          method,
          headers: { cookie: `${SESSION_COOKIE}=${token}` },
        }),
      );
      assert.equal(signOut.status, 303);
      assert.equal(signOut.headers.get("location"), "http://localhost/");
      assert.match(signOut.headers.get("set-cookie") ?? "", /Max-Age=0/);
      assert.equal(await resolveSession(token, "route"), null, "sign-out deletes the server session");
    }
  });

  it("stub connect fails closed without KV (no signed-in cookie)", async () => {
    setSecretsForTests(emptySecrets());
    setHiddenKitNamespaceForTests(null);
    const connect = await stubConnect(new Request("http://localhost/auth/instagram"));
    assert.equal(connect.headers.get("location"), "http://localhost/?error=persist");
    assert.equal(sessionTokenFromSetCookie(connect.headers.get("set-cookie")), null);
  });

  it("treats a resolvable session as signed-in so home can gate to Insights", () => {
    assert.equal(insightsGate(parseSessionValue(DEMO_HANDLE)), true);
    assert.equal(insightsGate(null), false);
  });

  it("resolves seed demo when live auth secrets are absent (stub path)", async () => {
    setSecretsForTests(emptySecrets());
    const session = await resolveSession(await mintSessionToken(DEMO_HANDLE, DEMO_USER_ID), "page");
    assert.deepEqual(session, { handle: DEMO_HANDLE, userId: DEMO_USER_ID });
    assert.equal(insightsGate(session), true);
  });

  it("does not treat leftover seed demo as signed-in when live auth secrets exist", async () => {
    setSecretsForTests({ ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" });
    const session = await resolveSession(await mintSessionToken(DEMO_HANDLE, DEMO_USER_ID), "page");
    assert.equal(session, null);
    assert.equal(insightsGate(session), false);
  });

  it("still resolves a live Graph snapshot handle when live auth secrets exist", async () => {
    setSecretsForTests({ ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" });
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const user = liveUser();
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );
    const session = await resolveSession(await mintSessionToken(user.handle, user.id), "route");
    assert.deepEqual(session, { handle: user.handle, userId: user.id });
    assert.equal(insightsGate(session), true);
  });
});

describe("disconnect vs sign out", () => {
  it("sign out clears cookies only and leaves a live Graph kit public", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const user = liveUser();
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );

    const signOut = await stubSignOut(new Request("http://localhost/auth/sign-out", { method: "POST" }));
    assert.equal(signOut.status, 303);
    const cookies = signOut.headers.getSetCookie();
    assert.ok(cookies.some((row) => row.includes(`${SESSION_COOKIE}=`) && row.includes("Max-Age=0")));
    assert.ok(cookies.some((row) => row.includes(`${HIDDEN_COOKIE}=`) && row.includes("Max-Age=0")));

    const kit = await loadPublicKit(user.handle, new Date(NOW));
    assert.ok(kit);
    assert.equal(kit.user.disconnected_at, null);
    assert.equal((await readGraphSnapshot(user.id))?.user.token_encrypted, "enc-token");
  });

  it("disconnect erases the snapshot, revokes the session, and 404s the public kit", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const user = liveUser();
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );

    const token = await mintSessionToken(user.handle, user.id);
    const session = await resolveSession(token, "route");
    assert.deepEqual(session, { handle: user.handle, userId: user.id });
    assert.equal(insightsGate(session), true);

    const response = await disconnectOwner(
      new Request(`http://localhost${AUTH_DISCONNECT_PATH}`, {
        method: "POST",
        headers: { cookie: `${SESSION_COOKIE}=${token}` },
      }),
    );
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "http://localhost/?deleted=1");
    const cookies = response.headers.getSetCookie();
    assert.ok(cookies.some((row) => row.includes(`${SESSION_COOKIE}=`) && row.includes("Max-Age=0")));
    assert.ok(cookies.some((row) => row.includes(`${HIDDEN_COOKIE}=`) && row.includes("Max-Age=0")));

    assert.equal(await readGraphSnapshot(user.id), null, "snapshot erased");
    assert.equal(await resolveSession(token, "route"), null);
    assert.equal(await readServerSession(token, "route"), null, "server-side session deleted");
    assert.equal(await loadPublicKit(user.handle, new Date(NOW)), null);
  });

  it("persistOwnerDisconnect stamps an existing snapshot without inventing a seed row", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const user = liveUser({ handle: "tester" });
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );
    assert.equal(await persistOwnerDisconnect({ handle: user.handle, userId: user.id }, "route", NOW), true);
    assert.equal((await readGraphSnapshot(user.id))?.user.disconnected_at, NOW);
    assert.equal(await persistOwnerDisconnect({ handle: DEMO_HANDLE, userId: DEMO_USER_ID }), false);
    assert.equal(readRequestCookie(new Request("http://localhost/"), SESSION_COOKIE), null);
  });
});

describe("session forgery (opaque server-side sessions)", () => {
  function liveSnapshot(user: User) {
    return writeGraphSnapshot({
      user,
      media: seedMedia,
      reach_series: [],
      audience: EMPTY_AUDIENCE,
      polled_at: NOW,
    });
  }

  it("rejects a legacy username-only cookie for a live creator", async () => {
    setSecretsForTests({ ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" });
    const user = liveUser();
    assert.equal(await liveSnapshot(user), true);
    assert.equal(await resolveSession(user.handle, "route"), null);
    assert.equal(await resolveSession(DEMO_HANDLE, "route"), null);
  });

  it("rejects a username-only demo cookie on the stub path too", async () => {
    setSecretsForTests(emptySecrets());
    assert.equal(await resolveSession(DEMO_HANDLE, "page"), null);
  });

  it("rejects a well-formed but unknown token", async () => {
    setSecretsForTests({ ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" });
    const user = liveUser();
    assert.equal(await liveSnapshot(user), true);
    await mintSessionToken(user.handle, user.id);
    assert.equal(await resolveSession("A".repeat(43), "route"), null);
  });

  it("forged cookie cannot disconnect another creator", async () => {
    const user = liveUser();
    assert.equal(await liveSnapshot(user), true);
    const response = await disconnectOwner(
      new Request(`http://localhost${AUTH_DISCONNECT_PATH}`, {
        method: "POST",
        headers: { cookie: `${SESSION_COOKIE}=${user.handle}` },
      }),
    );
    assert.equal(response.status, 303);
    const snapshot = await readGraphSnapshot(user.id);
    assert.equal(snapshot?.user.disconnected_at, null);
    assert.equal(snapshot?.user.token_encrypted, "enc-token");
  });

  it("a valid token resolves its owner; a session record whose userId mismatches is rejected", async () => {
    const user = liveUser();
    assert.equal(await liveSnapshot(user), true);
    const token = await mintSessionToken(user.handle, user.id);
    assert.deepEqual(await resolveSession(token, "route"), { handle: user.handle, userId: user.id });
    const stale = await mintSessionToken(user.handle, "u-someone-else");
    assert.equal(await resolveSession(stale, "route"), null);
  });

  it("stores only a SHA-256 key with a 30-day TTL; the raw token never hits KV", async () => {
    const puts: { key: string; value: string; ttl?: number }[] = [];
    const base = createMemoryHiddenKit();
    setHiddenKitNamespaceForTests({
      get: (key) => base.get(key),
      delete: (key) => base.delete!(key),
      async put(key, value, options) {
        puts.push({ key, value, ttl: options?.expirationTtl });
        await base.put(key, value);
      },
    });
    const token = await mintSessionToken("rxndy.dxniel", "u-rxndy");
    assert.equal(Buffer.from(token, "base64url").length, SESSION_TOKEN_BYTES);
    assert.equal(puts.length, 2, "session record + per-user index");
    assert.equal(puts[0].key, await sessionKey(token));
    assert.equal(puts[1].key, "session-index:u-rxndy");
    assert.ok(!puts[1].value.includes(token), "index holds hashed keys only");
    assert.equal(puts[1].ttl, SESSION_MAX_AGE);
    assert.match(puts[0].key, /^session:[0-9a-f]{64}$/);
    assert.ok(!puts[0].key.includes(token) && !puts[0].value.includes(token));
    assert.equal(puts[0].ttl, SESSION_MAX_AGE);
    assert.equal(SESSION_MAX_AGE, 60 * 60 * 24 * 30);
  });

  it("sets Secure on https", async () => {
    setSecretsForTests(emptySecrets());
    const header = (await stubConnect(new Request("https://pitchkit.example/auth/instagram"))).headers.get(
      "set-cookie",
    );
    assert.match(header ?? "", /; Secure/);
    assert.match(header ?? "", /HttpOnly/);
    assert.match(header ?? "", /SameSite=Lax/);
  });
});
