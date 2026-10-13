import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { DraftNotice } from "@/components/legal-page";
import { PageTitle } from "@/components/page-card";
import { PrivacyContent } from "@/components/privacy-content";
import { SupportFooter } from "@/components/support-footer";

export const metadata: Metadata = {
  title: "Privacy policy",
};

export default function PrivacyPage() {
  return (
    <AppFrame>
      <div className="col-span-full flex flex-col gap-2">
        <PageTitle>Privacy policy</PageTitle>
      </div>
      <DraftNotice />
      <PrivacyContent />
      <SupportFooter />
    </AppFrame>
  );
}
