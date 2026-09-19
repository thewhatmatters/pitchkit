import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/account-settings";
import { HIDDEN_COOKIE, parseHiddenOverlay } from "@/lib/hidden-kit";
import { insightsGate, resolveSession, SESSION_COOKIE } from "@/lib/session";
import { hiddenOverlayForHandle, loadOwnerKit } from "@/lib/store";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = await resolveSession(cookieStore.get(SESSION_COOKIE)?.value, "page");
  if (!insightsGate(session)) {
    redirect("/");
  }

  const overlay = await hiddenOverlayForHandle(
    session.handle,
    parseHiddenOverlay(cookieStore.get(HIDDEN_COOKIE)?.value),
  );
  const kit = await loadOwnerKit(session.handle, new Date(), overlay);
  if (!kit) {
    redirect("/");
  }

  return <AccountSettings user={kit.user} posts={kit.posts} />;
}
