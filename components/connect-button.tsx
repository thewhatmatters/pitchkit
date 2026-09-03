"use client";

import { Button } from "@/components/wmds";
import { LogIn } from "lucide-react";

export function ConnectButton() {
  return (
    <Button type="submit" icon={<LogIn strokeWidth={2} />}>
      Continue with Instagram
    </Button>
  );
}
