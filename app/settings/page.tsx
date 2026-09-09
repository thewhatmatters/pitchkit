import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/account-settings";
import { AppFrame, OWNER_GRID_MAX } from "@/components/app-frame";
import { SupportFooter } from "@/components/support-footer";
import { HIDDEN_COOKIE, parseHiddenOverlay } from "@/lib/hidden-kit";
import { insightsGate, parseSessionValue, SESSION_COOKIE } from "@/lib/session";
import { hiddenOverlayForHandle, loadOwnerKit } from "@/lib/store";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  if (!insightsGate(session)) {
    redirect("/");
  }

  const overlay = hiddenOverlayForHandle(
    session.handle,
    parseHiddenOverlay(cookieStore.get(HIDDEN_COOKIE)?.value),
  );
  const kit = loadOwnerKit(session.handle, new Date(), overlay);
  if (!kit) {
    redirect("/");
  }

  return (
    <AppFrame gridMax={OWNER_GRID_MAX}>
      <AccountSettings />
      <SupportFooter>
        <p>
          <a href="/insights">Insights</a>
        </p>
      </SupportFooter>
    </AppFrame>
  );
}
