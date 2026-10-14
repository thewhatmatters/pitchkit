import { formatCount, formatEngagementRate } from "./engagement";

export type ShownStat = { label: string; value: string };

/** Stats a brand sees. With hideEmpty, a stat with no value is dropped (never "—"). */
export function publicStats(input: {
  followers: number;
  engagement: number | null;
  typicalReach: number | null;
  typicalSaves: number | null;
  hideEmpty: boolean;
}): ShownStat[] {
  const rows: Array<{ label: string; value: string | null }> = [
    { label: "Followers", value: formatCount(input.followers) },
    {
      label: "Engagement rate",
      value: input.engagement != null ? formatEngagementRate(input.engagement) : null,
    },
    {
      label: "Typical reach",
      value: input.typicalReach != null ? formatCount(input.typicalReach) : null,
    },
    {
      label: "Typical saves",
      value: input.typicalSaves != null ? formatCount(input.typicalSaves) : null,
    },
  ];
  return rows.flatMap((row) => {
    if (row.value != null) return [{ label: row.label, value: row.value }];
    if (input.hideEmpty || row.label === "Engagement rate") return [];
    return [{ label: row.label, value: "—" }];
  });
}
