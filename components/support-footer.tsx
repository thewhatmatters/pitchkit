import { PATTERN_FOOTER_CLASS, PATTERN_FOOTER_NAV_CLASS } from "@/components/pattern-tokens";
import { SUPPORT_EMAIL } from "@/lib/copy";

export function SupportFooter() {
  return (
    <footer className={PATTERN_FOOTER_CLASS}>
      <nav className={PATTERN_FOOTER_NAV_CLASS} aria-label="Site">
        <a className="type-supporting text-muted" href="/privacy">
          Privacy
        </a>
        <a className="type-supporting text-muted" href={`mailto:${SUPPORT_EMAIL}`}>
          Support
        </a>
      </nav>
    </footer>
  );
}
