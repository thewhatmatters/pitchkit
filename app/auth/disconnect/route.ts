import { disconnectOwner } from "@/lib/session";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return disconnectOwner(request);
}

export function POST(request: Request) {
  return disconnectOwner(request);
}
