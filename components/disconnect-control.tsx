"use client";

import { useRef, useState } from "react";
import { AlertDialog, Button } from "@/components/wmds";
import { DISCONNECT_CONFIRM, DISCONNECT_KEEP, DISCONNECT_TITLE } from "@/lib/copy";

export function DisconnectControl() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Button role="destructive" type="button" onClick={() => setOpen(true)}>
        Disconnect
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title={DISCONNECT_TITLE}
        description={DISCONNECT_CONFIRM}
        cancelLabel={DISCONNECT_KEEP}
        confirmLabel="Disconnect"
        onConfirm={() => {
          formRef.current?.requestSubmit();
        }}
      />
      <form ref={formRef} action="/auth/disconnect" method="post" hidden />
    </>
  );
}
