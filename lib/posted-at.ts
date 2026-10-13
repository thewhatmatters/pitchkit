/**
 * Post timestamps on owner Insights proof (and owner PitchKit when shown).
 * Product truth includes the year so a 2024 post is not read as this year.
 * WMDS PitchKit stories may omit year — do not invent a date atom.
 */

export function formatPostedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
