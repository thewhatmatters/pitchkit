"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EyeOff } from "lucide-react";
import { OwnerIntroEditor } from "@/components/kit-intro";
import { OwnerPastBrands } from "@/components/past-brands";
import {
  PATTERN_HEADER_COPY_CLASS,
  PATTERN_HEADER_SECTION_CLASS,
  PATTERN_SUPPORTING_CLASS,
  PATTERN_THEME_KIT_CLASS,
  PATTERN_THEME_TOOLBAR_CLASS,
} from "@/components/pattern-tokens";
import { ShareableKit } from "@/components/shareable-kit";
import { ShareKitButton } from "@/components/share-kit-button";
import {
  AlertDialog,
  Button,
  Card,
  MoreMenu,
  PageHeader,
  SegmentedControl,
  cardSubtitleClasses,
  toast,
} from "@/components/wmds";
import type { RankedShare } from "@/lib/audience";
import {
  TOAST_HIDE_FAILED_TITLE,
  TOAST_KIT_PROFILE_FAILED_DESCRIPTION,
  TOAST_KIT_PROFILE_FAILED_TITLE,
  TOAST_POST_HIDDEN_DESCRIPTION,
  TOAST_POST_HIDDEN_TITLE,
  TOAST_POST_RESTORED_DESCRIPTION,
  TOAST_POST_RESTORED_TITLE,
  TOAST_RESTORE_FAILED_TITLE,
  TOAST_THEME_SAVED_TITLE,
  toastThemeSavedDescription,
} from "@/lib/copy";
import { saveKitProfile } from "@/lib/kit-profile-client";
import {
  PITCHKIT_THEME_DEFAULT,
  PITCHKIT_THEMES,
  normalizeIntro,
  type KitProfile,
  type PastBrand,
  type PitchKitTheme,
} from "@/lib/kit-profile";
import {
  clearHiddenFromKit,
  hideFromKit,
  restoreToKit,
  stampHiddenFromKit,
} from "@/lib/kit-visibility";
import { excludeHiddenFromPublicKit, selectSixPosts } from "@/lib/kit";
import { formatPostedAt } from "@/lib/posted-at";
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
 * plus Pattern — theme picker (owner) (`examples-pitchkit--theme-picker-owner`)
 * plus Pattern — intro (owner) (`examples-pitchkit--intro-owner`)
 * plus Pattern — past brands (owner) (`examples-pitchkit--past-brands-owner`).
 * Theme pick restyles the in-page kit only; Save theme commits to the KV Graph snapshot.
 * Show code (`122ab5d`) paints `data-theme={draftTheme}` on `<main>` and mounts
 * ShareablePitchKit as a sibling of Theme + Light | Dark | Soft (`showCreateBand={false}`).
 * Product scopes that attribute to the PitchKit tab so Insights stays on the page default.
 * Kit body is the same shareable composition as `/k/[handle]`, flush under Theme —
 * no nested Public kit preview / second PitchKit wordmark.
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
  const [draftTheme, setDraftTheme] = useState<PitchKitTheme>(themeProp);
  const [savedTheme, setSavedTheme] = useState<PitchKitTheme>(themeProp);
  const introSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyTheme = draftTheme !== savedTheme;

  useEffect(() => {
    setIntro(introProp ?? "");
  }, [introProp]);

  useEffect(() => {
    setBrands([...pastBrands]);
  }, [pastBrands]);

  useEffect(() => {
    setDraftTheme(themeProp);
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

  function handleIntroChange(value: string) {
    setIntro(value);
    if (introSaveTimer.current) {
      clearTimeout(introSaveTimer.current);
    }
    introSaveTimer.current = setTimeout(() => {
      void persistProfile(currentProfile({ intro: normalizeIntro(value) }));
    }, 400);
  }

  function handleBrandsChange(next: PastBrand[]) {
    setBrands(next);
    void persistProfile(currentProfile({ past_brands: next }));
  }

  async function saveTheme() {
    if (!dirtyTheme) {
      return;
    }
    const ok = await persistProfile(currentProfile({ theme: draftTheme }));
    if (!ok) {
      return;
    }
    setSavedTheme(draftTheme);
    toast.add({
      title: TOAST_THEME_SAVED_TITLE,
      description: toastThemeSavedDescription(draftTheme),
    });
  }

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
    <div data-theme={draftTheme} className={PATTERN_THEME_KIT_CLASS}>
      <section className={PATTERN_HEADER_SECTION_CLASS}>
        <PageHeader
          variant="page"
          title="Theme"
          end={
            <div className="flex flex-wrap items-center gap-3">
              <ShareKitButton handle={user.handle} />
              <Button
                role="primary"
                size="sm"
                disabled={!dirtyTheme}
                onClick={() => {
                  void saveTheme();
                }}
              >
                Save theme
              </Button>
            </div>
          }
        />
        <div className={PATTERN_HEADER_COPY_CLASS}>
          <p className={PATTERN_SUPPORTING_CLASS}>
            Choose a look for your public Pitchkit. Changes apply when you save.
          </p>
        </div>
      </section>

      <div className={PATTERN_THEME_TOOLBAR_CLASS}>
        <SegmentedControl
          aria-label="Kit theme"
          size="sm"
          value={draftTheme}
          onValueChange={(value) => setDraftTheme(value as PitchKitTheme)}
        >
          {PITCHKIT_THEMES.map((theme) => (
            <SegmentedControl.Item key={theme} value={theme}>
              {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Soft"}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>

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
        introSlot={<OwnerIntroEditor intro={intro} onIntroChange={handleIntroChange} />}
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
