import { Button, Card, cardBodyTextClasses, cardTitleClasses } from "@whatmatters/wmds";
import { SupportFooter } from "@/components/support-footer";

export default function NotFound() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <Card variant="outlined" shape="rounded" padding="none">
        <Card.Header>
          <h1 className={cardTitleClasses}>Not found</h1>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col gap-4 p-3">
            <p className={cardBodyTextClasses}>
              This kit is missing or disconnected.
            </p>
            <form action="/">
              <Button type="submit" role="secondary">
                Back to Pitchkit
              </Button>
            </form>
          </div>
        </Card.Body>
      </Card>
      <SupportFooter />
    </main>
  );
}
