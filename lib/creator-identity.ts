/**
 * Graph / seed identity for Pattern — creator identity.
 * Stories: `examples-pitchkit--creator-identity-public`,
 * `examples-pitchkit--creator-identity-owner-settings`.
 * Fail closed: hide display name when missing; never invent bio.
 */

import { sourcedText } from "./inventory";
import { publicObjectUrl } from "./r2";
import type { User } from "./schema";

export const PROFESSIONAL_ACCOUNT_LABELS = ["Business", "Creator"] as const;

export type ProfessionalAccountLabel = (typeof PROFESSIONAL_ACCOUNT_LABELS)[number];

/**
 * Unlocked Graph / derived identity — omit `displayName`, `profilePictureUrl`,
 * and `followersCount` when the snapshot does not have them.
 */
export type CreatorIdentity = {
  /** Graph `name` — hide the heading when missing; never invent. */
  displayName?: string;
  /** Frozen handle without `@` — display as `@handle`, share as `/k/[handle]`. */
  handle: string;
  /** Graph `profile_picture_url` / R2 avatar — omit when missing (Avatar fallback). */
  profilePictureUrl?: string;
  /** Graph `followers_count` — context on the strip, not a hero Stat. */
  followersCount?: number;
  /** Owner: Business / Creator. Optional on the public nameplate. */
  professionalAccount?: ProfessionalAccountLabel;
  /** Owner Settings connection state. */
  connected?: boolean;
  lastSyncedLabel?: string;
};

export function professionalAccountLabel(
  accountType: string | null | undefined,
): ProfessionalAccountLabel | undefined {
  const normalized = (accountType ?? "").toLowerCase().replaceAll("_", "").replaceAll(" ", "");
  if (normalized === "business") {
    return "Business";
  }
  if (normalized === "mediacreator" || normalized === "creator") {
    return "Creator";
  }
  return undefined;
}

/** `Sep 2 at 12:00 PM` — UTC, from a stored stamp. Not Date.now(). */
export function formatLastSyncedLabel(iso: string | null | undefined): string | undefined {
  const stamp = sourcedText(iso);
  if (!stamp) {
    return undefined;
  }
  const date = new Date(stamp);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  const month = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const hour12 = hours % 12 || 12;
  const suffix = hours < 12 ? "AM" : "PM";
  return `${month} ${day} at ${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function creatorIdentityFromUser(
  user: User,
  options: { lastSyncedAt?: string | null } = {},
): CreatorIdentity {
  const displayName = sourcedText(user.name);
  const profilePictureUrl = sourcedText(publicObjectUrl(user.avatar_r2_key));
  const lastSyncedLabel = formatLastSyncedLabel(options.lastSyncedAt ?? user.connected_at);
  const professionalAccount = professionalAccountLabel(user.ig_account_type);

  return {
    ...(displayName ? { displayName } : {}),
    handle: user.handle,
    ...(profilePictureUrl ? { profilePictureUrl } : {}),
    ...(Number.isFinite(user.followers) ? { followersCount: user.followers } : {}),
    ...(professionalAccount ? { professionalAccount } : {}),
    connected: user.disconnected_at == null,
    ...(lastSyncedLabel ? { lastSyncedLabel } : {}),
  };
}
