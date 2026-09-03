import { SUPPORT_EMAIL } from "@/lib/copy";

export function SupportFooter() {
  return (
    <footer>
      <p>
        Support: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </footer>
  );
}
