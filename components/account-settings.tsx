"use client";

import { useState } from "react";
import { Accordion, Button, Card, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import { STUB_DISCONNECT } from "@/lib/copy";

export function AccountSettings() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Card variant="outlined" shape="rounded" padding="none">
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
                <Button role="destructive" onClick={() => setNotice(STUB_DISCONNECT)}>
                  Disconnect
                </Button>
              </div>
            </Accordion.Item>
          </Accordion>
          {notice ? <p className={cardBodyTextClasses}>{notice}</p> : null}
        </div>
      </Card.Body>
    </Card>
  );
}
