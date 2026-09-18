import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { resetHyperdriveForTests, setHasHyperdriveForTests } from "./hyperdrive";
import type { SqlExecutor, SqlQueryRow } from "./postgres";
import { asQueryRows, POSTGRES_CLIENT } from "./postgres";
import type { Media, User } from "./schema";
import {
  DISCONNECT_USER_SQL,
  HIDE_MEDIA_SQL,
  RESTORE_MEDIA_SQL,
  UPSERT_MEDIA_SQL,
  UPSERT_USER_SQL,
  createMemorySqlStore,
  createSqlStore,
  isUuid,
  resetSqlStoreForTests,
  resolveSqlStore,
  setSqlStoreForTests,
  sqlOwnsUser,
} from "./sql-store";
import { DEMO_USER_ID, seedMedia, seedUser } from "./seed";

const NOW = "2026-09-18T22:00:00.000Z";

afterEach(() => {
  resetSqlStoreForTests();
  resetHyperdriveForTests();
});

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

function recordingExecutor(handler: (text: string, values: readonly unknown[]) => SqlQueryRow[]) {
  const queries: { text: string; values: readonly unknown[] }[] = [];
  const executor: SqlExecutor = {
    async query<T extends SqlQueryRow = SqlQueryRow>(text, values = []) {
      queries.push({ text, values });
      assert.match(text, /\$1|IF NOT EXISTS/i);
      assert.equal(text.includes("${"), false);
      return asQueryRows<T>(handler(text, values));
    },
  };
  return { executor, queries };
}

describe("SQL store contract", () => {
  it("documents postgres.js and stays off without a Hyperdrive inject", async () => {
    assert.equal(POSTGRES_CLIENT, "postgres.js");
    assert.equal(await resolveSqlStore(), null);
    assert.equal(await sqlOwnsUser(DEMO_USER_ID), false);
  });

  it("upserts users/media, hides/restores, and disconnects through a memory store", async () => {
    const user = liveUser();
    const row = seedMedia[0]!;
    const media: Media = { ...row, user_id: user.id };
    const store = createMemorySqlStore();

    assert.equal(await store.upsertUser(user), true);
    assert.deepEqual(await store.findUserByHandle(user.handle), user);
    assert.deepEqual(await store.findUserByIgUserId(user.ig_user_id), user);
    assert.equal((await store.listHandles()).includes(user.handle), true);

    assert.equal(await store.replaceUserMedia(user.id, [media]), true);
    assert.equal((await store.listMediaByUserId(user.id)).length, 1);

    const hidden = await store.setHiddenFromKitAt(media.id, NOW);
    assert.equal(hidden, NOW);
    assert.equal(await store.setHiddenFromKitAt(media.id, "2026-09-19T00:00:00.000Z"), NOW);
    assert.equal((await store.findMediaById(media.id))?.hidden_from_kit_at, NOW);
    assert.equal(await store.setHiddenFromKitAt(media.id, null), null);

    assert.equal(await store.disconnectUser(user.id, NOW), true);
    const disconnected = await store.findUserById(user.id);
    assert.equal(disconnected?.disconnected_at, NOW);
    assert.equal(disconnected?.token_encrypted, null);
    assert.equal(disconnected?.refresh_encrypted, null);
    assert.equal(disconnected?.token_expires_at, null);
    assert.equal((await store.listHandles()).includes(user.handle), false);
  });

  it("emits parameterized SQL and never interpolates identifiers into the text", async () => {
    const user = liveUser();
    const media = { ...seedMedia[0]!, user_id: user.id };
    const { executor, queries } = recordingExecutor((text, values) => {
      if (text === HIDE_MEDIA_SQL) {
        return [{ hidden_from_kit_at: values[0] }];
      }
      if (text === RESTORE_MEDIA_SQL) {
        return [{ hidden_from_kit_at: null }];
      }
      if (text === DISCONNECT_USER_SQL) {
        return [{ id: values[1] }];
      }
      return [];
    });

    const store = createSqlStore(executor);
    assert.equal(await store.upsertUser(user), true);
    assert.equal(queries[0]?.text, UPSERT_USER_SQL);
    assert.equal(queries[0]?.values[2], user.handle);
    assert.equal(queries[0]?.text.includes(user.handle), false);

    assert.equal(await store.replaceUserMedia(user.id, [media]), true);
    assert.equal(
      queries.some((row) => row.text === UPSERT_MEDIA_SQL),
      true,
    );

    const hidden = await store.setHiddenFromKitAt(media.id, NOW);
    assert.equal(hidden, NOW);
    const hide = queries.find((row) => row.text === HIDE_MEDIA_SQL);
    assert.deepEqual(hide?.values, [NOW, media.id]);

    assert.equal(await store.setHiddenFromKitAt(media.id, null), null);
    const restore = queries.find((row) => row.text === RESTORE_MEDIA_SQL);
    assert.deepEqual(restore?.values, [media.id]);

    assert.equal(await store.disconnectUser(user.id, NOW), true);
    const disconnect = queries.find((row) => row.text === DISCONNECT_USER_SQL);
    assert.deepEqual(disconnect?.values, [NOW, user.id]);
  });

  it("resolveSqlStore uses the injected store and sqlOwnsUser is explicit", async () => {
    const store = createMemorySqlStore({ users: [seedUser], media: seedMedia });
    setSqlStoreForTests(store);
    setHasHyperdriveForTests(true);
    assert.equal(await resolveSqlStore(), store);
    assert.equal(await sqlOwnsUser(DEMO_USER_ID), true);
    assert.equal(await sqlOwnsUser("missing"), false);
    assert.equal(isUuid(DEMO_USER_ID), true);
    assert.equal(isUuid("igm-fresh"), false);
  });
});
