/**
 * Insights chart slot.
 * WMDS will wrap Nivo as Chart. Do not add a chart library here.
 * Hidden when Insights are missing.
 */
export function ChartSlot({ hasInsights }: { hasInsights: boolean }) {
  if (!hasInsights) {
    return null;
  }

  return <div aria-hidden="true" data-chart-slot="empty" />;
}
