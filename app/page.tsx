import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ConnectButton } from "@/components/connect-button";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { DEMO_SESSION_NOTE, DISCLOSURE, landingErrorCopy, PROFESSIONAL_NOTE } from "@/lib/copy";
import { hasLiveAuthSecrets, readSecrets } from "@/lib/env";
import { insightsGate, resolveSession, SESSION_COOKIE } from "@/lib/session";

type LandingProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LandingPage({ searchParams }: LandingProps) {
  const cookieStore = await cookies();
  const session = await resolveSession(cookieStore.get(SESSION_COOKIE)?.value, "page");
  if (insightsGate(session)) {
    redirect("/insights");
  }

  const { error } = await searchParams;
  const failCopy = landingErrorCopy(error);
  const showDemoNote = !hasLiveAuthSecrets(await readSecrets("page"));

  return (
    <AppFrame>
      <PageCard title="Pitchkit">
        <PageCopy>
          Sign in with Instagram, see your numbers, and send brands a link.
        </PageCopy>
        <PageCopy>{DISCLOSURE}</PageCopy>
        {failCopy ? (
          <PageCopy>
            <span role="alert">{failCopy}</span>
          </PageCopy>
        ) : (
          <PageCopy>{PROFESSIONAL_NOTE}</PageCopy>
        )}
        <form action="/auth/instagram" method="post">
          <ConnectButton />
        </form>
        {showDemoNote ? <PageCopy>{DEMO_SESSION_NOTE}</PageCopy> : null}
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
