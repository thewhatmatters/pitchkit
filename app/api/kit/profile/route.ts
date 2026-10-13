import { persistOwnerKitProfile } from "@/lib/graph-store";
import {
  KIT_PROFILE_STATUS,
  parseKitProfileBody,
  type KitProfileError,
} from "@/lib/kit-profile";
import { resolveSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

function cookieValue(request: Request, name: string): string | undefined {
  const raw = request.headers.get("cookie");
  if (!raw) {
    return undefined;
  }
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}

function errorResponse(error: KitProfileError): Response {
  return Response.json(
    { error },
    { status: KIT_PROFILE_STATUS[error], headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const session = await resolveSession(cookieValue(request, SESSION_COOKIE), "route");
  if (!session) {
    return errorResponse("unauthenticated");
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_body");
  }

  const parsed = parseKitProfileBody(body);
  if (!parsed.ok) {
    return errorResponse(parsed.error);
  }

  const persisted = await persistOwnerKitProfile(session, parsed.profile, "route");
  if (!persisted) {
    return errorResponse("persist_failed");
  }

  return Response.json(parsed.profile, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
