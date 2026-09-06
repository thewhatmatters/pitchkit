"use client";

import { Chip } from "@/components/wmds";
import { shouldShowPastBrands, visibleBrandNames } from "@/lib/kit-chips";

type PastBrandsProps = {
  brands: readonly string[] | null | undefined;
};

export function PastBrands({ brands }: PastBrandsProps) {
  const names = visibleBrandNames(brands);
  if (!shouldShowPastBrands(names)) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" data-past-brands="chips">
      {names.map((name) => (
        <Chip key={name} readOnly size="sm">
          {name}
        </Chip>
      ))}
    </div>
  );
}
