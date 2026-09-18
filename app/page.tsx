import { AppFrame } from "@/components/app-frame";
import { ConnectButton } from "@/components/connect-button";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { DEMO_SESSION_NOTE, DISCLOSURE, PERSONAL_FAIL, PROFESSIONAL_NOTE } from "@/lib/copy";
import { hasLiveAuthSecrets, readSecrets } from "@/lib/env";

type LandingProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LandingPage({ searchParams }: LandingProps) {
  const { error } = await searchParams;
  const personalFail = error === "personal";
  const showDemoNote = !hasLiveAuthSecrets(await readSecrets("page"));

  return (
    <AppFrame>
      <PageCard title="Pitchkit">
        <PageCopy>
          Sign in with Instagram, see your numbers, and send brands a link.
        </PageCopy>
        <PageCopy>{DISCLOSURE}</PageCopy>
        {personalFail ? (
          <PageCopy>
            <span role="alert">{PERSONAL_FAIL}</span>
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
