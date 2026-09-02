import type { Metadata } from "next";
import { Card, cardBodyTextClasses, cardTitleClasses } from "@whatmatters/wmds";
import { SupportFooter } from "@/components/support-footer";

export const metadata: Metadata = {
  title: "Delete your data",
};

export default function DeletePage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <Card variant="outlined" shape="rounded" padding="none">
        <Card.Header>
          <h1 className={cardTitleClasses}>Delete your data</h1>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col gap-4 p-3">
            <p className={cardBodyTextClasses}>
              Disconnect deletes your kit and the copies we stored. That is the same
              as delete-all: the creator row, fetched posts, and R2 files under your
              user id. The kit URL returns 404. We start immediately and finish within
              24 hours.
            </p>
            <p className={cardBodyTextClasses}>
              Stub — there is no session cookie yet, so this page does not delete
              anything. When login exists, Disconnect on Insights runs this.
            </p>
          </div>
        </Card.Body>
      </Card>
      <SupportFooter />
    </main>
  );
}
