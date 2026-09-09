import { applyHiddenOverlay, mergeHiddenOverlay, type HiddenOverlay } from "./hidden-kit";
import { assemblePublicKit, excludeHiddenFromPublicKit, type PublicKit } from "./kit";
import type { Detection, WeeklyCount } from "./schema";
import {
  seedDetections,
  seedMedia,
  seedOwnerMedia,
  seedReachSeries,
  seedUsers,
  seedWeeklyCounts,
} from "./seed";

export { hideFromKit, restoreToKit, HIDDEN_COOKIE, mergeHiddenOverlay } from "./hidden-kit";
export type { HiddenOverlay, HideRestoreResult } from "./hidden-kit";

/**
 * Until Hyperdrive exists, /k/[handle] and /insights read the in-repo seed.
 * Same User / Media types as the live Neon path. TOKEN_KEY is not required.
 * Public kit: no Insights (`reach_series` omitted). Owner kit: seed/example series.
 * Hide/restore seed SoT: KV `HIDDEN_KIT` (`hidden:<userId>`) until Neon.
 */
export function hasHyperdrive(): boolean {
  return false;
}

/** KV overlay for the kit owner. Cookie fills only when that KV key is missing. */
export async function hiddenOverlayForHandle(
  handle: string,
  cookie: HiddenOverlay | null = null,
): Promise<HiddenOverlay | null> {
  const user = seedUsers.find((row) => row.handle === handle);
  if (!user) {
    return cookie;
  }
  return mergeHiddenOverlay(user.id, cookie);
}

export async function loadPublicKit(
  handle: string,
  now: Date = new Date(),
  overlay: HiddenOverlay | null = null,
): Promise<PublicKit | null> {
  const user = seedUsers.find((row) => row.handle === handle);
  if (!user) {
    return null;
  }

  const fetched = seedMedia.filter((row) => row.user_id === user.id);
  const media = hasHyperdrive()
    ? fetched
    : applyHiddenOverlay(fetched, await hiddenOverlayForHandle(handle, overlay), user.id);
  return assemblePublicKit(user, excludeHiddenFromPublicKit(media), now);
}

/**
 * Owner Insights for the session handle.
 * Demo seed includes example Insights + `reach_series` (not live Graph).
 * Includes every owner row (hidden posts keep `hidden_from_kit_at`).
 */
export async function loadOwnerKit(
  handle: string,
  now: Date = new Date(),
  overlay: HiddenOverlay | null = null,
): Promise<PublicKit | null> {
  const user = seedUsers.find((row) => row.handle === handle);
  if (!user) {
    return null;
  }

  const fetched = seedOwnerMedia.filter((row) => row.user_id === user.id);
  const media = hasHyperdrive()
    ? fetched
    : applyHiddenOverlay(fetched, await hiddenOverlayForHandle(handle, overlay), user.id);
  const kit = assemblePublicKit(user, media, now, { reach_series: seedReachSeries });
  if (!kit) {
    return null;
  }

  return { ...kit, posts: media };
}

export function loadDetections(): Detection[] {
  return seedDetections;
}

export function loadWeeklyCounts(): WeeklyCount[] {
  return seedWeeklyCounts;
}
