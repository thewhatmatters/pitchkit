import { PATTERN_FOOTER_BAND_CLASS, PATTERN_FOOTER_CLASS } from "@/components/pattern-tokens";
import { TextLink } from "@/components/wmds";

/** Public footer: Privacy and Help only. Never a mailto or a personal address. */
export function SupportFooter() {
  return (
    <div className={PATTERN_FOOTER_BAND_CLASS}>
      <footer className={PATTERN_FOOTER_CLASS}>
        <TextLink href="/privacy">Privacy</TextLink>
        <TextLink href="/help">Help</TextLink>
      </footer>
    </div>
  );
}
