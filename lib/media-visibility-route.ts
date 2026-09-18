import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  HIDDEN_COOKIE,
  mediaVisibilityStatus,
  parseHiddenCookie,
  serializeHiddenCookie,
  type MediaVisibilityAction,
} from "@/lib/kit-visibility";
import {
  resolveMediaVisibility,
  type MediaVisibilityFailure,
} from "@/lib/media-visibility";
import { loadMediaCatalog } from "@/lib/store";
import { resolveSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export { resolveMediaVisibility } from "@/lib/media-visibility";

export async function mediaVisibilityPost(
  request: Request,
  action: MediaVisibilityAction,
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const session = await resolveSession(cookieStore.get(SESSION_COOKIE)?.value, "route");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_body" } satisfies MediaVisibilityFailure,
      { status: mediaVisibilityStatus("invalid_body") },
    );
  }

  const overlay = parseHiddenCookie(cookieStore.get(HIDDEN_COOKIE)?.value);
  const catalog = session ? await loadMediaCatalog(session.userId, "route") : [];
  const resolved = resolveMediaVisibility({ action, session, body, overlay, catalog });
  if (!resolved.ok) {
    return NextResponse.json(resolved.body, { status: resolved.status });
  }

  try {
    cookieStore.set(HIDDEN_COOKIE, serializeHiddenCookie(resolved.overlay), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  } catch {
    return NextResponse.json(
      { error: "persist_failed" } satisfies MediaVisibilityFailure,
      { status: mediaVisibilityStatus("persist_failed") },
    );
  }

  return NextResponse.json(resolved.body);
}
