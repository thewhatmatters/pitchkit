"use client";

import { Info } from "lucide-react";
import { IconButton, Tooltip } from "@/components/wmds";
import { ENGAGEMENT_FORMULA } from "@/lib/inventory";

/**
 * WMDS Tooltip Pattern — icon-only action (`Info` + IconButton).
 * Formula stays on the Engagement rate Stat, not a PageHeader headline.
 */
export function EngagementRateFormulaTooltip() {
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger
          render={
            <IconButton
              icon={<Info />}
              aria-label="Engagement rate formula"
              title=""
              size="sm"
            />
          }
        />
        <Tooltip.Content>
          Engagement rate = {ENGAGEMENT_FORMULA}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
}
