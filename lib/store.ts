import { assemblePublicKit, type PublicKit } from "./kit";
import { applyOverlayToMedia, mediaVisibleOnKit, type HiddenOverlay } from "./kit-visibility";
import type { Detection, WeeklyCount } from "./schema";
import {
  seedDetections,
  seedMedia,
  seedOwnerMedia,
  seedReachSeries,
  seedUsers,
  seedWeeklyCounts,
} from "./seed";

/**
 * Until Hyperdrive exists, /k/[handle] and /insights read the in-repo seed.
 * Same User / Media types as the live Neon path. TOKEN_KEY is not required.
 * Public kit: no Insights (`reach_series` omitted). Owner kit: seed/example series.
 * Hide overlay (httpOnly until Hyperdrive) stamps `hidden_from_kit_at`.
 */
export function hasHyperdrive(): boolean {
  return false;
}

export function loadPublicKit(
  handle: string,
  now: Date = new Date(),
  overlay: HiddenOverlay = {},
): PublicKit | null {
  const user = seedUsers.find((row) => row.handle === handle);
  if (!user) {
    return null;
  }

  const media = mediaVisibleOnKit(
    applyOverlayToMedia(
      seedMedia.filter((row) => row.user_id === user.id),
      overlay,
    ),
  );
  return assemblePublicKit(user, media, now);
}

/**
 * Owner Insights for the session handle.
 * Demo seed includes example Insights + `reach_series` (not live Graph).
 * Hidden rows stay in the payload so Undo can restore — do not filter here.
 */
export function loadOwnerKit(
  handle: string,
  now: Date = new Date(),
  overlay: HiddenOverlay = {},
): PublicKit | null {
  const user = seedUsers.find((row) => row.handle === handle);
  if (!user) {
    return null;
  }

  const media = applyOverlayToMedia(
    seedOwnerMedia.filter((row) => row.user_id === user.id),
    overlay,
  );
  return assemblePublicKit(user, media, now, { reach_series: seedReachSeries });
}

export function loadDetections(): Detection[] {
  return seedDetections;
}

export function loadWeeklyCounts(): WeeklyCount[] {
  return seedWeeklyCounts;
}
