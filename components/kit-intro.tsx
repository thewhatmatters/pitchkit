"use client";

import { useState } from "react";
import { Button, TextArea } from "@/components/wmds";
import { PATTERN_INTRO_CLASS } from "@/components/pattern-tokens";
import {
  PITCHKIT_INTRO_HARD_LIMIT,
  pitchKitIntroIsEmpty,
  pitchKitIntroStatus,
} from "@/lib/kit-profile";

type OwnerIntroEditorProps = {
  intro: string;
  onIntroChange: (value: string) => void;
};

/**
 * Pattern — intro (owner) Show code (`examples-pitchkit--intro-owner`).
 * Soft 160 / hard 280. Empty is ghost **Add an intro**, not Instagram biography.
 */
export function OwnerIntroEditor({ intro, onIntroChange }: OwnerIntroEditorProps) {
  const [editing, setEditing] = useState(() => !pitchKitIntroIsEmpty(intro));

  if (pitchKitIntroIsEmpty(intro) && !editing) {
    return (
      <Button role="ghost" onClick={() => setEditing(true)}>
        Add an intro
      </Button>
    );
  }

  return (
    <TextArea
      label="Intro"
      description="Shown on your Pitchkit. This is not your Instagram bio."
      placeholder="What you create and who you create it for"
      value={intro}
      maxLength={PITCHKIT_INTRO_HARD_LIMIT}
      status={pitchKitIntroStatus(intro)}
      rows={4}
      onChange={(event) => onIntroChange(event.target.value)}
    />
  );
}

type PublicIntroProps = {
  intro: string | null | undefined;
};

/**
 * Pattern — intro (public) Show code (`examples-pitchkit--intro-public`).
 * Omit the block when empty. Not Instagram biography.
 */
export function PublicIntro({ intro }: PublicIntroProps) {
  if (pitchKitIntroIsEmpty(intro)) {
    return null;
  }

  return <p className={PATTERN_INTRO_CLASS}>{intro}</p>;
}
