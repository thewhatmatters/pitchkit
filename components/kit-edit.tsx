"use client";

import { ShareableKit } from "@/components/shareable-kit";
import type { PastBrand } from "@/lib/kit-profile";
import type { Media, User } from "@/lib/schema";

type KitEditProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  intro?: string | null;
  pastBrands?: readonly PastBrand[];
};

/**
 * Retired owner editor. Product mounts Pattern — owner PitchKit instead.
 * Kept so leftover imports still render the shareable freeze with real data.
 */
export function KitEdit({
  user,
  posts,
  engagementRate,
  intro = null,
  pastBrands = [],
}: KitEditProps) {
  return (
    <ShareableKit
      user={user}
      posts={posts}
      engagementRate={engagementRate}
      intro={intro}
      pastBrands={pastBrands}
    />
  );
}
