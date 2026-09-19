/**
 * Owner PitchKit intro / past brands / theme persist.
 * saveKitProfile(profile) → POST /api/kit/profile
 */

import {
  KIT_PROFILE_PATH,
  KIT_PROFILE_STATUS,
  kitProfileErrorMessage,
  normalizeKitProfile,
  type KitProfile,
  type KitProfileError,
} from "./kit-profile";

export type SaveKitProfileResult =
  | { ok: true; profile: KitProfile }
  | { ok: false; error: string; code: KitProfileError };

function isKitProfileError(value: unknown): value is KitProfileError {
  return (
    value === "unauthenticated" ||
    value === "invalid_body" ||
    value === "intro_too_long" ||
    value === "brands_too_many" ||
    value === "persist_failed"
  );
}

const STATUS_ERROR: Record<number, KitProfileError> = {
  401: "unauthenticated",
  400: "invalid_body",
  500: "persist_failed",
};

function errorFromResponse(status: number, payload: unknown): KitProfileError {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const code = (payload as { error?: unknown }).error;
    if (isKitProfileError(code)) {
      return code;
    }
  }
  return STATUS_ERROR[status] ?? "persist_failed";
}

export async function saveKitProfile(profile: KitProfile): Promise<SaveKitProfileResult> {
  try {
    const response = await fetch(KIT_PROFILE_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(profile),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (response.ok) {
      return { ok: true, profile: normalizeKitProfile(payload) };
    }
    const code = errorFromResponse(response.status, payload);
    return { ok: false, code, error: kitProfileErrorMessage(code) };
  } catch {
    return {
      ok: false,
      code: "persist_failed",
      error: kitProfileErrorMessage("persist_failed"),
    };
  }
}

export { KIT_PROFILE_STATUS };
