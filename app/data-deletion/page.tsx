import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { DraftNotice } from "@/components/legal-page";
import { PageTitle } from "@/components/page-card";
import { DeletionSection } from "@/components/privacy-content";
import { SupportFooter } from "@/components/support-footer";

export const metadata: Metadata = {
  title: "Delete your data",
};

/** Meta data deletion instructions URL. Same copy as /privacy#delete. */
export default function DataDeletionPage() {
  return (
    <AppFrame>
      <div className="col-span-full">
        <PageTitle>Delete your data</PageTitle>
      </div>
      <DraftNotice />
      <DeletionSection />
      <SupportFooter />
    </AppFrame>
  );
}
