/**
 * Pitchkit-owned kit intro + past brands + theme.
 * Not Instagram biography. Not SQL — staged on the KV Graph snapshot.
 * WMDS tip `3b75f96e1ea78bffb1a533131502e44148a80c89`:
 * `examples-pitchkit--intro-owner` / `--intro-public`
 * `examples-pitchkit--past-brands-owner` / `--past-brands-public`
 * (`--past-brands-owner-empty` / `--past-brands-owner-overflow`
 * / `--past-brands-public-omit` / `--past-brands-public-overflow`)
 * Theme picker chrome is off; `theme` stays on the KV snapshot (default light).
 */

export const PITCHKIT_INTRO_SOFT_LIMIT = 160;
export const PITCHKIT_INTRO_HARD_LIMIT = 280;
export const PITCHKIT_BRANDS_MAX = 8;
export const PITCHKIT_BRAND_NAME_MAX = 40;
export const PITCHKIT_BRAND_RESULT_MAX = 24;
export const PITCHKIT_BRAND_LOGO_LETTER = "letter";
export const PITCHKIT_BRAND_RESULT_HINTS =
  "+12% CTR · 3.2x ROAS · 1.4M views · Sold out in 48h · Series A launch";

export const KIT_PROFILE_PATH = "/api/kit/profile";

/** Curated WMDS pack slugs — not creator upload, not scraped favicons. */
export const PITCHKIT_BRAND_LOGO_KEYS = [
  "nike",
  "adidas",
  "apple",
  "google",
  "meta",
  "amazon",
  "spotify",
  "netflix",
  "sephora",
  "glossier",
  "nordstrom",
  "target",
  "walmart",
  "starbucks",
  "coca-cola",
  "pepsi",
  "samsung",
  "microsoft",
  "adobe",
  "shopify",
  "uber",
  "airbnb",
  "disney",
  "lululemon",
  "reebok",
  "puma",
  "dior",
  "chanel",
  "bmw",
  "ford",
  "chase",
  "visa",
] as const;

export type PitchKitBrandLogoKey = (typeof PITCHKIT_BRAND_LOGO_KEYS)[number];

const PITCHKIT_BRAND_LOGO_KEY_SET = new Set<string>(PITCHKIT_BRAND_LOGO_KEYS);

export type PastBrand = {
  id: string;
  name: string;
  logo_key?: string | null;
  result_label?: string | null;
};

export const PITCHKIT_THEMES = ["light", "dark", "soft"] as const;
export type PitchKitTheme = (typeof PITCHKIT_THEMES)[number];
export const PITCHKIT_THEME_DEFAULT: PitchKitTheme = "light";

export type KitProfile = {
  intro: string | null;
  past_brands: PastBrand[];
  theme: PitchKitTheme;
};

export const EMPTY_KIT_PROFILE: KitProfile = {
  intro: null,
  past_brands: [],
  theme: PITCHKIT_THEME_DEFAULT,
};

/** Seed `/k/demo` frozen display — WMDS Pattern filled examples. Not live Graph. */
export const SEED_INTRO =
  "I create sunlit home stories for people who host — tables, rooms, and weekend rituals.";

/** Pattern — past brands (owner/public) filled example. Mixed chips + one curated mark. */
export const SEED_PAST_BRANDS: PastBrand[] = [
  { id: "hearth-home", name: "Hearth & Home", result_label: "3.2x ROAS" },
  { id: "studio-line", name: "Studio Line", logo_key: "adobe" },
  { id: "market-co", name: "Market Co.", result_label: "+12% CTR" },
];

export function isPitchKitBrandLogoKey(value: string): value is PitchKitBrandLogoKey {
  return PITCHKIT_BRAND_LOGO_KEY_SET.has(value);
}

/** Unknown, empty, or `letter` → letter Avatar fallback. */
export function resolvePastBrandLogoKey(
  logoKey: string | null | undefined,
): PitchKitBrandLogoKey | undefined {
  if (logoKey == null || logoKey === "" || logoKey === PITCHKIT_BRAND_LOGO_LETTER) {
    return undefined;
  }
  return isPitchKitBrandLogoKey(logoKey) ? logoKey : undefined;
}

export function pastBrandLogoKeyLabel(logoKey: PitchKitBrandLogoKey): string {
  return logoKey
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

/** Knockout monogram for a curated key — not a scraped trademark. */
export function pastBrandLogoMonogram(logoKey: PitchKitBrandLogoKey): string {
  const parts = logoKey.split("-");
  if (parts.length > 1) {
    return parts
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  }
  return logoKey.slice(0, 1).toUpperCase();
}

export function normalizePastBrandResult(
  value: string | null | undefined,
): string | undefined {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length === 0) {
    return undefined;
  }
  return trimmed.slice(0, PITCHKIT_BRAND_RESULT_MAX);
}

const PAST_BRAND_RESULT_URL_PATTERN = /https?:\/\/|www\./i;
const PAST_BRAND_RESULT_HANDLE_PATTERN = /(^|[\s])@[a-z0-9._]+/i;
const PAST_BRAND_RESULT_EMOJI_PATTERN = /\p{Extended_Pictographic}/gu;

export function pastBrandResultIssues(value: string): string | undefined {
  if (/[\n\r]/.test(value)) {
    return "Keep the result on one line.";
  }
  if (PAST_BRAND_RESULT_URL_PATTERN.test(value)) {
    return "Links are not allowed in a result.";
  }
  if (PAST_BRAND_RESULT_HANDLE_PATTERN.test(value)) {
    return "@handles are not allowed in a result.";
  }
  const emojiCount = value.match(PAST_BRAND_RESULT_EMOJI_PATTERN)?.length ?? 0;
  if (emojiCount >= 3) {
    return "Skip emoji spam — use a short phrase.";
  }
  return undefined;
}

export function pastBrandResultStatus(value: string): "error" | undefined {
  return pastBrandResultIssues(value) == null ? undefined : "error";
}

function pastBrandFields(
  name: string,
  logoKey: unknown,
  resultLabel: unknown,
): Pick<PastBrand, "name" | "logo_key" | "result_label"> {
  const logo_key = resolvePastBrandLogoKey(typeof logoKey === "string" ? logoKey : null);
  const result_label = normalizePastBrandResult(
    typeof resultLabel === "string" ? resultLabel : null,
  );
  return {
    name,
    ...(logo_key == null ? {} : { logo_key }),
    ...(result_label == null ? {} : { result_label }),
  };
}

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
    const raw = row as {
      id?: unknown;
      name?: unknown;
      logo_key?: unknown;
      result_label?: unknown;
    };
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
    out.push({ id, ...pastBrandFields(clipped, raw.logo_key, raw.result_label) });
    if (out.length >= PITCHKIT_BRANDS_MAX) {
      break;
    }
  }
  return out;
}

export function isPitchKitTheme(value: unknown): value is PitchKitTheme {
  return value === "light" || value === "dark" || value === "soft";
}

export function normalizeTheme(value: unknown): PitchKitTheme {
  return isPitchKitTheme(value) ? value : PITCHKIT_THEME_DEFAULT;
}

export function normalizeKitProfile(value: unknown): KitProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_KIT_PROFILE };
  }
  const row = value as { intro?: unknown; past_brands?: unknown; theme?: unknown };
  return {
    intro: normalizeIntro(row.intro),
    past_brands: normalizePastBrands(row.past_brands),
    theme: normalizeTheme(row.theme),
  };
}

export function kitProfileFromUnknown(
  intro: unknown,
  pastBrands: unknown,
  theme?: unknown,
): KitProfile {
  return {
    intro: normalizeIntro(intro),
    past_brands: normalizePastBrands(pastBrands),
    theme: normalizeTheme(theme),
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
  const row = body as { intro?: unknown; past_brands?: unknown; theme?: unknown };
  if (row.intro != null && typeof row.intro !== "string") {
    return { ok: false, error: "invalid_body" };
  }
  if (typeof row.intro === "string" && row.intro.length > PITCHKIT_INTRO_HARD_LIMIT) {
    return { ok: false, error: "intro_too_long" };
  }
  if (row.theme != null && !isPitchKitTheme(row.theme)) {
    return { ok: false, error: "invalid_body" };
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
      const brand = item as {
        id?: unknown;
        name?: unknown;
        logo_key?: unknown;
        result_label?: unknown;
      };
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
      if (brand.logo_key != null && typeof brand.logo_key !== "string") {
        return { ok: false, error: "invalid_body" };
      }
      if (brand.result_label != null && typeof brand.result_label !== "string") {
        return { ok: false, error: "invalid_body" };
      }
    }
  }
  return {
    ok: true,
    profile: {
      intro: normalizeIntro(row.intro),
      past_brands: normalizePastBrands(row.past_brands ?? []),
      theme: normalizeTheme(row.theme),
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
  theme?: PitchKitTheme;
} | null | undefined): KitProfile {
  if (!snapshot) {
    return { ...EMPTY_KIT_PROFILE };
  }
  return {
    intro: normalizeIntro(snapshot.intro),
    past_brands: normalizePastBrands(snapshot.past_brands),
    theme: normalizeTheme(snapshot.theme),
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
    theme: profile.theme,
  };
}
