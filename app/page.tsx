import { Button, Card, cardBodyTextClasses, cardTitleClasses } from "@whatmatters/wmds";
import { Instagram } from "lucide-react";
import { SupportFooter } from "@/components/support-footer";
import { DISCLOSURE, PERSONAL_FAIL, PROFESSIONAL_NOTE, STUB_CONNECT } from "@/lib/copy";

type LandingProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LandingPage({ searchParams }: LandingProps) {
  const { error } = await searchParams;
  const personalFail = error === "personal";

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <Card variant="outlined" shape="rounded" padding="none">
        <Card.Header>
          <h1 className={cardTitleClasses}>Pitchkit</h1>
          <p className={cardBodyTextClasses}>
            Sign in with Instagram, see your numbers, and send brands a link.
          </p>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col gap-4 p-3">
            <p className={cardBodyTextClasses}>{DISCLOSURE}</p>
            {personalFail ? (
              <p className={cardBodyTextClasses} role="alert">
                {PERSONAL_FAIL}
              </p>
            ) : (
              <p className={cardBodyTextClasses}>{PROFESSIONAL_NOTE}</p>
            )}
            <form action="/insights">
              <Button type="submit" icon={<Instagram strokeWidth={2} />}>
                Continue with Instagram
              </Button>
            </form>
            <p className={cardBodyTextClasses}>{STUB_CONNECT}</p>
          </div>
        </Card.Body>
      </Card>
      <SupportFooter />
    </main>
  );
}
