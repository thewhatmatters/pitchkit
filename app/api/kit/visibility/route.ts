import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  HIDDEN_COOKIE,
  hiddenIdsForHandle,
  hideFromKitStore,
  parseHiddenCookie,
  restoreToKitStore,
  serializeHiddenCookie,
  type KitVisibilityAction,
} from "@/lib/kit-visibility";
import { insightsGate, parseSessionValue, SESSION_COOKIE, SESSION_MAX_AGE, sessionOwnsHandle } from "@/lib/session";

type VisibilityBody = {
  action?: unknown;
  handle?: unknown;
  mediaId?: unknown;
};

function isAction(value: unknown): value is KitVisibilityAction {
  return value === "hide" || value === "restore";
}

/**
 * WHA-311 stub + WHA-312 contract.
 *
 * POST { action: "hide" | "restore", handle, mediaId }
 * Cookie session must own `handle`.
 * Stub persists `pitchkit_hidden` (handle → media ids). Backend swaps this
 * for SQL and keeps the JSON shape.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  if (!insightsGate(session)) {
    return NextResponse.json(
      { ok: false, hiddenIds: [], error: "Sign in to change kit posts." },
      { status: 401 },
    );
  }

  let body: VisibilityBody;
  try {
    body = (await request.json()) as VisibilityBody;
  } catch {
    return NextResponse.json(
      { ok: false, hiddenIds: [], error: "Hide could not be saved." },
      { status: 400 },
    );
  }

  const { action, handle, mediaId } = body;
  if (!isAction(action) || typeof handle !== "string" || typeof mediaId !== "string") {
    return NextResponse.json(
      { ok: false, hiddenIds: [], error: "Hide could not be saved." },
      { status: 400 },
    );
  }

  if (!sessionOwnsHandle(session, handle) || mediaId.length === 0) {
    return NextResponse.json(
      { ok: false, hiddenIds: [], error: "Hide could not be saved." },
      { status: 403 },
    );
  }

  const current = parseHiddenCookie(cookieStore.get(HIDDEN_COOKIE)?.value);
  const next =
    action === "hide"
      ? hideFromKitStore(current, handle, mediaId)
      : restoreToKitStore(current, handle, mediaId);

  cookieStore.set(HIDDEN_COOKIE, serializeHiddenCookie(next), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({
    ok: true,
    hiddenIds: hiddenIdsForHandle(next, handle),
  });
}
