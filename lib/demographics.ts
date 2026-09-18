/**
 * follower_demographics → ranked % of the located sample.
 * Graph returns integer counts, not percents. Never ÷ followers_count.
 * Hide when omitted, <100 followers (0 rows), or empty. Top 45 only.
 */

import type { RankedShare } from "./audience";

export const DEMOGRAPHICS_TOP_N = 45;

export type GraphDimensionResult = {
  dimension_values?: unknown;
  value?: unknown;
};

export type GraphDemographicsPayload = {
  data?: Array<{
    name?: string;
    total_value?: {
      breakdowns?: Array<{
        results?: GraphDimensionResult[];
      }>;
    };
  }>;
};

export function demographicsResults(payload: GraphDemographicsPayload | null | undefined): GraphDimensionResult[] {
  const results = payload?.data?.[0]?.total_value?.breakdowns?.[0]?.results;
  return Array.isArray(results) ? results : [];
}

export function locatedSampleTotal(results: GraphDimensionResult[]): number {
  let sum = 0;
  for (const row of results) {
    if (typeof row.value === "number" && Number.isFinite(row.value) && row.value > 0) {
      sum += row.value;
    }
  }
  return sum;
}

export function rankedSharesFromDemographics(
  payload: GraphDemographicsPayload | null | undefined,
): RankedShare[] {
  const results = demographicsResults(payload);
  const total = locatedSampleTotal(results);
  if (total <= 0) {
    return [];
  }

  const rows: RankedShare[] = [];
  for (const row of results) {
    if (typeof row.value !== "number" || !Number.isFinite(row.value) || row.value <= 0) {
      continue;
    }
    const label = Array.isArray(row.dimension_values)
      ? row.dimension_values.filter((part): part is string => typeof part === "string" && part.length > 0).join(", ")
      : "";
    if (!label) {
      continue;
    }
    rows.push({
      label,
      percent: (row.value / total) * 100,
    });
  }

  rows.sort((a, b) => b.percent - a.percent);
  return rows.slice(0, DEMOGRAPHICS_TOP_N);
}
