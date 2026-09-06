import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/account-settings";
import { OwnerShell } from "@/components/owner-shell";
import { SupportFooter } from "@/components/support-footer";
import { insightsGate, parseSessionValue, SESSION_COOKIE } from "@/lib/session";
import { loadOwnerKit } from "@/lib/store";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  if (!insightsGate(session)) {
    redirect("/");
  }

  const kit = loadOwnerKit(session.handle);
  if (!kit) {
    redirect("/");
  }

  return (
    <OwnerShell handle={kit.user.handle} title="Settings">
      <AccountSettings />
      <SupportFooter />
    </OwnerShell>
  );
}
