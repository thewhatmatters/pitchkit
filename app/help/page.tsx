import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { PageCard, PageCopy } from "@/components/page-card";
import { SupportFooter } from "@/components/support-footer";

export const metadata: Metadata = {
  title: "Help",
};

export default function HelpPage() {
  return (
    <AppFrame>
      <PageCard title="Help" reading>
        <PageCopy>
          Pitchkit turns your Instagram Professional account into a media kit brands can trust.
          Sign in with Instagram to create yours.
        </PageCopy>
        <PageCopy>
          Your numbers come straight from Instagram. Brands see only your public kit, never your
          private Insights. New posts show up after you open Insights in Pitchkit. To pull them
          in right away, tap Refresh on Insights.
        </PageCopy>
        <PageCopy>
          To take your kit down, open Settings and choose Delete account under Danger zone. Your
          kit link stops working right away. To fully remove access, also remove Pitchkit under
          Apps and websites in Instagram settings.
        </PageCopy>
      </PageCard>
      <SupportFooter />
    </AppFrame>
  );
}
