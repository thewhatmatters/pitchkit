"use client";

import { Share2 } from "lucide-react";
import { Button, toast } from "@/components/wmds";
import {
  TOAST_KIT_COPIED_DESCRIPTION,
  TOAST_KIT_COPIED_TITLE,
  TOAST_KIT_COPY_FAILED_DESCRIPTION,
  TOAST_KIT_COPY_FAILED_TITLE,
} from "@/lib/copy";
import { kitShareUrl } from "@/lib/kit";

type CopyShareKitOptions = {
  onCopyFailed?: (url: string) => void;
};

export async function copyShareKitLink(handle: string, options: CopyShareKitOptions = {}) {
  const url = kitShareUrl(window.location.origin, handle);
  try {
    await navigator.clipboard.writeText(url);
    toast.add({
      title: TOAST_KIT_COPIED_TITLE,
      description: TOAST_KIT_COPIED_DESCRIPTION,
    });
  } catch {
    toast.add({
      title: TOAST_KIT_COPY_FAILED_TITLE,
      description: TOAST_KIT_COPY_FAILED_DESCRIPTION,
    });
    options.onCopyFailed?.(url);
  }
}

type ShareKitButtonProps = {
  handle: string;
  onCopyFailed?: (url: string) => void;
};

/**
 * Owner Share kit — copies `kitShareUrl(origin, handle)`.
 * Same Button on Insights PageHeader (Pattern) and owner PitchKit (primary).
 * Public `/k/[handle]` must not mount this.
 */
export function ShareKitButton({ handle, onCopyFailed }: ShareKitButtonProps) {
  return (
    <Button
      role="secondary"
      size="sm"
      icon={<Share2 />}
      onClick={() => void copyShareKitLink(handle, { onCopyFailed })}
    >
      Share kit
    </Button>
  );
}
