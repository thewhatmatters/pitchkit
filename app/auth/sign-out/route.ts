import { stubSignOut } from "@/lib/session";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return stubSignOut(request);
}

export function POST(request: Request) {
  return stubSignOut(request);
}
