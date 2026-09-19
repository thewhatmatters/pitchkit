import { applyHiddenOverlay, mergeHiddenOverlay, type HiddenOverlay } from "./hidden-kit";
import type { HiddenKitAccess } from "./hidden-kit-kv";
import { assemblePublicKit, excludeHiddenFromPublicKit, type PublicKit } from "./kit";
import type { Detection, Media, User, WeeklyCount } from "./schema";
import {
  seedDetections,
  seedMedia,
  seedOwnerMedia,
  seedReachSeries,
  seedUsers,
  seedWeeklyCounts,
  DEMO_HANDLE,
} from "./seed";
import { readSecrets, type PitchkitSecrets } from "./env";
import {
  EMPTY_AUDIENCE,
  readGraphSnapshot,
  readGraphSnapshotByHandle,
  writeGraphSnapshot,
  type AudienceMixes,
  type GraphSnapshot,
} from "./graph-store";
import { encryptTokenIfPossible } from "./token-crypto";
import { pollInsights, resolveAccessToken, shouldPollInsights } from "./poll";
import { hasHyperdrive as hasHyperdriveFlag, resolveHasHyperdrive } from "./hyperdrive";
import { sqlOwnsUser } from "./sql-store";

export { hideFromKit, restoreToKit, HIDDEN_COOKIE, mergeHiddenOverlay } from "./hidden-kit";
export type { HiddenOverlay, HideRestoreResult } from "./hidden-kit";
export { hasHyperdriveFlag as hasHyperdrive, resolveHasHyperdrive };

/**
 * Hyperdrive bound → SQL is preferred SoT for live Graph users + hide/restore.
 * `writeGraphSnapshot` still falls back to KV `graph:` if that SQL write fails.
 * Else /k/[handle] and /insights read the in-repo seed unless a Graph
 * snapshot (OAuth or operator token poll) is present on KV `graph:` keys.
 * Public `/k/demo` stays `lib/seed.ts`.
 * Hide/restore seed SoT: KV `HIDDEN_KIT` (`hidden:<userId>`) until Hyperdrive.
 */

export type LoadKitOptions = {
  refresh?: boolean;
  access?: HiddenKitAccess;
  secrets?: PitchkitSecrets;
  fetch?: typeof fetch;
};

/** KV overlay for the kit owner. Cookie fills only when that KV key is missing. */
export async function hiddenOverlayForHandle(
  handle: string,
  cookie: HiddenOverlay | null = null,
): Promise<HiddenOverlay | null> {
  const user = await findUserByHandle(handle);
  if (!user) {
    return cookie;
  }
  return mergeHiddenOverlay(user.id, cookie);
}

async function findUserByHandle(handle: string): Promise<User | null> {
  const seed = seedUsers.find((row) => row.handle === handle);
  if (seed) {
    return seed;
  }
  const snapshot = await readGraphSnapshotByHandle(handle);
  return snapshot?.user ?? null;
}

async function ownerFromSnapshot(
  snapshot: GraphSnapshot,
  overlay: HiddenOverlay | null,
  now: Date,
  access: HiddenKitAccess = "page",
): Promise<PublicKit | null> {
  const media = (await sqlOwnsUser(snapshot.user.id, access))
    ? snapshot.media
    : applyHiddenOverlay(snapshot.media, overlay, snapshot.user.id);
  const kit = assemblePublicKit(snapshot.user, media, now, {
    reach_series: snapshot.reach_series,
    audience: snapshot.audience,
  });
  if (!kit) {
    return null;
  }
  return { ...kit, posts: media, audience: snapshot.audience ?? EMPTY_AUDIENCE };
}

export async function loadPublicKit(
  handle: string,
  now: Date = new Date(),
  overlay: HiddenOverlay | null = null,
): Promise<PublicKit | null> {
  if (handle === DEMO_HANDLE) {
    const user = seedUsers.find((row) => row.handle === handle);
    if (!user) {
      return null;
    }
    const fetched = seedMedia.filter((row) => row.user_id === user.id);
    const media = applyHiddenOverlay(
      fetched,
      await hiddenOverlayForHandle(handle, overlay),
      user.id,
    );
    return assemblePublicKit(user, excludeHiddenFromPublicKit(media), now);
  }

  const snapshot = await readGraphSnapshotByHandle(handle);
  if (!snapshot) {
    return null;
  }
  const media = (await sqlOwnsUser(snapshot.user.id))
    ? snapshot.media
    : applyHiddenOverlay(
        snapshot.media,
        await hiddenOverlayForHandle(handle, overlay),
        snapshot.user.id,
      );
  return assemblePublicKit(snapshot.user, excludeHiddenFromPublicKit(media), now);
}

/**
 * Owner Insights for the session handle.
 * Demo seed includes example Insights + `reach_series` when no token.
 * Never resolve operator `IG_USER_TOKEN` or a Graph snapshot for seed `demo`.
 * Live OAuth token → poll when stale (>6h) or Refresh; persist snapshot; hide empty.
 * Includes every owner row (hidden posts keep `hidden_from_kit_at`).
 */
export async function loadOwnerKit(
  handle: string,
  now: Date = new Date(),
  overlay: HiddenOverlay | null = null,
  options: LoadKitOptions = {},
): Promise<PublicKit | null> {
  const access = options.access ?? "page";
  const secrets = options.secrets ?? (await readSecrets(access));
  if (handle === DEMO_HANDLE) {
    const seedUser = seedUsers.find((row) => row.handle === handle);
    if (!seedUser) {
      return null;
    }
    const fetched = seedOwnerMedia.filter((row) => row.user_id === seedUser.id);
    const media = (await sqlOwnsUser(seedUser.id, access))
      ? fetched
      : applyHiddenOverlay(fetched, await hiddenOverlayForHandle(handle, overlay), seedUser.id);
    const kit = assemblePublicKit(seedUser, media, now, {
      reach_series: seedReachSeries,
      audience: EMPTY_AUDIENCE,
    });
    if (!kit) {
      return null;
    }
    return { ...kit, posts: media, audience: EMPTY_AUDIENCE };
  }
  const seedUser = seedUsers.find((row) => row.handle === handle);
  const live = seedUser
    ? await readGraphSnapshot(seedUser.id, access)
    : await readGraphSnapshotByHandle(handle, access);
  const existing = live ?? (seedUser
    ? {
        user: seedUser,
        media: seedOwnerMedia.filter((row) => row.user_id === seedUser.id),
        reach_series: seedReachSeries,
        audience: EMPTY_AUDIENCE,
        polled_at: "",
      }
    : null);

  if (!existing && !seedUser) {
    return null;
  }

  const user = existing?.user ?? seedUser!;
  const token = await resolveAccessToken(user, secrets);

  if (
    token &&
    shouldPollInsights({
      token,
      polledAt: live?.polled_at,
      refresh: options.refresh,
      now,
    })
  ) {
    const polled = await pollInsights({
      token,
      secrets,
      now,
      existing: live,
      handle: user.handle,
      userId: user.id,
      fetch: options.fetch,
    });
    if (polled.ok) {
      const tokenEncrypted = await encryptTokenIfPossible(token, secrets.TOKEN_KEY);
      const snapshot: GraphSnapshot = {
        ...polled.snapshot,
        user: {
          ...polled.snapshot.user,
          id: user.id,
          handle: user.handle,
          token_encrypted: tokenEncrypted ?? polled.snapshot.user.token_encrypted,
        },
      };
      await writeGraphSnapshot(snapshot, access);
      const resolvedOverlay = await hiddenOverlayForHandle(handle, overlay);
      return ownerFromSnapshot(snapshot, resolvedOverlay, now, access);
    }
    // Fail soft: last snapshot or seed. Personal is an auth-path concern.
  }

  if (live) {
    const resolvedOverlay = await hiddenOverlayForHandle(handle, overlay);
    return ownerFromSnapshot(live, resolvedOverlay, now, access);
  }

  if (!seedUser) {
    return null;
  }

  const fetched = seedOwnerMedia.filter((row) => row.user_id === seedUser.id);
  const media = (await sqlOwnsUser(seedUser.id, access))
    ? fetched
    : applyHiddenOverlay(fetched, await hiddenOverlayForHandle(handle, overlay), seedUser.id);
  const kit = assemblePublicKit(seedUser, media, now, {
    reach_series: seedReachSeries,
    audience: EMPTY_AUDIENCE,
  });
  if (!kit) {
    return null;
  }

  return { ...kit, posts: media, audience: EMPTY_AUDIENCE };
}

export async function loadMediaCatalog(
  userId: string,
  access: HiddenKitAccess = "route",
): Promise<Media[]> {
  const snapshot = await readGraphSnapshot(userId, access);
  if (snapshot) {
    return snapshot.media;
  }
  return seedMedia.filter((row) => row.user_id === userId);
}

export function loadDetections(): Detection[] {
  return seedDetections;
}

export function loadWeeklyCounts(): WeeklyCount[] {
  return seedWeeklyCounts;
}

export function ownerAudience(kit: PublicKit | null): AudienceMixes {
  return kit?.audience ?? EMPTY_AUDIENCE;
}
