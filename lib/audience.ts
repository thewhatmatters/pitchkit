/**
 * Audience mixes are ranked lists + layout bars — not a second Chart.
 * Empty / omitted / <100-follower Graph rows keep the owner Card (insufficient
 * empty well). Never invent zeros or EXAMPLE percents. Honest 0 only when Graph
 * returned a zero count — do not paint invented 0% bars.
 */

export type RankedShare = {
  label: string;
  percent: number;
};

export type AudienceMixes = {
  country: RankedShare[];
  city: RankedShare[];
  age: RankedShare[];
  gender: RankedShare[];
};

/** Owner / Graph payload — mixes may be omitted or null after an empty poll. */
export type AudienceMixInput = {
  [K in keyof AudienceMixes]?: RankedShare[] | null;
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

export function hasVisibleAudienceMixes(
  audience: AudienceMixInput | null | undefined,
): boolean {
  return (
    shouldShowAudienceMix(audience?.country) ||
    shouldShowAudienceMix(audience?.city) ||
    shouldShowAudienceMix(audience?.age) ||
    shouldShowAudienceMix(audience?.gender)
  );
}

export type AudienceFitSurface = "bars" | "empty";

/**
 * Owner Insights Audience Card. Never omit for empty Graph / seed mixes.
 * `empty` = insufficient-data well (`examples-pitchkit--insufficient-audience-data`).
 * `bars` = live ranked shares only.
 */
export function audienceFitSurface(
  audience: AudienceMixInput | null | undefined,
): AudienceFitSurface {
  return hasVisibleAudienceMixes(audience) ? "bars" : "empty";
}

/** Empty mixes — seed/stub and live Graph with 0 rows. Never EXAMPLE percents. */
export const EMPTY_AUDIENCE_MIXES: AudienceMixes = {
  country: [],
  city: [],
  age: [],
  gender: [],
};

/**
 * Tokenless seed / stub owner. Same empty mixes as a live 0-row poll.
 * Do not swap this in as `audience ?? SEED_AUDIENCE` on live Insights —
 * pass the Graph payload (or null) and let `resolveOwnerAudience` empty it.
 */
export const SEED_AUDIENCE = EMPTY_AUDIENCE_MIXES;

/**
 * Owner Insights mixes. Null / omitted / empty → empty mixes (Card stays).
 * Never EXAMPLE country/city/age/gender percents.
 */
export function resolveOwnerAudience(
  audience: AudienceMixInput | null | undefined,
): AudienceMixes {
  if (!audience) {
    return EMPTY_AUDIENCE_MIXES;
  }

  return {
    country: visibleAudienceMix(audience.country),
    city: visibleAudienceMix(audience.city),
    age: visibleAudienceMix(audience.age),
    gender: visibleAudienceMix(audience.gender),
  };
}
