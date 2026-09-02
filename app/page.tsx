import { ConnectButton } from "@/components/connect-button";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { DISCLOSURE, PERSONAL_FAIL, PROFESSIONAL_NOTE, STUB_CONNECT } from "@/lib/copy";

type LandingProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LandingPage({ searchParams }: LandingProps) {
  const { error } = await searchParams;
  const personalFail = error === "personal";

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
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
        <PageCopy>{STUB_CONNECT}</PageCopy>
      </PageCard>
      <SupportFooter />
    </main>
  );
}
