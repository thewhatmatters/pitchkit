import type { ReactNode } from "react";
import { SUPPORT_EMAIL } from "@/lib/copy";

export function SupportFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="flex flex-col gap-2">
      {children}
      <p>
        Support: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </footer>
  );
}
