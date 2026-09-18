"use client";

import {
  PATTERN_PLACEHOLDER_BODY_CLASS,
  PATTERN_PLACEHOLDER_CLASS,
  PATTERN_PLACEHOLDER_TITLE_CLASS,
} from "@/components/pattern-tokens";
import { Badge } from "@/components/wmds";
import {
  PITCHKIT_COMING_SOON_BADGE,
  PITCHKIT_COMING_SOON_BODY,
  PITCHKIT_COMING_SOON_TITLE,
} from "@/lib/copy";

/** Product override of the owner PitchKit segment. Public `/k/` stays the kit. */
export function PitchKitComingSoon() {
  return (
    <section className={PATTERN_PLACEHOLDER_CLASS}>
      <Badge variant="neutral" emphasis="muted">
        {PITCHKIT_COMING_SOON_BADGE}
      </Badge>
      <h1 className={PATTERN_PLACEHOLDER_TITLE_CLASS}>{PITCHKIT_COMING_SOON_TITLE}</h1>
      <p className={PATTERN_PLACEHOLDER_BODY_CLASS}>{PITCHKIT_COMING_SOON_BODY}</p>
    </section>
  );
}
