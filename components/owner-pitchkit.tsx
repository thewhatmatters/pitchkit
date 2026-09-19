"use client";

import { useMemo, useState } from "react";
import { EyeOff } from "lucide-react";
import { CreatorIdentityStrip } from "@/components/creator-identity-strip";
import {
  PATTERN_CONTACT_CARD_CLASS,
  PATTERN_CONTACT_ROW_CLASS,
  PATTERN_CONTACT_ROWS_CLASS,
  PATTERN_IDENTITY_SECTION_CLASS,
  PATTERN_KIT_POST_METRICS_CLASS,
  PATTERN_KIT_STAT_CLASS,
  PATTERN_POST_CARD_CLASS,
  PATTERN_POST_IMAGE_CLASS,
  PATTERN_POST_METRIC_CLASS,
  PATTERN_POST_METRIC_LABEL_CLASS,
  PATTERN_POST_METRIC_VALUE_CLASS,
  PATTERN_POSTS_HEADER_CLASS,
  PATTERN_POSTS_PANEL_CLASS,
  PATTERN_POSTS_SECTION_CLASS,
  PATTERN_SECTION_EYEBROW_CLASS,
  PATTERN_STATS_BAND_CLASS,
  PATTERN_SUPPORTING_CLASS,
} from "@/components/pattern-tokens";
import {
  AlertDialog,
  Card,
  MoreMenu,
  Stat,
  TextLink,
  cardTitleClasses,
  toast,
} from "@/components/wmds";
import {
  TOAST_HIDE_FAILED_TITLE,
  TOAST_POST_HIDDEN_DESCRIPTION,
  TOAST_POST_HIDDEN_TITLE,
  TOAST_POST_RESTORED_DESCRIPTION,
  TOAST_POST_RESTORED_TITLE,
  TOAST_RESTORE_FAILED_TITLE,
} from "@/lib/copy";
import { creatorIdentityFromUser } from "@/lib/creator-identity";
import { engagementRate, formatCount, formatEngagementRate } from "@/lib/engagement";
import {
  shouldShowPastBrands,
  sourcedContactDetail,
  visibleBrandNames,
} from "@/lib/kit-chips";
import {
  clearHiddenFromKit,
  hideFromKit,
  restoreToKit,
  stampHiddenFromKit,
} from "@/lib/kit-visibility";
import { excludeHiddenFromPublicKit, selectSixPosts } from "@/lib/kit";
import { publicObjectUrl } from "@/lib/r2";
import type { Media, User } from "@/lib/schema";

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export type OwnerPostsUpdater = Media[] | ((current: Media[]) => Media[]);

type OwnerPitchKitProps = {
  user: User;
  posts: Media[];
  onPostsChange: (posts: OwnerPostsUpdater) => void;
  pastBrands?: readonly string[];
  contact?: string | null;
};

/**
 * Pattern — owner PitchKit Show code (`examples-pitchkit--owner-pitch-kit`).
 * Same shareable sections as `/k/[handle]`, plus hide/restore on selected posts.
 * Identity is Graph read-only. Empty contact and brands stay hidden.
 */
export function OwnerPitchKit({
  user,
  posts,
  onPostsChange,
  pastBrands = [],
  contact = null,
}: OwnerPitchKitProps) {
  const [postNotice, setPostNotice] = useState<string | null>(null);
  const [pendingHidePostId, setPendingHidePostId] = useState<string | null>(null);

  const visiblePosts = useMemo(
    () => selectSixPosts(excludeHiddenFromPublicKit(posts)),
    [posts],
  );
  const contactDetail = sourcedContactDetail(contact);
  const brands = visibleBrandNames(pastBrands);
  const identity = creatorIdentityFromUser(user);
  const rate = engagementRate(visiblePosts);

  function handlePostAction(postId: string, actionId: string) {
    if (actionId === "hide") {
      setPendingHidePostId(postId);
    }
  }

  async function hidePendingPost() {
    if (pendingHidePostId == null) {
      return;
    }
    const hiddenPost = visiblePosts.find((post) => post.id === pendingHidePostId);
    if (hiddenPost == null) {
      setPendingHidePostId(null);
      return;
    }

    const optimisticHiddenAt = new Date().toISOString();
    onPostsChange((current) => stampHiddenFromKit(current, hiddenPost.id, optimisticHiddenAt));
    setPostNotice("Post hidden from the shareable kit.");
    setPendingHidePostId(null);

    const result = await hideFromKit(hiddenPost.id);
    if (!result.ok) {
      onPostsChange((current) => clearHiddenFromKit(current, hiddenPost.id));
      setPostNotice(null);
      toast.add({
        title: TOAST_HIDE_FAILED_TITLE,
        description: result.error,
      });
      return;
    }

    const hiddenFromKitAt = result.hiddenFromKitAt;
    if (hiddenFromKitAt != null) {
      onPostsChange((current) =>
        stampHiddenFromKit(current, hiddenPost.id, hiddenFromKitAt),
      );
    }

    toast.add({
      title: TOAST_POST_HIDDEN_TITLE,
      description: TOAST_POST_HIDDEN_DESCRIPTION,
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          void restoreHiddenPost({
            ...hiddenPost,
            hidden_from_kit_at: result.hiddenFromKitAt,
          });
        },
      },
    });
  }

  async function restoreHiddenPost(hiddenPost: Media) {
    const previousHiddenAt = hiddenPost.hidden_from_kit_at;
    onPostsChange((current) => clearHiddenFromKit(current, hiddenPost.id));
    setPostNotice("Post restored to the shareable kit.");
    const result = await restoreToKit(hiddenPost.id);
    if (!result.ok) {
      if (previousHiddenAt != null) {
        onPostsChange((current) =>
          stampHiddenFromKit(current, hiddenPost.id, previousHiddenAt),
        );
      }
      setPostNotice("Post hidden from the shareable kit.");
      toast.add({
        title: TOAST_RESTORE_FAILED_TITLE,
        description: result.error,
      });
      return;
    }

    toast.add({
      title: TOAST_POST_RESTORED_TITLE,
      description: TOAST_POST_RESTORED_DESCRIPTION,
    });
  }

  return (
    <>
      <section className={PATTERN_IDENTITY_SECTION_CLASS}>
        <CreatorIdentityStrip identity={identity} nameAs="h1" showProfessionalChip />
      </section>

      <div
        role="group"
        aria-label="Verified Instagram summary"
        className={PATTERN_STATS_BAND_CLASS}
      >
        <Stat
          className={PATTERN_KIT_STAT_CLASS}
          label="Followers"
          value={formatCount(user.followers)}
        />
        <Stat
          className={PATTERN_KIT_STAT_CLASS}
          label="Engagement rate"
          value={formatEngagementRate(rate)}
        />
      </div>

      <section className={PATTERN_POSTS_SECTION_CLASS}>
        <div className={PATTERN_POSTS_HEADER_CLASS}>
          <div>
            <h2 className={cardTitleClasses}>Selected posts</h2>
            <p className={PATTERN_SUPPORTING_CLASS}>
              {postNotice ?? "Proof from the current Instagram set."}
            </p>
          </div>
        </div>
        <div className={PATTERN_POSTS_PANEL_CLASS}>
          {visiblePosts.map((post, index) => (
            <Card
              key={post.id}
              variant="outlined"
              shape="rounded"
              className={PATTERN_POST_CARD_CLASS}
            >
              <Card.Header
                end={
                  <MoreMenu
                    aria-label={`Manage selected post ${index + 1}`}
                    size="xs"
                    items={[
                      {
                        id: "hide",
                        label: "Hide from kit",
                        start: <EyeOff />,
                      },
                    ]}
                    onAction={(actionId) => handlePostAction(post.id, actionId)}
                  />
                }
              />
              <Card.Body>
                <img
                  className={PATTERN_POST_IMAGE_CLASS}
                  src={publicObjectUrl(post.r2_key)}
                  alt=""
                />
              </Card.Body>
              <Card.Footer>
                <div className={PATTERN_KIT_POST_METRICS_CLASS}>
                  {(
                    [
                      ["Likes", post.like_count],
                      ["Comments", post.comments_count],
                    ] as const
                  ).map(([label, value]) => (
                    <span key={label} className={PATTERN_POST_METRIC_CLASS}>
                      <span className={PATTERN_POST_METRIC_LABEL_CLASS}>{label}</span>
                      <span className={PATTERN_POST_METRIC_VALUE_CLASS}>
                        {compactNumber.format(value)}
                      </span>
                    </span>
                  ))}
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </section>

      {contactDetail ? (
        <section className={PATTERN_POSTS_SECTION_CLASS}>
          <div className={PATTERN_POSTS_HEADER_CLASS}>
            <div>
              <h2 className={cardTitleClasses}>Contact</h2>
              <p className={PATTERN_SUPPORTING_CLASS}>
                Creator-entered details for brand outreach.
              </p>
            </div>
          </div>
          <Card
            variant="outlined"
            padding="md"
            shape="rounded"
            className={PATTERN_CONTACT_CARD_CLASS}
          >
            <div className={PATTERN_CONTACT_ROWS_CLASS}>
              {contactDetail.kind === "email" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Email</span>
                  <TextLink href={contactDetail.href}>{contactDetail.value}</TextLink>
                </div>
              ) : null}
              {contactDetail.kind === "website" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Website</span>
                  <TextLink href={contactDetail.href} external>
                    {contactDetail.value}
                  </TextLink>
                </div>
              ) : null}
              {contactDetail.kind === "text" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Contact</span>
                  <span className={PATTERN_SUPPORTING_CLASS}>{contactDetail.value}</span>
                </div>
              ) : null}
            </div>
          </Card>
        </section>
      ) : null}

      {shouldShowPastBrands(brands) ? (
        <section className={PATTERN_POSTS_SECTION_CLASS}>
          <div className={PATTERN_POSTS_HEADER_CLASS}>
            <div>
              <h2 className={cardTitleClasses}>Past brands</h2>
              <p className={PATTERN_SUPPORTING_CLASS}>
                Campaigns already shipped with this creator.
              </p>
            </div>
          </div>
          <div className={PATTERN_POSTS_PANEL_CLASS}>
            {brands.map((name) => (
              <Card
                key={name}
                variant="outlined"
                shape="rounded"
                className={PATTERN_POST_CARD_CLASS}
              >
                <Card.Header start={<h3 className={cardTitleClasses}>{name}</h3>} />
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <AlertDialog
        open={pendingHidePostId != null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingHidePostId(null);
          }
        }}
        title="Hide this post from PitchKit?"
        description="It will no longer appear in the shareable PitchKit. You can add it back later."
        cancelLabel="Keep post"
        confirmLabel="Hide from kit"
        onConfirm={() => {
          void hidePendingPost();
        }}
      />
    </>
  );
}
