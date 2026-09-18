"use client";

import { Accordion, Button, Card, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import { DisconnectControl } from "@/components/disconnect-control";

export function AccountSettings() {
  return (
    <Card variant="outlined" shape="rounded" padding="none" className="col-span-full">
      <Card.Header>
        <h2 className={cardTitleClasses}>Account</h2>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-4 p-3">
          <p className={cardBodyTextClasses}>
            Instagram session only. Kit fields are edited on the public kit URL.
          </p>
          <Accordion variant="list" inset>
            <Accordion.Item label="Instagram" defaultOpen>
              <div className="flex flex-col gap-3">
                <form action="/auth/instagram" method="post">
                  <Button type="submit" role="secondary">
                    Reconnect Instagram
                  </Button>
                </form>
                <form action="/auth/sign-out" method="post">
                  <Button type="submit" role="secondary">
                    Sign out
                  </Button>
                </form>
                <DisconnectControl />
              </div>
            </Accordion.Item>
          </Accordion>
        </div>
      </Card.Body>
    </Card>
  );
}
