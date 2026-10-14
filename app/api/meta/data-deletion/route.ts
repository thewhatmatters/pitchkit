import { handleMetaDataDeletion } from "@/lib/meta-deletion";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleMetaDataDeletion(request);
}
