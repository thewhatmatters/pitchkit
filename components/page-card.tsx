"use client";

import type { ReactNode } from "react";
import { Button, Card, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";

export function PageCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card variant="outlined" shape="rounded" padding="none">
      <Card.Header>
        <h1 className={cardTitleClasses}>{title}</h1>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-4 p-3">
          {typeof children === "string" ? (
            <p className={cardBodyTextClasses}>{children}</p>
          ) : (
            children
          )}
        </div>
      </Card.Body>
      {footer ? <Card.Footer>{footer}</Card.Footer> : null}
    </Card>
  );
}

export function PageCopy({ children }: { children: ReactNode }) {
  return <p className={cardBodyTextClasses}>{children}</p>;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className={cardTitleClasses}>{children}</h1>;
}

export function PageButton({
  children,
  role = "secondary",
}: {
  children: ReactNode;
  role?: "primary" | "secondary" | "ghost" | "destructive";
}) {
  return (
    <Button type="submit" role={role}>
      {children}
    </Button>
  );
}
