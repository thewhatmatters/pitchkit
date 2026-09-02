import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEMO_HANDLE, DEMO_USER_ID, seedUser } from "./seed";
import {
  SESSION_COOKIE,
  insightsGate,
  parseSessionValue,
  sessionClearCookieHeader,
  sessionCookieClearOptions,
  sessionCookieSetOptions,
  stubConnect,
  stubSignOut,
} from "./session";

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
});
