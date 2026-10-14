import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { TextLink } from "@/components/wmds";
import { DISCLOSURE } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <AppFrame>
      <PageCard title="Privacy">
        <PageCopy>{DISCLOSURE}</PageCopy>
        <PageCopy>
          Scopes: instagram_business_basic and instagram_business_manage_insights.
          Public kit images are already public posts. Tokens are encrypted at rest.
          Brands see the kit card only, never Insights.
        </PageCopy>
        <PageCopy>
          Your sign-in cookie holds a random code, not your Instagram username or
          token. The sign-in lasts up to 30 days and ends when you sign out.
        </PageCopy>
        <PageCopy>
          Deleting your account erases everything we stored right away: profile, posts and
          metrics, Insights, audience breakdowns, intro, past brands, hidden&#8209;post
          settings, tokens and sign-ins. Removing Pitchkit on Instagram does the
          same. See{" "}
          <TextLink href="/data-deletion">data deletion</TextLink>
          .
        </PageCopy>
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
