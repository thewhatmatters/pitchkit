/** Past-brand names on `/k/[handle]`. Wrap WMDS Chip. Hide empty. No marquee. */

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
