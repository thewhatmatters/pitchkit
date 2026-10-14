import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { SUPPORT_EMAIL } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Data deletion",
};

export default function DataDeletionPage() {
  return (
    <AppFrame>
      <PageCard title="Data deletion">
        <PageCopy>
          There are two ways to delete your Pitchkit data. In Pitchkit, open
          Account settings and choose Delete account. On Instagram, remove
          Pitchkit from your connected apps, and Meta tells us to delete it.
        </PageCopy>
        <PageCopy>
          Either way, we erase everything we stored about you: your profile, posts
          and their metrics, Insights, audience breakdowns, intro, past brands,
          hidden&#8209;post settings, Instagram tokens and sign-ins. Your kit link stops
          working right&nbsp;away.
        </PageCopy>
        <PageCopy>
          When the request comes from Meta, you get a confirmation code and a
          link to check its status. Questions? Email {SUPPORT_EMAIL}.
        </PageCopy>
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
