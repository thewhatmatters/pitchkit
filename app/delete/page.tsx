import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { DraftNotice } from "@/components/legal-page";
import { PageTitle } from "@/components/page-card";
import { DeletionSection } from "@/components/privacy-content";
import { SupportFooter } from "@/components/support-footer";

export const metadata: Metadata = {
  title: "Delete your data",
};

/** Legacy /delete — same copy as /data-deletion and /privacy#delete. */
export default function DeletePage() {
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
