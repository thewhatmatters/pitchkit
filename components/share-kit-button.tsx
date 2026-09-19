"use client";

import { Share2 } from "lucide-react";
import { Button, toast } from "@/components/wmds";
import {
  TOAST_KIT_COPIED_DESCRIPTION,
  TOAST_KIT_COPIED_TITLE,
  TOAST_KIT_COPY_FAILED_DESCRIPTION,
  TOAST_KIT_COPY_FAILED_TITLE,
} from "@/lib/copy";
import { kitPath } from "@/lib/kit";

type ShareKitButtonProps = {
  handle: string;
  onCopyFailed?: (url: string) => void;
};

/** Copy `/k/{handle}` — toast title + description. Pattern Insights + owner PitchKit. */
export function ShareKitButton({ handle, onCopyFailed }: ShareKitButtonProps) {
  async function copyKitLink() {
    const url = `${window.location.origin}${kitPath(handle)}`;
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
      onCopyFailed?.(url);
    }
  }

  return (
    <Button role="secondary" size="sm" icon={<Share2 />} onClick={() => void copyKitLink()}>
      Share kit
    </Button>
  );
}
