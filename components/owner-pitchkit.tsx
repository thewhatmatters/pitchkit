"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EyeOff, Undo2 } from "lucide-react";
import { OwnerIntroEditor } from "@/components/kit-intro";
import { OwnerPastBrands } from "@/components/past-brands";
import {
  PATTERN_HEADER_COPY_CLASS,
  PATTERN_HEADER_SECTION_CLASS,
  PATTERN_POST_CARD_CLASS,
  PATTERN_POST_HEADER_START_CLASS,
  PATTERN_POST_IMAGE_CLASS,
  PATTERN_POSTS_HEADER_CLASS,
  PATTERN_POSTS_PANEL_CLASS,
  PATTERN_POSTS_SECTION_CLASS,
  PATTERN_SUPPORTING_CLASS,
  PATTERN_THEME_KIT_CLASS,
} from "@/components/pattern-tokens";
import { ShareableKit } from "@/components/shareable-kit";
import { ShareKitButton } from "@/components/share-kit-button";
import {
  AlertDialog,
  Badge,
  Card,
  MoreMenu,
  PageHeader,
  cardSubtitleClasses,
  cardTitleClasses,
  toast,
} from "@/components/wmds";
import type { RankedShare } from "@/lib/audience";
import {
  PITCHKIT_OWNER_SUPPORTING,
  PITCHKIT_OWNER_TITLE,
  TOAST_HIDE_FAILED_TITLE,
  TOAST_KIT_PROFILE_FAILED_DESCRIPTION,
  TOAST_KIT_PROFILE_FAILED_TITLE,
  TOAST_POST_HIDDEN_DESCRIPTION,
  TOAST_POST_HIDDEN_TITLE,
  TOAST_POST_RESTORED_DESCRIPTION,
  TOAST_POST_RESTORED_TITLE,
  TOAST_RESTORE_FAILED_TITLE,
} from "@/lib/copy";
import { saveKitProfile } from "@/lib/kit-profile-client";
import {
  PITCHKIT_INTRO_SAVE_DEBOUNCE_MS,
  PITCHKIT_THEME_DEFAULT,
  normalizeIntro,
  type IntroSaveState,
  type KitProfile,
  type PastBrand,
  type PitchKitTheme,
} from "@/lib/kit-profile";
import {
  clearHiddenFromKit,
  hideFromKit,
  partitionOwnerProofPosts,
  restoreToKit,
  stampHiddenFromKit,
} from "@/lib/kit-visibility";
import { excludeHiddenFromPublicKit, selectSixPosts } from "@/lib/kit";
import { formatPostedAt } from "@/lib/posted-at";
import { publicObjectUrl } from "@/lib/r2";
import type { ReachPoint } from "@/lib/reach-series";
import type { Media, User } from "@/lib/schema";

export type OwnerPostsUpdater = Media[] | ((current: Media[]) => Media[]);

type OwnerPitchKitProps = {
  user: User;
  posts: Media[];
  onPostsChange: (posts: OwnerPostsUpdater) => void;
  engagementRate: number | null;
  typicalReach?: number | null;
  typicalSaves?: number | null;
  reachSeries?: ReachPoint[] | null;
  hasInsights?: boolean;
  countries?: readonly RankedShare[];
  intro?: string | null;
  pastBrands?: readonly PastBrand[];
  theme?: PitchKitTheme;
  contact?: string | null;
};

/**
 * Pattern — owner PitchKit (`examples-pitchkit--owner-pitch-kit`)
 * plus Pattern — intro (owner) (`examples-pitchkit--intro-owner`)
 * plus Pattern — past brands (owner) (`examples-pitchkit--past-brands-owner`).
 * Theme picker chrome is off; stored theme (default light) still paints `data-theme`.
 * Kit body is the same shareable composition as `/k/[handle]` — 4 KPIs, full-width
 * reach + countries — plus hide/restore and intro/brands editors.
 */
export function OwnerPitchKit({
  user,
  posts,
  onPostsChange,
  engagementRate,
  typicalReach = null,
  typicalSaves = null,
  reachSeries = null,
  hasInsights = false,
  countries = [],
  intro: introProp = null,
  pastBrands = [],
  theme: themeProp = PITCHKIT_THEME_DEFAULT,
  contact = null,
}: OwnerPitchKitProps) {
  const [postNotice, setPostNotice] = useState<string | null>(null);
  const [pendingHidePostId, setPendingHidePostId] = useState<string | null>(null);
  const [intro, setIntro] = useState(introProp ?? "");
  const [brands, setBrands] = useState<PastBrand[]>(() => [...pastBrands]);
  const [savedTheme, setSavedTheme] = useState<PitchKitTheme>(themeProp);
  const introSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIntro = useRef<string | null>(null);
  const introSaveSeq = useRef(0);
  const [introSaveState, setIntroSaveState] = useState<IntroSaveState>("idle");

  useEffect(() => {
    setIntro(introProp ?? "");
  }, [introProp]);

  useEffect(() => {
    setBrands([...pastBrands]);
  }, [pastBrands]);

  useEffect(() => {
    setSavedTheme(themeProp);
  }, [themeProp]);

  useEffect(() => {
    return () => {
      if (introSaveTimer.current) {
        clearTimeout(introSaveTimer.current);
      }
    };
  }, []);

  const visiblePosts = useMemo(
    () => selectSixPosts(excludeHiddenFromPublicKit(posts)),
    [posts],
  );
  const { hidden } = useMemo(() => partitionOwnerProofPosts(posts), [posts]);

  async function persistProfile(profile: KitProfile) {
    const result = await saveKitProfile(profile);
    if (!result.ok) {
      toast.add({
        title: TOAST_KIT_PROFILE_FAILED_TITLE,
        description: result.error || TOAST_KIT_PROFILE_FAILED_DESCRIPTION,
      });
      return false;
    }
    return true;
  }

  function currentProfile(overrides: Partial<KitProfile> = {}): KitProfile {
    return {
      intro: normalizeIntro(intro),
      past_brands: brands,
      theme: savedTheme,
      ...overrides,
    };
  }

  async function flushIntroSave() {
    if (introSaveTimer.current) {
      clearTimeout(introSaveTimer.current);
      introSaveTimer.current = null;
    }
    const value = pendingIntro.current;
    if (value == null) {
      return;
    }
    pendingIntro.current = null;
    const seq = ++introSaveSeq.current;
    setIntroSaveState("saving");
    const ok = await persistProfile(currentProfile({ intro: normalizeIntro(value) }));
    // A newer keystroke owns the state once it has started its own save.
    if (seq === introSaveSeq.current && pendingIntro.current == null) {
      setIntroSaveState(ok ? "saved" : "error");
    }
  }

  function handleIntroChange(value: string) {
    setIntro(value);
    pendingIntro.current = value;
    setIntroSaveState("saving");
    if (introSaveTimer.current) {
      clearTimeout(introSaveTimer.current);
    }
    introSaveTimer.current = setTimeout(() => {
      void flushIntroSave();
    }, PITCHKIT_INTRO_SAVE_DEBOUNCE_MS);
  }

  function handleBrandsChange(next: PastBrand[]) {
    setBrands(next);
    void persistProfile(currentProfile({ past_brands: next }));
  }

  function handlePostAction(postId: string, actionId: string) {
    if (actionId === "hide") {
      setPendingHidePostId(postId);
      return;
    }
    if (actionId === "restore") {
      const hiddenPost = posts.find((post) => post.id === postId);
      if (hiddenPost != null) {
        void restoreHiddenPost(hiddenPost);
      }
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
    <div data-theme={savedTheme} className={PATTERN_THEME_KIT_CLASS}>
      <section className={PATTERN_HEADER_SECTION_CLASS}>
        <PageHeader
          variant="page"
          title={PITCHKIT_OWNER_TITLE}
          end={<ShareKitButton handle={user.handle} />}
        />
        <div className={PATTERN_HEADER_COPY_CLASS}>
          <p className={PATTERN_SUPPORTING_CLASS}>{PITCHKIT_OWNER_SUPPORTING}</p>
        </div>
      </section>

      <ShareableKit
        user={user}
        posts={visiblePosts}
        engagementRate={engagementRate}
        typicalReach={typicalReach}
        typicalSaves={typicalSaves}
        reachSeries={reachSeries}
        hasInsights={hasInsights}
        countries={countries}
        pastBrands={brands}
        intro={intro}
        contact={contact}
        showCreateBand={false}
        postNotice={postNotice}
        introSlot={(
          <OwnerIntroEditor
            intro={intro}
            onIntroChange={handleIntroChange}
            onIntroBlur={() => void flushIntroSave()}
            saveState={introSaveState}
          />
        )}
        brandsSlot={<OwnerPastBrands brands={brands} onBrandsChange={handleBrandsChange} />}
        renderPostHeader={(post, index) => (
          <Card.Header
            start={
              <span className={cardSubtitleClasses}>{formatPostedAt(post.posted_at)}</span>
            }
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
        )}
      />

      {hidden.length > 0 ? (
        <section className={PATTERN_POSTS_SECTION_CLASS}>
          <div className={PATTERN_POSTS_HEADER_CLASS}>
            <div>
              <h2 className={cardTitleClasses}>Hidden from kit</h2>
              <p className={PATTERN_SUPPORTING_CLASS}>
                Restore a post to show it on your public kit.
              </p>
            </div>
          </div>
          <div className={PATTERN_POSTS_PANEL_CLASS}>
            {hidden.map((post) => (
              <Card
                key={post.id}
                variant="outlined"
                shape="rounded"
                className={`${PATTERN_POST_CARD_CLASS} text-muted`}
              >
                <Card.Header
                  start={
                    <span className={PATTERN_POST_HEADER_START_CLASS}>
                      <Badge variant="neutral" emphasis="muted" size="sm">
                        Hidden
                      </Badge>
                      <span className={cardSubtitleClasses}>{formatPostedAt(post.posted_at)}</span>
                    </span>
                  }
                  end={
                    <MoreMenu
                      aria-label="Manage hidden post"
                      size="xs"
                      items={[
                        {
                          id: "restore",
                          label: "Restore to kit",
                          start: <Undo2 />,
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
    </div>
  );
}
