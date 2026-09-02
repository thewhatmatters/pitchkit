import type { Metadata } from "next";
import { Card, cardBodyTextClasses, cardTitleClasses } from "@whatmatters/wmds";
import { SupportFooter } from "@/components/support-footer";
import { DISCLOSURE } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <Card variant="outlined" shape="rounded" padding="none">
        <Card.Header>
          <h1 className={cardTitleClasses}>Privacy</h1>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col gap-4 p-3">
            <p className={cardBodyTextClasses}>{DISCLOSURE}</p>
            <p className={cardBodyTextClasses}>
              Scopes: instagram_business_basic and instagram_business_manage_insights.
              Public kit images are already public posts. Tokens are encrypted at rest.
              Brands see the kit card only — never Insights.
            </p>
          </div>
        </Card.Body>
      </Card>
      <SupportFooter />
    </main>
  );
}
