/**
 * Audience mixes are ranked lists + layout bars — not a second Chart.
 * Hide the object when the mix is empty. Never paint zeros.
 */

export type RankedShare = {
  label: string;
  percent: number;
};

export function visibleAudienceMix(rows: RankedShare[] | null | undefined): RankedShare[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  return rows.filter((row) => Number.isFinite(row.percent) && row.percent > 0);
}

export function shouldShowAudienceMix(rows: RankedShare[] | null | undefined): boolean {
  return visibleAudienceMix(rows).length > 0;
}

/** Seed / stub has no Graph `follower_demographics`. Hide until Insights land. */
export const SEED_AUDIENCE = {
  country: [] as RankedShare[],
  city: [] as RankedShare[],
  age: [] as RankedShare[],
  gender: [] as RankedShare[],
};
