"use client";

import { AppFrame } from "@/components/app-frame";
import { PageButton, PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";

export default function NotFound() {
  return (
    <AppFrame>
      <PageCard title="Not found">
        <PageCopy>This kit is missing or disconnected.</PageCopy>
        <form action="/">
          <PageButton>Back to Pitchkit</PageButton>
        </form>
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
