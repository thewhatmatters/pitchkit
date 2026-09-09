import { mediaVisibilityResponse } from "@/lib/hidden-kit";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return mediaVisibilityResponse(request, "hide");
}
