import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";

export const metadata: Metadata = {
  title: "Delete your data",
};

export default function DeletePage() {
  return (
    <AppFrame>
      <PageCard title="Delete your data">
        <PageCopy>
          Disconnect deletes your kit and the copies we stored. That is the same as
          delete-all: the creator row, fetched posts, and R2 files under your user id.
          The kit URL returns 404. We start immediately and finish within 24 hours.
        </PageCopy>
        <PageCopy>
          Disconnect on Insights or Settings is that control: it signs you out,
          stamps the kit disconnected (public URL 404s), and stops Graph polling.
          SQL and R2 file purge still finish within 24 hours when Hyperdrive is bound.
          This page does not delete anything by itself.
        </PageCopy>
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
