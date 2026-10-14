import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";
import { TextLink } from "@/components/wmds";

export const metadata: Metadata = {
  title: "Delete your data",
};

export default function DeletePage() {
  return (
    <AppFrame>
      <PageCard title="Delete your data">
        <PageCopy>
          Open Account settings from your avatar on Insights. At the bottom,
          under Danger zone, choose Delete account.
        </PageCopy>
        <PageCopy>
          We erase your stored profile, posts and their metrics, Insights,
          audience breakdowns, your intro, past brands, hidden&#8209;post settings, your
          Instagram tokens and every Pitchkit sign-in. It happens right away, your
          kit link stops working, and it can&rsquo;t be undone.
        </PageCopy>
        <PageCopy>
          If you sign in again later, you start with an empty kit. Removing
          Pitchkit from your Instagram settings also deletes your data. See{" "}
          <TextLink href="/data-deletion">data deletion</TextLink>
          .
        </PageCopy>
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
