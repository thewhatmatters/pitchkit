import { stubConnect } from "@/lib/session";

export const dynamic = "force-dynamic";

// WHA-313: live reconnect may offer optional kit URL update when Instagram
// returns a username different from users.handle. Stub stays seed demo.

export function GET(request: Request) {
  return stubConnect(request);
}

export function POST(request: Request) {
  return stubConnect(request);
}
