import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
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
          Brands see the kit card only — never Insights.
        </PageCopy>
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
