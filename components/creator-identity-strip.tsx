"use client";

import { Avatar, Chip, Skeleton } from "@/components/wmds";
import {
  PATTERN_IDENTITY_AVATAR_SKELETON_PX,
  PATTERN_IDENTITY_COPY_CLASS,
  PATTERN_IDENTITY_NAME_CLASS,
  PATTERN_IDENTITY_ROW_CLASS,
  PATTERN_IDENTITY_SKELETON_COPY_CLASS,
  PATTERN_IDENTITY_TITLE_ROW_CLASS,
  PATTERN_SUPPORTING_CLASS,
} from "@/components/pattern-tokens";
import type { CreatorIdentity } from "@/lib/creator-identity";

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type CreatorIdentityStripProps = {
  identity: CreatorIdentity;
  nameAs?: "h1" | "p";
  showProfessionalChip?: boolean;
};

/**
 * Shared identity chrome — Pattern — creator identity Show code
 * (`examples-pitchkit--creator-identity-public` /
 * `examples-pitchkit--creator-identity-owner-settings`).
 */
export function CreatorIdentityStrip({
  identity,
  nameAs = "h1",
  showProfessionalChip = false,
}: CreatorIdentityStripProps) {
  const NameTag = nameAs;
  const avatarName = identity.displayName ?? identity.handle;
  const handleLabel = `@${identity.handle}`;
  const followerLabel =
    identity.followersCount == null
      ? null
      : `${compactNumber.format(identity.followersCount)} followers`;
  const meta = [handleLabel, followerLabel].filter(Boolean).join(" · ");
  const showTitleRow =
    identity.displayName != null ||
    (showProfessionalChip && identity.professionalAccount != null);

  return (
    <div className={PATTERN_IDENTITY_ROW_CLASS}>
      <Avatar name={avatarName} src={identity.profilePictureUrl} size="lg" />
      <div className={PATTERN_IDENTITY_COPY_CLASS}>
        {showTitleRow ? (
          <div className={PATTERN_IDENTITY_TITLE_ROW_CLASS}>
            {identity.displayName != null ? (
              <NameTag className={PATTERN_IDENTITY_NAME_CLASS}>{identity.displayName}</NameTag>
            ) : null}
            {showProfessionalChip && identity.professionalAccount != null ? (
              <Chip readOnly size="sm">
                {identity.professionalAccount}
              </Chip>
            ) : null}
          </div>
        ) : null}
        <p className={PATTERN_SUPPORTING_CLASS}>{meta}</p>
      </div>
    </div>
  );
}

/** State — creator identity loading (`examples-pitchkit--creator-identity-loading`). */
export function CreatorIdentityStripSkeleton() {
  return (
    <div className={PATTERN_IDENTITY_ROW_CLASS} aria-hidden>
      <Skeleton
        width={PATTERN_IDENTITY_AVATAR_SKELETON_PX}
        height={PATTERN_IDENTITY_AVATAR_SKELETON_PX}
        radius="full"
        index={0}
      />
      <div className={PATTERN_IDENTITY_SKELETON_COPY_CLASS}>
        <Skeleton width={168} height={20} radius="inner" index={1} />
        <Skeleton width={220} height={14} radius="inner" index={2} />
      </div>
    </div>
  );
}
