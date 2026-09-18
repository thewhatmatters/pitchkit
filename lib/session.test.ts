import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { EMPTY_AUDIENCE, persistOwnerDisconnect, readGraphSnapshot, writeGraphSnapshot } from "./graph-store";
import { createMemoryHiddenKit, setHiddenKitNamespaceForTests } from "./hidden-kit";
import { assemblePublicKit } from "./kit";
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

afterEach(() => {
  setHiddenKitNamespaceForTests(undefined);
});

describe("session cookie", () => {
  it("sets an httpOnly Pitchkit session for seed handle demo, not a token", () => {
    const header = stubConnect(new Request("http://localhost/auth/instagram")).headers.get(
      "set-cookie",
    );
    assert.ok(header);
    assert.match(header, new RegExp(`${SESSION_COOKIE}=${DEMO_HANDLE}`));
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

  it("clears the session cookie", () => {
    const header = stubSignOut(new Request("http://localhost/auth/sign-out")).headers.get(
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

  it("POST/GET stub connect sets the cookie and 303s to /insights; sign-out 303s home", () => {
    for (const method of ["GET", "POST"] as const) {
      const connect = stubConnect(
        new Request("http://localhost/auth/instagram", { method }),
      );
      assert.equal(connect.status, 303);
      assert.equal(connect.headers.get("location"), "http://localhost/insights");
      assert.match(
        connect.headers.get("set-cookie") ?? "",
        new RegExp(`${SESSION_COOKIE}=${DEMO_HANDLE}`),
      );

      const signOut = stubSignOut(new Request("http://localhost/auth/sign-out", { method }));
      assert.equal(signOut.status, 303);
      assert.equal(signOut.headers.get("location"), "http://localhost/");
      assert.match(signOut.headers.get("set-cookie") ?? "", /Max-Age=0/);
    }
  });

  it("treats a resolvable session as signed-in so home can gate to Insights", () => {
    assert.equal(insightsGate(parseSessionValue(DEMO_HANDLE)), true);
    assert.equal(insightsGate(null), false);
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

    const signOut = stubSignOut(new Request("http://localhost/auth/sign-out", { method: "POST" }));
    assert.equal(signOut.status, 303);
    const cookies = signOut.headers.getSetCookie();
    assert.ok(cookies.some((row) => row.includes(`${SESSION_COOKIE}=`) && row.includes("Max-Age=0")));
    assert.ok(cookies.some((row) => row.includes(`${HIDDEN_COOKIE}=`) && row.includes("Max-Age=0")));

    const kit = await loadPublicKit(user.handle, new Date(NOW));
    assert.ok(kit);
    assert.equal(kit.user.disconnected_at, null);
    assert.equal((await readGraphSnapshot(user.id))?.user.token_encrypted, "enc-token");
  });

  it("disconnect persists disconnected_at, clears tokens and session, and 404s the public kit", async () => {
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

    const session = await resolveSession(user.handle, "route");
    assert.deepEqual(session, { handle: user.handle, userId: user.id });
    assert.equal(insightsGate(session), true);

    const response = await disconnectOwner(
      new Request(`http://localhost${AUTH_DISCONNECT_PATH}`, {
        method: "POST",
        headers: { cookie: `${SESSION_COOKIE}=${user.handle}` },
      }),
    );
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "http://localhost/");
    const cookies = response.headers.getSetCookie();
    assert.ok(cookies.some((row) => row.includes(`${SESSION_COOKIE}=`) && row.includes("Max-Age=0")));
    assert.ok(cookies.some((row) => row.includes(`${HIDDEN_COOKIE}=`) && row.includes("Max-Age=0")));

    const snapshot = await readGraphSnapshot(user.id);
    assert.ok(snapshot);
    assert.ok(snapshot.user.disconnected_at);
    assert.equal(snapshot.user.token_encrypted, null);
    assert.equal(snapshot.user.refresh_encrypted, null);
    assert.equal(snapshot.user.token_expires_at, null);

    assert.equal(await resolveSession(user.handle, "route"), null);
    assert.equal(await loadPublicKit(user.handle, new Date(NOW)), null);
    assert.equal(assemblePublicKit(snapshot.user, snapshot.media, new Date(NOW)), null);
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
