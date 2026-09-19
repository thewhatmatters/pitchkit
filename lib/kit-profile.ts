/**
 * Pitchkit-owned kit intro + past brands.
 * Not Instagram biography. Not SQL — staged on the KV Graph snapshot.
 * WMDS tip `96f44587b3b3ff1c44de9f1e5adba61a661d30e1`:
 * `examples-pitchkit--intro-owner` / `--intro-public`
 * `examples-pitchkit--past-brands-owner` / `--past-brands-public`
 */

export const PITCHKIT_INTRO_SOFT_LIMIT = 160;
export const PITCHKIT_INTRO_HARD_LIMIT = 280;
export const PITCHKIT_BRANDS_MAX = 8;
export const PITCHKIT_BRAND_NAME_MAX = 40;

export const KIT_PROFILE_PATH = "/api/kit/profile";

export type PastBrand = {
  id: string;
  name: string;
};

export type KitProfile = {
  intro: string | null;
  past_brands: PastBrand[];
};

export const EMPTY_KIT_PROFILE: KitProfile = {
  intro: null,
  past_brands: [],
};

/** Seed `/k/demo` frozen display — WMDS Pattern filled examples. Not live Graph. */
export const SEED_INTRO =
  "I create sunlit home stories for people who host — tables, rooms, and weekend rituals.";

export const SEED_PAST_BRANDS: PastBrand[] = [
  { id: "hearth-home", name: "Hearth & Home" },
  { id: "studio-line", name: "Studio Line" },
  { id: "market-co", name: "Market Co." },
];

export function pitchKitIntroIsEmpty(intro: string | null | undefined): boolean {
  return (intro?.trim().length ?? 0) === 0;
}

export function pitchKitIntroStatus(
  intro: string,
): "warning" | "error" | undefined {
  const length = intro.length;
  if (length >= PITCHKIT_INTRO_HARD_LIMIT) {
    return "error";
  }
  if (length >= PITCHKIT_INTRO_SOFT_LIMIT) {
    return "warning";
  }
  return undefined;
}

export function normalizeIntro(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed.slice(0, PITCHKIT_INTRO_HARD_LIMIT);
}

export function normalizePastBrands(value: unknown): PastBrand[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const out: PastBrand[] = [];
  const seen = new Set<string>();
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      continue;
    }
    const raw = row as { id?: unknown; name?: unknown };
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (name.length === 0) {
      continue;
    }
    const clipped = name.slice(0, PITCHKIT_BRAND_NAME_MAX);
    const id =
      typeof raw.id === "string" && raw.id.trim().length > 0
        ? raw.id.trim()
        : pastBrandIdFromName(
            clipped,
            out.map((brand) => brand.id),
          );
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    out.push({ id, name: clipped });
    if (out.length >= PITCHKIT_BRANDS_MAX) {
      break;
    }
  }
  return out;
}

export function normalizeKitProfile(value: unknown): KitProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_KIT_PROFILE };
  }
  const row = value as { intro?: unknown; past_brands?: unknown };
  return {
    intro: normalizeIntro(row.intro),
    past_brands: normalizePastBrands(row.past_brands),
  };
}

export function kitProfileFromUnknown(
  intro: unknown,
  pastBrands: unknown,
): KitProfile {
  return {
    intro: normalizeIntro(intro),
    past_brands: normalizePastBrands(pastBrands),
  };
}

export function shouldShowPublicIntro(intro: string | null | undefined): boolean {
  return !pitchKitIntroIsEmpty(intro);
}

export function shouldShowPastBrands(brands: readonly PastBrand[] | null | undefined): boolean {
  return (brands?.length ?? 0) > 0;
}

export function movePastBrand(
  brands: readonly PastBrand[],
  id: string,
  direction: -1 | 1,
): PastBrand[] {
  const index = brands.findIndex((brand) => brand.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= brands.length) {
    return [...brands];
  }
  const next = [...brands];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item!);
  return next;
}

export function reorderPastBrand(
  brands: readonly PastBrand[],
  sourceId: string,
  targetId: string,
): PastBrand[] {
  if (sourceId === targetId) {
    return [...brands];
  }
  const from = brands.findIndex((brand) => brand.id === sourceId);
  const to = brands.findIndex((brand) => brand.id === targetId);
  if (from < 0 || to < 0) {
    return [...brands];
  }
  const next = [...brands];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function pastBrandIdFromName(name: string, usedIds: readonly string[]): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "brand";
  if (!usedIds.includes(base)) {
    return base;
  }
  let suffix = 2;
  while (usedIds.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export type KitProfileBodyError = "invalid_body" | "intro_too_long" | "brands_too_many";

export type ParseKitProfileBody =
  | { ok: true; profile: KitProfile }
  | { ok: false; error: KitProfileBodyError };

/** Owner POST body. Reject over-limit instead of silently clipping. */
export function parseKitProfileBody(body: unknown): ParseKitProfileBody {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "invalid_body" };
  }
  const row = body as { intro?: unknown; past_brands?: unknown };
  if (row.intro != null && typeof row.intro !== "string") {
    return { ok: false, error: "invalid_body" };
  }
  if (typeof row.intro === "string" && row.intro.length > PITCHKIT_INTRO_HARD_LIMIT) {
    return { ok: false, error: "intro_too_long" };
  }
  if (row.past_brands != null && !Array.isArray(row.past_brands)) {
    return { ok: false, error: "invalid_body" };
  }
  if (Array.isArray(row.past_brands) && row.past_brands.length > PITCHKIT_BRANDS_MAX) {
    return { ok: false, error: "brands_too_many" };
  }
  if (Array.isArray(row.past_brands)) {
    for (const item of row.past_brands) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return { ok: false, error: "invalid_body" };
      }
      const brand = item as { id?: unknown; name?: unknown };
      if (typeof brand.id !== "string" || brand.id.trim().length === 0) {
        return { ok: false, error: "invalid_body" };
      }
      if (typeof brand.name !== "string") {
        return { ok: false, error: "invalid_body" };
      }
      if (brand.name.trim().length === 0) {
        return { ok: false, error: "invalid_body" };
      }
      if (brand.name.length > PITCHKIT_BRAND_NAME_MAX) {
        return { ok: false, error: "invalid_body" };
      }
    }
  }
  return {
    ok: true,
    profile: {
      intro: normalizeIntro(row.intro),
      past_brands: normalizePastBrands(row.past_brands ?? []),
    },
  };
}

export type KitProfileError =
  | "unauthenticated"
  | "invalid_body"
  | "intro_too_long"
  | "brands_too_many"
  | "persist_failed";

export const KIT_PROFILE_STATUS: Record<KitProfileError, number> = {
  unauthenticated: 401,
  invalid_body: 400,
  intro_too_long: 400,
  brands_too_many: 400,
  persist_failed: 500,
};

export function kitProfileErrorMessage(code: KitProfileError): string {
  switch (code) {
    case "unauthenticated":
      return "Sign in to edit your Pitchkit.";
    case "invalid_body":
      return "That kit profile could not be saved.";
    case "intro_too_long":
      return "Intro must be 280 characters or fewer.";
    case "brands_too_many":
      return "Past brands are limited to 8.";
    case "persist_failed":
      return "Kit profile could not be saved.";
  }
}

export function profileFromSnapshot(snapshot: {
  intro?: string | null;
  past_brands?: PastBrand[];
} | null | undefined): KitProfile {
  if (!snapshot) {
    return { ...EMPTY_KIT_PROFILE };
  }
  return {
    intro: normalizeIntro(snapshot.intro),
    past_brands: normalizePastBrands(snapshot.past_brands),
  };
}

export function withKitProfile<T extends object>(
  snapshot: T,
  profile: KitProfile,
): T & KitProfile {
  return {
    ...snapshot,
    intro: profile.intro,
    past_brands: profile.past_brands,
  };
}
