import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { SUPPORT_EMAIL } from "@/lib/copy";
import { readDeletionRecord } from "@/lib/meta-deletion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deletion status",
};

function formatDay(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function DeletionStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const params = await searchParams;
  const code = typeof params.code === "string" ? params.code : null;
  const record = await readDeletionRecord(code, "page");

  return (
    <AppFrame>
      <PageCard title="Deletion status">
        {record ? (
          <>
            <PageCopy>Confirmation code: {code}</PageCopy>
            <PageCopy>
              {record.status === "deleted"
                ? `Done. We erased your Pitchkit data on ${formatDay(record.requested_at)}.`
                : `Done. We had no Pitchkit data for this account on ${formatDay(record.requested_at)}.`}
            </PageCopy>
          </>
        ) : (
          <PageCopy>
            We can&rsquo;t find that confirmation code. Check the link from Meta,
            or email {SUPPORT_EMAIL} and we&rsquo;ll help.
          </PageCopy>
        )}
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
