import { mediaVisibilityPost } from "@/lib/media-visibility-route";

/** WHA-312: restoreToKit(mediaId) → POST /api/media/restore { mediaId } */
export async function POST(request: Request) {
  return mediaVisibilityPost(request, "restore");
}
