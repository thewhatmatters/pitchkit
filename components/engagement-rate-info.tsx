"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { IconButton, Tooltip } from "@/components/wmds";
import { ENGAGEMENT_FORMULA } from "@/lib/inventory";

/**
 * WMDS Tooltip Pattern — icon-only action (`Info` + IconButton).
 * Formula stays on the Engagement rate Stat, not a PageHeader headline.
 * Click toggles for touch; hover/focus still report through onOpenChange.
 */
export function EngagementRateFormulaTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip.Provider delay={0}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger
          render={
            <IconButton
              icon={<Info />}
              aria-label="Engagement rate formula"
              title=""
              size="sm"
              onClick={() => {
                setOpen((current) => !current);
              }}
            />
          }
          aria-label="Engagement rate formula"
          title=""
        />
        <Tooltip.Content>
          Engagement rate = {ENGAGEMENT_FORMULA}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
}
