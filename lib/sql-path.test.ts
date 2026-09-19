import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { emptySecrets, setSecretsForTests } from "./env";
import { EMPTY_AUDIENCE, persistOwnerDisconnect, readGraphSnapshot, readGraphSnapshotByHandle, writeGraphSnapshot } from "./graph-store";
import { createMemoryHiddenKit, hideFromKit, restoreToKit, setHiddenKitNamespaceForTests } from "./hidden-kit";
import { resetHyperdriveForTests, setHasHyperdriveForTests } from "./hyperdrive";
import type { User } from "./schema";
import { DEMO_HANDLE, DEMO_USER_ID, seedMedia } from "./seed";
import { parseSessionValue, resolveSession } from "./session";
import { createMemorySqlStore, resetSqlStoreForTests, setSqlStoreForTests, type SqlStore } from "./sql-store";
import { loadPublicKit } from "./store";

const NOW = "2026-09-18T22:00:00.000Z";
const HIDDEN_AT = "2026-09-18T22:30:00.000Z";

function liveUser(partial: Partial<User> = {}): User {
  return {
    id: "11111111-1111-4111-8111-111111111111",
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
  resetSqlStoreForTests();
  resetHyperdriveForTests();
  setHiddenKitNamespaceForTests(undefined);
  setSecretsForTests(undefined);
});

describe("Hyperdrive SQL path", () => {
  it("writes Graph users/media to SQL and 404s after disconnect", async () => {
    const user = liveUser();
    const media = seedMedia.map((row) => ({ ...row, user_id: user.id }));
    const sql = createMemorySqlStore();
    setSqlStoreForTests(sql);
    setHasHyperdriveForTests(true);

    assert.equal(
      await writeGraphSnapshot({
        user,
        media,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );
    const stored = await sql.findUserByHandle(user.handle);
    assert.equal(stored?.token_encrypted, "enc-token");
    assert.equal((await sql.listMediaByUserId(user.id)).length, media.length);

    const kit = await loadPublicKit(user.handle, new Date(NOW));
    assert.ok(kit);
    assert.equal(kit.user.handle, user.handle);

    assert.equal(await persistOwnerDisconnect({ handle: user.handle, userId: user.id }, "route", NOW), true);
    const disconnected = await sql.findUserById(user.id);
    assert.equal(disconnected?.disconnected_at, NOW);
    assert.equal(disconnected?.token_encrypted, null);
    assert.equal(await loadPublicKit(user.handle, new Date(NOW)), null);
    assert.equal((await readGraphSnapshot(user.id))?.user.disconnected_at, NOW);
  });

  it("hides and restores via media.hidden_from_kit_at without a KV overlay", async () => {
    const session = parseSessionValue(DEMO_HANDLE);
    assert.ok(session);
    const top = seedMedia[0]!;
    const sql = createMemorySqlStore({
      users: [
        {
          id: DEMO_USER_ID,
          ig_user_id: "demo-ig-user",
          handle: DEMO_HANDLE,
          name: "Demo Creator",
          avatar_r2_key: null,
          followers: 10_000,
          media_count: 6,
          token_encrypted: null,
          refresh_encrypted: null,
          token_expires_at: null,
          connected_at: NOW,
          disconnected_at: null,
          consent_index: false,
          ig_account_type: "BUSINESS",
          disclosure_version: 1,
        },
      ],
      media: seedMedia,
    });
    setSqlStoreForTests(sql);
    setHasHyperdriveForTests(true);

    const hidden = await hideFromKit({
      session,
      mediaId: top.id,
      overlay: null,
      now: new Date(HIDDEN_AT),
    });
    assert.equal(hidden.ok, true);
    if (!hidden.ok) {
      return;
    }
    assert.equal(hidden.hiddenFromKitAt, HIDDEN_AT);
    assert.equal((await sql.findMediaById(top.id))?.hidden_from_kit_at, HIDDEN_AT);

    const again = await hideFromKit({
      session,
      mediaId: top.id,
      overlay: hidden.overlay,
      now: new Date("2026-09-19T00:00:00.000Z"),
    });
    assert.equal(again.ok, true);
    if (!again.ok) {
      return;
    }
    assert.equal(again.hiddenFromKitAt, HIDDEN_AT);

    const restored = await restoreToKit({ session, mediaId: top.id, overlay: again.overlay });
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }
    assert.equal(restored.hiddenFromKitAt, null);
    assert.equal((await sql.findMediaById(top.id))?.hidden_from_kit_at, null);
  });

  it("falls back to KV when Hyperdrive SQL upsert fails", async () => {
    const user = liveUser();
    const media = seedMedia.map((row) => ({ ...row, user_id: user.id }));
    const sql = createMemorySqlStore();
    const failing: SqlStore = {
      ...sql,
      async upsertUser() {
        return false;
      },
    };
    setSqlStoreForTests(failing);
    setHasHyperdriveForTests(true);
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());

    assert.equal(
      await writeGraphSnapshot({
        user,
        media,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );
    assert.equal(await sql.findUserById(user.id), null);
    const stored = await readGraphSnapshot(user.id);
    assert.ok(stored);
    assert.equal(stored.user.handle, user.handle);
    assert.equal(stored.user.token_encrypted, "enc-token");
  });

  it("falls back to KV when Hyperdrive is bound but the SQL store is missing", async () => {
    const user = liveUser();
    setHasHyperdriveForTests(true);
    setSqlStoreForTests(null);
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());

    assert.equal(
      await writeGraphSnapshot({
        user,
        media: [],
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );
    const stored = await readGraphSnapshot(user.id);
    assert.equal(stored?.user.handle, user.handle);
  });

  it("persists via KV when Hyperdrive is unbound", async () => {
    const user = liveUser();
    setHasHyperdriveForTests(false);
    resetSqlStoreForTests();
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    setSecretsForTests({ ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" });

    assert.equal(
      await writeGraphSnapshot({
        user,
        media: [],
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );
    const stored = await readGraphSnapshot(user.id);
    assert.ok(stored);
    assert.equal(stored.user.handle, user.handle);
    assert.deepEqual(await resolveSession(user.handle, "route"), {
      handle: user.handle,
      userId: user.id,
    });
  });

  it("falls back to KV when SQL upsert throws", async () => {
    const user = liveUser();
    const sql = createMemorySqlStore();
    const failing: SqlStore = {
      ...sql,
      async upsertUser() {
        throw new Error("connection reset");
      },
      async replaceUserMedia() {
        throw new Error("connection reset");
      },
    };
    setSqlStoreForTests(failing);
    setHasHyperdriveForTests(true);
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    setSecretsForTests({ ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" });

    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia.map((row) => ({ ...row, user_id: user.id })),
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );
    assert.equal(await sql.findUserById(user.id), null);
    const stored = await readGraphSnapshot(user.id);
    assert.ok(stored);
    assert.equal(stored.user.handle, user.handle);
    assert.deepEqual(await resolveSession(user.handle, "route"), {
      handle: user.handle,
      userId: user.id,
    });
  });

  it("reads the KV snapshot when SQL find-by-handle throws", async () => {
    const user = liveUser();
    setHasHyperdriveForTests(false);
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: [],
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      true,
    );

    const throwing: SqlStore = {
      ...createMemorySqlStore(),
      async findUserByHandle() {
        throw new Error("sql read failed");
      },
      async findUserById() {
        throw new Error("sql read failed");
      },
    };
    setSqlStoreForTests(throwing);
    setHasHyperdriveForTests(true);
    setSecretsForTests({ ...emptySecrets(), IG_APP_ID: "id", IG_APP_SECRET: "secret" });

    const stored = await readGraphSnapshotByHandle(user.handle);
    assert.equal(stored?.user.handle, user.handle);
    assert.deepEqual(await resolveSession(user.handle, "route"), {
      handle: user.handle,
      userId: user.id,
    });
  });

  it("returns false only when SQL is unavailable and KV is missing; hide still fail-closes", async () => {
    setHasHyperdriveForTests(true);
    setSqlStoreForTests(null);
    setHiddenKitNamespaceForTests(null);
    assert.equal(
      await writeGraphSnapshot({
        user: liveUser(),
        media: [],
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW,
      }),
      false,
    );
    const session = parseSessionValue(DEMO_HANDLE);
    assert.deepEqual(await hideFromKit({ session, mediaId: seedMedia[0]!.id, overlay: null }), {
      ok: false,
      status: 500,
      error: "persist_failed",
    });
  });
});
