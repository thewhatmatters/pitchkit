"use client";

import { useRef, useState } from "react";
import { AlertDialog, Button, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import {
  DANGER_ZONE_CAPTION,
  DANGER_ZONE_LINE,
  DELETE_ACCOUNT_ACTION,
  DELETE_ACCOUNT_CANCEL,
  DELETE_ACCOUNT_CONFIRM,
  DELETE_ACCOUNT_TITLE,
  DELETE_ACCOUNT_TRIGGER,
} from "@/lib/copy";

/**
 * Danger zone: flat section at the bottom of Account settings. Uses the full
 * erase path (`/auth/disconnect` → `eraseCreatorData`). Focus opens on Cancel
 * (WMDS AlertDialog default — do not override).
 * TODO(#69): swap the heading for WMDS SectionCaption once the WMDS pin moves
 * past 3b75f96 (SectionCaption isn't in the pinned build).
 */
export function DeleteAccountControl({ onBeforeDelete }: { onBeforeDelete?: () => void }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <section aria-labelledby="danger-zone-caption" className="flex flex-col items-start gap-2">
      <h2 id="danger-zone-caption" className={cardTitleClasses}>
        {DANGER_ZONE_CAPTION}
      </h2>
      <p className={cardBodyTextClasses}>{DANGER_ZONE_LINE}</p>
      <Button role="destructive" size="sm" type="button" onClick={() => setOpen(true)}>
        {DELETE_ACCOUNT_TRIGGER}
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title={DELETE_ACCOUNT_TITLE}
        description={DELETE_ACCOUNT_CONFIRM}
        cancelLabel={DELETE_ACCOUNT_CANCEL}
        confirmLabel={DELETE_ACCOUNT_ACTION}
        confirmRole="destructive"
        onConfirm={() => {
          setOpen(false);
          onBeforeDelete?.();
          formRef.current?.requestSubmit();
        }}
      />
      <form ref={formRef} action="/auth/disconnect" method="post" hidden />
    </section>
  );
}
