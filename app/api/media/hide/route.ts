import { mediaVisibilityPost } from "@/lib/media-visibility-route";

/** WHA-312: hideFromKit(mediaId) → POST /api/media/hide { mediaId } */
export async function POST(request: Request) {
  return mediaVisibilityPost(request, "hide");
}
