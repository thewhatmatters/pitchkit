import { stubConnect } from "@/lib/session";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return stubConnect(request);
}

export function POST(request: Request) {
  return stubConnect(request);
}
