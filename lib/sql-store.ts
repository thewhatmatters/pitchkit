/**
 * users / media CRUD against DATA.md columns.
 * Parameterized SQL only. No ORM.
 * Used when a Hyperdrive (or local) connection string is present.
 */

import type { HiddenKitAccess } from "./hidden-kit-kv";
import { readHyperdriveBinding, resolveHasHyperdrive } from "./hyperdrive";
import { createPostgresExecutor, type SqlExecutor, type SqlQueryRow } from "./postgres";
import type { Media, MediaType, User } from "./schema";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export type SqlStore = {
  upsertUser(user: User): Promise<boolean>;
  findUserById(id: string): Promise<User | null>;
  findUserByHandle(handle: string): Promise<User | null>;
  findUserByIgUserId(igUserId: string): Promise<User | null>;
  listHandles(): Promise<string[]>;
  replaceUserMedia(userId: string, media: Media[]): Promise<boolean>;
  listMediaByUserId(userId: string): Promise<Media[]>;
  findMediaById(id: string): Promise<Media | null>;
  /** Hide: first timestamp wins. Restore: `at` is null. `false` = write failed. */
  setHiddenFromKitAt(mediaId: string, at: string | null): Promise<string | null | false>;
  disconnectUser(userId: string, at: string): Promise<boolean>;
};

let injectedStore: SqlStore | null | undefined;

export function setSqlStoreForTests(store: SqlStore | null | undefined): void {
  injectedStore = store;
}

export function resetSqlStoreForTests(): void {
  injectedStore = undefined;
}

function iso(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return null;
}

function isoRequired(value: unknown, fallback: string): string {
  return iso(value) ?? fallback;
}

function int(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function nullableInt(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  return int(value);
}

function bool(value: unknown): boolean {
  return value === true || value === "t" || value === "true";
}

function mediaType(value: unknown): MediaType {
  if (value === "VIDEO" || value === "CAROUSEL") {
    return value;
  }
  return "IMAGE";
}

function mapUser(row: SqlQueryRow): User {
  return {
    id: String(row.id),
    ig_user_id: String(row.ig_user_id),
    handle: String(row.handle),
    name: String(row.name),
    avatar_r2_key: row.avatar_r2_key == null ? null : String(row.avatar_r2_key),
    followers: int(row.followers),
    media_count: int(row.media_count),
    token_encrypted: row.token_encrypted == null ? null : String(row.token_encrypted),
    refresh_encrypted: row.refresh_encrypted == null ? null : String(row.refresh_encrypted),
    token_expires_at: iso(row.token_expires_at),
    connected_at: isoRequired(row.connected_at, new Date(0).toISOString()),
    disconnected_at: iso(row.disconnected_at),
    consent_index: bool(row.consent_index),
    ig_account_type: row.ig_account_type == null ? null : String(row.ig_account_type),
    disclosure_version: int(row.disclosure_version, 1),
  };
}

function mapMedia(row: SqlQueryRow): Media {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    ig_media_id: String(row.ig_media_id),
    permalink: String(row.permalink),
    posted_at: isoRequired(row.posted_at, new Date(0).toISOString()),
    media_type: mediaType(row.media_type),
    product_type: row.product_type == null ? null : String(row.product_type),
    caption: row.caption == null ? null : String(row.caption),
    r2_key: String(row.r2_key ?? ""),
    like_count: int(row.like_count),
    comments_count: int(row.comments_count),
    reach: nullableInt(row.reach),
    saves: nullableInt(row.saves),
    shares: nullableInt(row.shares),
    impressions: nullableInt(row.impressions),
    fetched_at: isoRequired(row.fetched_at, new Date(0).toISOString()),
    insights_fetched_at: iso(row.insights_fetched_at),
    hidden_from_kit_at: iso(row.hidden_from_kit_at),
  };
}

export const UPSERT_USER_SQL = `
INSERT INTO users (
  id, ig_user_id, handle, name, avatar_r2_key, followers, media_count,
  token_encrypted, refresh_encrypted, token_expires_at,
  connected_at, disconnected_at, consent_index, ig_account_type, disclosure_version
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
)
ON CONFLICT (id) DO UPDATE SET
  ig_user_id = EXCLUDED.ig_user_id,
  handle = EXCLUDED.handle,
  name = EXCLUDED.name,
  avatar_r2_key = EXCLUDED.avatar_r2_key,
  followers = EXCLUDED.followers,
  media_count = EXCLUDED.media_count,
  token_encrypted = EXCLUDED.token_encrypted,
  refresh_encrypted = EXCLUDED.refresh_encrypted,
  token_expires_at = EXCLUDED.token_expires_at,
  disconnected_at = EXCLUDED.disconnected_at,
  consent_index = EXCLUDED.consent_index,
  ig_account_type = EXCLUDED.ig_account_type,
  disclosure_version = EXCLUDED.disclosure_version
`.trim();

export const SELECT_USER_BY_ID_SQL = `SELECT * FROM users WHERE id = $1 LIMIT 1`;
export const SELECT_USER_BY_HANDLE_SQL = `SELECT * FROM users WHERE handle = $1 LIMIT 1`;
export const SELECT_USER_BY_IG_SQL = `SELECT * FROM users WHERE ig_user_id = $1 LIMIT 1`;
export const SELECT_HANDLES_SQL = `SELECT handle FROM users WHERE disconnected_at IS NULL`;
export const SELECT_MEDIA_BY_USER_SQL = `SELECT * FROM media WHERE user_id = $1`;
export const SELECT_MEDIA_BY_ID_SQL = `SELECT * FROM media WHERE id = $1 LIMIT 1`;
export const SELECT_MEDIA_KEYS_SQL = `SELECT id, ig_media_id, hidden_from_kit_at FROM media WHERE user_id = $1`;

export const UPSERT_MEDIA_SQL = `
INSERT INTO media (
  id, user_id, ig_media_id, permalink, posted_at, media_type, product_type,
  caption, r2_key, like_count, comments_count, reach, saves, shares, impressions,
  fetched_at, insights_fetched_at, hidden_from_kit_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
)
ON CONFLICT (ig_media_id) DO UPDATE SET
  permalink = EXCLUDED.permalink,
  posted_at = EXCLUDED.posted_at,
  media_type = EXCLUDED.media_type,
  product_type = EXCLUDED.product_type,
  caption = EXCLUDED.caption,
  r2_key = EXCLUDED.r2_key,
  like_count = EXCLUDED.like_count,
  comments_count = EXCLUDED.comments_count,
  reach = EXCLUDED.reach,
  saves = EXCLUDED.saves,
  shares = EXCLUDED.shares,
  impressions = EXCLUDED.impressions,
  fetched_at = EXCLUDED.fetched_at,
  insights_fetched_at = EXCLUDED.insights_fetched_at,
  hidden_from_kit_at = media.hidden_from_kit_at
`.trim();

export const DELETE_STALE_MEDIA_SQL = `
DELETE FROM media
WHERE user_id = $1
  AND NOT (ig_media_id = ANY($2::text[]))
`.trim();

export const HIDE_MEDIA_SQL = `
UPDATE media
SET hidden_from_kit_at = COALESCE(hidden_from_kit_at, $1::timestamptz)
WHERE id = $2
RETURNING hidden_from_kit_at
`.trim();

export const RESTORE_MEDIA_SQL = `
UPDATE media
SET hidden_from_kit_at = NULL
WHERE id = $1
RETURNING hidden_from_kit_at
`.trim();

export const DISCONNECT_USER_SQL = `
UPDATE users
SET disconnected_at = $1::timestamptz,
    token_encrypted = NULL,
    refresh_encrypted = NULL,
    token_expires_at = NULL
WHERE id = $2
RETURNING id
`.trim();

function userValues(user: User): unknown[] {
  return [
    user.id,
    user.ig_user_id,
    user.handle,
    user.name,
    user.avatar_r2_key,
    user.followers,
    user.media_count,
    user.token_encrypted,
    user.refresh_encrypted,
    user.token_expires_at,
    user.connected_at,
    user.disconnected_at,
    user.consent_index,
    user.ig_account_type,
    user.disclosure_version,
  ];
}

function mediaValues(row: Media, id: string): unknown[] {
  return [
    id,
    row.user_id,
    row.ig_media_id,
    row.permalink,
    row.posted_at,
    row.media_type,
    row.product_type,
    row.caption,
    row.r2_key,
    row.like_count,
    row.comments_count,
    row.reach,
    row.saves,
    row.shares,
    row.impressions,
    row.fetched_at,
    row.insights_fetched_at,
    row.hidden_from_kit_at,
  ];
}

export function createSqlStore(executor: SqlExecutor): SqlStore {
  return {
    async upsertUser(user) {
      try {
        await executor.query(UPSERT_USER_SQL, userValues(user));
        return true;
      } catch {
        return false;
      }
    },

    async findUserById(id) {
      const rows = await executor.query(SELECT_USER_BY_ID_SQL, [id]);
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async findUserByHandle(handle) {
      const rows = await executor.query(SELECT_USER_BY_HANDLE_SQL, [handle]);
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async findUserByIgUserId(igUserId) {
      const rows = await executor.query(SELECT_USER_BY_IG_SQL, [igUserId]);
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async listHandles() {
      const rows = await executor.query(SELECT_HANDLES_SQL);
      return rows.map((row) => String(row.handle));
    },

    async replaceUserMedia(userId, media) {
      try {
        const existing = await executor.query(SELECT_MEDIA_KEYS_SQL, [userId]);
        const byIg = new Map(
          existing.map((row) => [String(row.ig_media_id), String(row.id)]),
        );
        const keepIg: string[] = [];
        for (const row of media) {
          const id = byIg.get(row.ig_media_id) ?? (isUuid(row.id) ? row.id : crypto.randomUUID());
          keepIg.push(row.ig_media_id);
          await executor.query(UPSERT_MEDIA_SQL, mediaValues(row, id));
        }
        await executor.query(DELETE_STALE_MEDIA_SQL, [userId, keepIg]);
        return true;
      } catch {
        return false;
      }
    },

    async listMediaByUserId(userId) {
      const rows = await executor.query(SELECT_MEDIA_BY_USER_SQL, [userId]);
      return rows.map(mapMedia);
    },

    async findMediaById(id) {
      const rows = await executor.query(SELECT_MEDIA_BY_ID_SQL, [id]);
      return rows[0] ? mapMedia(rows[0]) : null;
    },

    async setHiddenFromKitAt(mediaId, at) {
      try {
        if (at == null) {
          const rows = await executor.query(RESTORE_MEDIA_SQL, [mediaId]);
          return rows[0] ? iso(rows[0].hidden_from_kit_at) : false;
        }
        const rows = await executor.query(HIDE_MEDIA_SQL, [at, mediaId]);
        return rows[0] ? iso(rows[0].hidden_from_kit_at) : false;
      } catch {
        return false;
      }
    },

    async disconnectUser(userId, at) {
      try {
        const rows = await executor.query(DISCONNECT_USER_SQL, [at, userId]);
        return rows.length > 0;
      } catch {
        return false;
      }
    },
  };
}

/** In-memory SoT for unit tests. Same contract as the Hyperdrive store. */
export function createMemorySqlStore(seed: { users?: User[]; media?: Media[] } = {}): SqlStore {
  const users = new Map<string, User>();
  const media = new Map<string, Media>();

  for (const user of seed.users ?? []) {
    users.set(user.id, { ...user });
  }
  for (const row of seed.media ?? []) {
    media.set(row.id, { ...row });
  }

  return {
    async upsertUser(user) {
      const previous = users.get(user.id);
      users.set(user.id, {
        ...user,
        connected_at: previous?.connected_at ?? user.connected_at,
      });
      return true;
    },

    async findUserById(id) {
      return users.get(id) ?? null;
    },

    async findUserByHandle(handle) {
      return [...users.values()].find((row) => row.handle === handle) ?? null;
    },

    async findUserByIgUserId(igUserId) {
      return [...users.values()].find((row) => row.ig_user_id === igUserId) ?? null;
    },

    async listHandles() {
      return [...users.values()]
        .filter((row) => row.disconnected_at == null)
        .map((row) => row.handle);
    },

    async replaceUserMedia(userId, rows) {
      const existing = [...media.values()].filter((row) => row.user_id === userId);
      const byIg = new Map(existing.map((row) => [row.ig_media_id, row]));
      const keep = new Set<string>();
      for (const row of rows) {
        const previous = byIg.get(row.ig_media_id);
        const id = previous?.id ?? (isUuid(row.id) ? row.id : crypto.randomUUID());
        keep.add(id);
        media.set(id, {
          ...row,
          id,
          hidden_from_kit_at: previous?.hidden_from_kit_at ?? row.hidden_from_kit_at ?? null,
        });
      }
      for (const row of existing) {
        if (!keep.has(row.id)) {
          media.delete(row.id);
        }
      }
      return true;
    },

    async listMediaByUserId(userId) {
      return [...media.values()].filter((row) => row.user_id === userId);
    },

    async findMediaById(id) {
      return media.get(id) ?? null;
    },

    async setHiddenFromKitAt(mediaId, at) {
      const row = media.get(mediaId);
      if (!row) {
        return false;
      }
      if (at == null) {
        media.set(mediaId, { ...row, hidden_from_kit_at: null });
        return null;
      }
      const hiddenFromKitAt = row.hidden_from_kit_at ?? at;
      media.set(mediaId, { ...row, hidden_from_kit_at: hiddenFromKitAt });
      return hiddenFromKitAt;
    },

    async disconnectUser(userId, at) {
      const user = users.get(userId);
      if (!user) {
        return false;
      }
      users.set(userId, {
        ...user,
        disconnected_at: at,
        token_encrypted: null,
        refresh_encrypted: null,
        token_expires_at: null,
      });
      return true;
    },
  };
}

export async function resolveSqlStore(
  access: HiddenKitAccess = "page",
): Promise<SqlStore | null> {
  if (injectedStore !== undefined) {
    return injectedStore;
  }
  if (!(await resolveHasHyperdrive(access))) {
    return null;
  }
  const binding = await readHyperdriveBinding(access);
  if (!binding) {
    return null;
  }
  return createSqlStore(createPostgresExecutor(binding.connectionString));
}

export async function sqlOwnsUser(
  userId: string,
  access: HiddenKitAccess = "page",
): Promise<boolean> {
  const sql = await resolveSqlStore(access);
  if (!sql) {
    return false;
  }
  return (await sql.findUserById(userId)) != null;
}
