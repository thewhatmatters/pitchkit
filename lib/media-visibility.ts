import {
  hideInOverlay,
  mediaVisibilityStatus,
  parseMediaIdBody,
  restoreInOverlay,
  type HiddenOverlay,
  type MediaVisibilityAction,
  type MediaVisibilityError,
  type MediaVisibilitySuccess,
} from "@/lib/kit-visibility";
import { seedMedia } from "@/lib/seed";
import { insightsGate, type Session } from "@/lib/session";

export type MediaVisibilityFailure = {
  error: MediaVisibilityError;
};

export type ResolveMediaVisibilityInput = {
  action: MediaVisibilityAction;
  session: Session | null;
  body: unknown;
  overlay: HiddenOverlay;
  now?: Date;
};

export type ResolveMediaVisibilityResult =
  | { ok: true; status: 200; body: MediaVisibilitySuccess; overlay: HiddenOverlay }
  | { ok: false; status: number; body: MediaVisibilityFailure };

function fail(error: MediaVisibilityError): ResolveMediaVisibilityResult {
  return { ok: false, status: mediaVisibilityStatus(error), body: { error } };
}

/**
 * Seed / Hyperdrive-ready hide+restore. Idempotent.
 * Until Hyperdrive exists the caller persists `overlay` as an httpOnly cookie.
 */
export function resolveMediaVisibility(input: ResolveMediaVisibilityInput): ResolveMediaVisibilityResult {
  const { action, session, body, overlay, now = new Date() } = input;

  if (!insightsGate(session)) {
    return fail("unauthenticated");
  }

  const mediaId = parseMediaIdBody(body);
  if (!mediaId) {
    return fail("invalid_body");
  }

  const media = seedMedia.find((row) => row.id === mediaId);
  if (!media) {
    return fail("not_found");
  }
  if (media.user_id !== session.userId) {
    return fail("forbidden");
  }

  if (action === "hide") {
    const hiddenFromKitAt = overlay[mediaId] ?? now.toISOString();
    const next = hideInOverlay(overlay, mediaId, hiddenFromKitAt);
    return {
      ok: true,
      status: 200,
      body: { mediaId, hiddenFromKitAt: next[mediaId] ?? hiddenFromKitAt },
      overlay: next,
    };
  }

  const next = restoreInOverlay(overlay, mediaId);
  return {
    ok: true,
    status: 200,
    body: { mediaId, hiddenFromKitAt: null },
    overlay: next,
  };
}
