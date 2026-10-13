/**
 * Past-brand names on the shareable kit. Pattern freeze uses outlined Cards.
 * Hide empty. Marquee only when the public rail overflows. No invented year or campaign summary.
 */

export type SourcedContactDetail =
  | { kind: "email"; value: string; href: string }
  | { kind: "website"; value: string; href: string }
  | { kind: "text"; value: string };

export function visibleBrandNames(brands: readonly string[] | null | undefined): string[] {
  if (!Array.isArray(brands) || brands.length === 0) {
    return [];
  }

  return brands.map((name) => name.trim()).filter((name) => name.length > 0);
}

export function shouldShowPastBrands(brands: readonly string[] | null | undefined): boolean {
  return visibleBrandNames(brands).length > 0;
}

export function sourcedContact(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

/** Map a creator-entered contact string. Do not invent website or location. */
export function sourcedContactDetail(
  value: string | null | undefined,
): SourcedContactDetail | null {
  const trimmed = sourcedContact(value);
  if (trimmed == null) {
    return null;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { kind: "email", value: trimmed, href: `mailto:${trimmed}` };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return { kind: "website", value: trimmed, href: trimmed };
  }

  return { kind: "text", value: trimmed };
}
