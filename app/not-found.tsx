import { PageButton, PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";

export default function NotFound() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <PageCard title="Not found">
        <PageCopy>This kit is missing or disconnected.</PageCopy>
        <form action="/">
          <PageButton>Back to Pitchkit</PageButton>
        </form>
      </PageCard>
      <SupportFooter />
    </main>
  );
}
