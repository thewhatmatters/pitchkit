import { assemblePublicKit, type PublicKit } from "./kit";
import type { Detection, WeeklyCount } from "./schema";
import { seedDetections, seedMedia, seedUsers, seedWeeklyCounts } from "./seed";

/**
 * Until Hyperdrive exists, /k/[handle] and /insights read the in-repo seed.
 * Same User / Media types as the live Neon path. TOKEN_KEY is not required.
 */
export function hasHyperdrive(): boolean {
  return false;
}

export function loadPublicKit(handle: string, now: Date = new Date()): PublicKit | null {
  const user = seedUsers.find((row) => row.handle === handle);
  if (!user) {
    return null;
  }

  const media = seedMedia.filter((row) => row.user_id === user.id);
  return assemblePublicKit(user, media, now);
}

/** Owner Insights for the session handle. Same seed types until Hyperdrive. */
export function loadOwnerKit(handle: string, now: Date = new Date()): PublicKit | null {
  return loadPublicKit(handle, now);
}

export function loadDetections(): Detection[] {
  return seedDetections;
}

export function loadWeeklyCounts(): WeeklyCount[] {
  return seedWeeklyCounts;
}
