"use client";

import { useEffect } from "react";
import { toast } from "@/components/wmds";
import { ACCOUNT_DELETED_TOAST } from "@/lib/copy";

/** Fires once after the delete redirect (`/?deleted=1`), then cleans the URL. */
export function DeletedToast() {
  useEffect(() => {
    toast.add({ title: ACCOUNT_DELETED_TOAST });
    window.history.replaceState(null, "", "/");
  }, []);
  return null;
}
