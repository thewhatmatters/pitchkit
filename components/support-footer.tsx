import { PATTERN_FOOTER_BAND_CLASS, PATTERN_FOOTER_CLASS } from "@/components/pattern-tokens";
import { TextLink } from "@/components/wmds";
import { SUPPORT_EMAIL } from "@/lib/copy";

export function SupportFooter() {
  return (
    <div className={PATTERN_FOOTER_BAND_CLASS}>
      <footer className={PATTERN_FOOTER_CLASS}>
        <TextLink href="/privacy">Privacy</TextLink>
        <TextLink href={`mailto:${SUPPORT_EMAIL}`}>Support</TextLink>
      </footer>
    </div>
  );
}
