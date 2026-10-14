import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, it } from "node:test";
import { eraseCreatorData } from "./creator-erase";
import { emptySecrets, setSecretsForTests } from "./env";
import { EMPTY_AUDIENCE, persistOwnerKitProfile, readGraphSnapshot, writeGraphSnapshot } from "./graph-store";
import type { HiddenKitNamespace } from "./hidden-kit-kv";
import { hiddenKitKey, setHiddenKitNamespaceForTests } from "./hidden-kit-kv";
import {
  handleMetaDataDeletion,
  parseSignedRequest,
  readDeletionRecord,
  setMetaAppSecretForTests,
} from "./meta-deletion";
import type { Media, User } from "./schema";
import { seedMedia } from "./seed";
import { AUTH_DISCONNECT_PATH, SESSION_COOKIE, disconnectOwner, resolveSession } from "./session";
import { mintSessionToken } from "./session-test-helpers";
import { readServerSession } from "./session-store";
import { createMemorySqlStore, setSqlStoreForTests, type SqlStore } from "./sql-store";
import { loadPublicKit } from "./store";

const NOW = "2026-10-13T22:00:00.000Z";
// Test-only HMAC key. Not a real Meta secret.
const TEST_SECRET = "test-only-meta-app-secret";

/** Map-backed KV that exposes its keys so tests can prove nothing is left. */
function inspectableKv(): HiddenKitNamespace & { keys(): string[] } {
  const data = new Map<string, string>();
  return {
    async get(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    async put(key, value) {
      data.set(key, value);
    },
    async delete(key) {
      data.delete(key);
    },
    keys() {
      return [...data.keys()].filter((key) => data.get(key) !== "");
    },
  };
}

function liveUser(partial: Partial<User> = {}): User {
  return {
    id: "6f1c1b7e-3a0e-4c1e-9d55-1f0c2e7a9b10",
    ig_user_id: "17841400000000001",
    handle: "erase.me",
    name: "Erase Me",
    avatar_r2_key: "https://cdn.example/avatar.jpg",
    followers: 1200,
    media_count: 6,
    token_encrypted: "enc-token",
    refresh_encrypted: "enc-refresh",
    token_expires_at: "2026-12-01T00:00:00.000Z",
    connected_at: "2026-10-01T00:00:00.000Z",
    disconnected_at: null,
    consent_index: false,
    ig_account_type: "BUSINESS",
    disclosure_version: 1,
    ...partial,
  };
}

function liveMedia(user: User): Media[] {
  return seedMedia.slice(0, 3).map((row, i) => ({
    ...row,
    id: `00000000-0000-4000-8000-00000000000${i}`,
    user_id: user.id,
    ig_media_id: `ig-media-${i}`,
    reach: 500 + i,
    saves: 10 + i,
  }));
}

async function seedCreator(kv: ReturnType<typeof inspectableKv>, user = liveUser()) {
  const media = liveMedia(user);
  assert.equal(
    await writeGraphSnapshot(
      {
        user,
        media,
        reach_series: [{ day: "2026-10-12", reach: 900 }],
        audience: { ...EMPTY_AUDIENCE, country: [{ label: "US", share: 0.7 }] as never },
        polled_at: NOW,
        intro: "Austin food creator.",
        past_brands: [{ id: "b1", name: "Topo Chico" }],
      },
      "route",
    ),
    true,
  );
  await kv.put(hiddenKitKey(user.id), JSON.stringify({ [media[0].id]: NOW }));
  const tokenA = await mintSessionToken(user.handle, user.id);
  const tokenB = await mintSessionToken(user.handle, user.id);
  return { user, media, tokenA, tokenB };
}

function signedRequest(payload: object, secret = TEST_SECRET): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${sig}.${body}`;
}

function deletionRequest(signed: string): Request {
  return new Request("https://pitchkit.app/api/meta/data-deletion", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ signed_request: signed }).toString(),
  });
}

function disconnectRequest(token: string): Request {
  return new Request(`http://localhost${AUTH_DISCONNECT_PATH}`, {
    method: "POST",
    headers: { cookie: `${SESSION_COOKIE}=${token}` },
  });
}

let kv: ReturnType<typeof inspectableKv>;

beforeEach(() => {
  kv = inspectableKv();
  setHiddenKitNamespaceForTests(kv);
  setSecretsForTests(emptySecrets());
  setSqlStoreForTests(null);
});

afterEach(() => {
  setHiddenKitNamespaceForTests(undefined);
  setSecretsForTests(undefined);
  setSqlStoreForTests(undefined);
  setMetaAppSecretForTests(undefined);
});

describe("disconnect = real data delete (KV path)", () => {
  it("erases every KV key and every session for the creator", async () => {
    const { user, tokenA, tokenB } = await seedCreator(kv);
    assert.ok(kv.keys().length >= 7, "seeded graph:*, hidden:, session:, session-index:");

    const response = await disconnectOwner(disconnectRequest(tokenA));
    assert.equal(response.status, 303);

    assert.deepEqual(kv.keys(), [], "no creator key survives");
    assert.equal(await readGraphSnapshot(user.id, "route"), null);
    assert.equal(await readServerSession(tokenB, "route"), null, "other device signed out too");
    assert.equal(await resolveSession(tokenB, "route"), null);
    assert.equal(await loadPublicKit(user.handle, new Date(NOW)), null);
  });

  it("is idempotent", async () => {
    const { user, tokenA } = await seedCreator(kv);
    await disconnectOwner(disconnectRequest(tokenA));
    assert.deepEqual(await eraseCreatorData({ userId: user.id, handle: user.handle }), { ok: true, found: false });
    const again = await disconnectOwner(disconnectRequest(tokenA));
    assert.equal(again.status, 303);
    assert.deepEqual(kv.keys(), []);
  });

  it("reconnecting starts fresh: no old posts, intro, brands, hides or audience", async () => {
    const { user, tokenA } = await seedCreator(kv);
    await disconnectOwner(disconnectRequest(tokenA));

    const fresh = { ...user, token_encrypted: "enc-new" };
    assert.equal(
      await writeGraphSnapshot(
        { user: fresh, media: [], reach_series: [], audience: EMPTY_AUDIENCE, polled_at: NOW },
        "route",
      ),
      true,
    );
    const snapshot = await readGraphSnapshot(user.id, "route");
    assert.ok(snapshot);
    assert.equal(snapshot.media.length, 0);
    assert.equal(snapshot.intro, null);
    assert.deepEqual(snapshot.past_brands, []);
    assert.deepEqual(snapshot.audience.country, []);
    assert.deepEqual(snapshot.reach_series, []);
    assert.equal(snapshot.user.disconnected_at, null);
    assert.equal(await kv.get(hiddenKitKey(user.id)), null);
    // Kit profile edits after reconnect do not resurrect old values either.
    assert.equal(
      await persistOwnerKitProfile({ handle: user.handle, userId: user.id }, { intro: "New", past_brands: [], theme: "light" }),
      true,
    );
    assert.deepEqual((await readGraphSnapshot(user.id, "route"))?.past_brands, []);
  });
});

describe("disconnect = real data delete (SQL path)", () => {
  it("deletes users + media rows and the graph:payload extras", async () => {
    const sql: SqlStore = createMemorySqlStore();
    setSqlStoreForTests(sql);
    const { user, tokenA } = await seedCreator(kv);
    assert.ok(await sql.findUserById(user.id));
    assert.equal((await sql.listMediaByUserId(user.id)).length, 3);

    await disconnectOwner(disconnectRequest(tokenA));

    assert.equal(await sql.findUserById(user.id), null);
    assert.equal((await sql.listMediaByUserId(user.id)).length, 0);
    assert.deepEqual(kv.keys(), []);
  });
});

describe("Meta data deletion callback", () => {
  it("returns 503 when META_APP_SECRET is unset", async () => {
    setMetaAppSecretForTests(null);
    await seedCreator(kv);
    const response = await handleMetaDataDeletion(
      deletionRequest(signedRequest({ algorithm: "HMAC-SHA256", user_id: "17841400000000001" })),
    );
    assert.equal(response.status, 503);
    assert.ok(kv.keys().length > 0, "nothing deleted while switched off");
  });

  it("rejects a forged or malformed signed_request and deletes nothing", async () => {
    setMetaAppSecretForTests(TEST_SECRET);
    await seedCreator(kv);
    const before = kv.keys().length;
    const payload = { algorithm: "HMAC-SHA256", user_id: "17841400000000001" };
    const forged = signedRequest(payload, "attacker-guess");
    const [sig] = signedRequest(payload).split(".");
    const tampered = `${sig}.${Buffer.from(JSON.stringify({ ...payload, user_id: "other" })).toString("base64url")}`;
    const wrongAlgo = signedRequest({ algorithm: "HMAC-SHA1", user_id: "17841400000000001" });
    for (const bad of [forged, tampered, wrongAlgo, "garbage", "a.b.c", ""]) {
      const response = await handleMetaDataDeletion(deletionRequest(bad));
      assert.equal(response.status, 400, `rejects ${bad.slice(0, 12)}`);
      const text = await response.text();
      assert.doesNotMatch(text, new RegExp(TEST_SECRET));
    }
    assert.equal(kv.keys().length, before);
    assert.equal(await parseSignedRequest(forged, TEST_SECRET), null);
  });

  it("a valid signed_request deletes the matching creator and returns {url, confirmation_code}", async () => {
    setMetaAppSecretForTests(TEST_SECRET);
    const { user, tokenA } = await seedCreator(kv);
    const response = await handleMetaDataDeletion(
      deletionRequest(signedRequest({ algorithm: "HMAC-SHA256", user_id: user.ig_user_id, issued_at: 1760390400 })),
    );
    assert.equal(response.status, 200);
    const body = (await response.json()) as { url: string; confirmation_code: string };
    assert.match(body.confirmation_code, /^[0-9a-f]{24}$/);
    assert.equal(body.url, `https://pitchkit.app/data-deletion/status?code=${body.confirmation_code}`);
    assert.doesNotMatch(JSON.stringify(body), new RegExp(TEST_SECRET));

    assert.equal(await readGraphSnapshot(user.id, "route"), null);
    assert.equal(await resolveSession(tokenA, "route"), null);
    assert.deepEqual(
      kv.keys(),
      [`deletion:${body.confirmation_code}`],
      "only the anonymous confirmation record remains",
    );
    const record = await readDeletionRecord(body.confirmation_code);
    assert.equal(record?.status, "deleted");
    assert.doesNotMatch(JSON.stringify(record), /erase\.me|17841400000000001|6f1c1b7e/);
  });

  it("valid request for an unknown user still confirms (no_data)", async () => {
    setMetaAppSecretForTests(TEST_SECRET);
    const response = await handleMetaDataDeletion(
      deletionRequest(signedRequest({ algorithm: "HMAC-SHA256", user_id: "nobody" })),
    );
    assert.equal(response.status, 200);
    const body = (await response.json()) as { confirmation_code: string };
    assert.equal((await readDeletionRecord(body.confirmation_code))?.status, "no_data");
  });
});
