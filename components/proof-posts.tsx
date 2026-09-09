"use client";

import { useMemo, useState } from "react";
import { EyeOff, Repeat2 } from "lucide-react";
import {
  AlertDialog,
  Badge,
  Card,
  MoreMenu,
  Tab,
  cardLayoutBodyOccupantRadiusClasses,
  cardSubtitleClasses,
  cardTitleClasses,
  toast,
} from "@/components/wmds";
import { applyHide, applyRestore, hideFromKit, restoreToKit } from "@/lib/kit-visibility";
import { DEFAULT_POST_SORT, isPostSortKey, sortPosts, type PostSortKey } from "@/lib/post-sort";
import { publicObjectUrl } from "@/lib/r2";
import type { Media } from "@/lib/schema";

const proofMetricNotices: Record<PostSortKey, string> = {
  reach: "Ranked by Instagram reach.",
  engagement: "Ranked by likes + comments.",
  saves: "Ranked by Instagram saves.",
};

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatPostedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

type ProofPostsProps = {
  posts: Media[];
  hasInsights: boolean;
  loading?: boolean;
};

export function ProofPosts({ posts, hasInsights, loading = false }: ProofPostsProps) {
  const [visiblePosts, setVisiblePosts] = useState(posts);
  const [proofMetric, setProofMetric] = useState<PostSortKey>(DEFAULT_POST_SORT);
  const [postNotice, setPostNotice] = useState<string | null>(null);
  const [pendingHidePostId, setPendingHidePostId] = useState<string | null>(null);

  const rankedPosts = useMemo(
    () => sortPosts(visiblePosts, proofMetric),
    [proofMetric, visiblePosts],
  );

  function handlePostAction(postId: string, actionId: string) {
    if (actionId === "hide") {
      setPendingHidePostId(postId);
      return;
    }
    setPostNotice("Swap is not wired. Backend will own replacement selection.");
  }

  async function handleConfirmHide() {
    if (pendingHidePostId == null) {
      return;
    }
    const hiddenPost = visiblePosts.find((post) => post.id === pendingHidePostId);
    if (hiddenPost == null) {
      setPendingHidePostId(null);
      return;
    }

    setVisiblePosts((current) => applyHide(current, hiddenPost.id));
    setPostNotice("Post hidden from the shareable kit preview.");
    setPendingHidePostId(null);

    const result = await hideFromKit(hiddenPost.id);
    if (!result.ok) {
      setVisiblePosts((current) => applyRestore(current, hiddenPost));
      setPostNotice(result.error);
      return;
    }

    toast.add({
      title: "Post hidden from kit",
      description: "It no longer appears in the shareable PitchKit.",
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          void restoreHiddenPost(hiddenPost);
        },
      },
    });
  }

  async function restoreHiddenPost(hiddenPost: Media) {
    setVisiblePosts((current) => applyRestore(current, hiddenPost));
    setPostNotice("Post restored to the shareable kit preview.");
    const result = await restoreToKit(hiddenPost.id);
    if (!result.ok) {
      setVisiblePosts((current) => applyHide(current, hiddenPost.id));
      setPostNotice(result.error);
    }
  }

  if (loading) {
    return (
      <section className="band col-span-full min-w-0 gap-y-4">
        <h2 className={`${cardTitleClasses} col-span-full`}>Recent proof</h2>
      </section>
    );
  }

  return (
    <section className="band col-span-full min-w-0 gap-y-4">
      <div className="col-span-full flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={cardTitleClasses}>Recent proof</h2>
          <p className="text-muted">{postNotice ?? proofMetricNotices[proofMetric]}</p>
        </div>
        <Badge variant="neutral" emphasis="muted" size="sm">
          {visiblePosts.length} shown
        </Badge>
      </div>
      <Tab.Group
        aria-label="Rank recent proof posts by"
        value={proofMetric}
        onValueChange={(value) => {
          if (isPostSortKey(value)) {
            setProofMetric(value);
            setPostNotice(null);
          }
        }}
        className="col-span-full"
      >
        <Tab value="reach" panelId="recent-proof-panel">
          Reach
        </Tab>
        <Tab value="engagement" panelId="recent-proof-panel">
          Engagement
        </Tab>
        <Tab value="saves" panelId="recent-proof-panel">
          Saves
        </Tab>
      </Tab.Group>
      <div id="recent-proof-panel" role="tabpanel" className="band col-span-full min-w-0 gap-y-4">
        {rankedPosts.map((post, index) => (
          <ProofPostCard
            key={post.id}
            post={post}
            displayRank={index + 1}
            hasInsights={hasInsights}
            onAction={handlePostAction}
          />
        ))}
      </div>
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
          void handleConfirmHide();
        }}
      />
    </section>
  );
}

function ProofPostCard({
  post,
  displayRank,
  hasInsights,
  onAction,
}: {
  post: Media;
  displayRank: number;
  hasInsights: boolean;
  onAction: (postId: string, actionId: string) => void;
}) {
  const metrics: Array<[string, number | null]> = hasInsights
    ? [
        ["Saves", post.saves],
        ["Reach", post.reach],
        ["Likes", post.like_count],
      ]
    : [
        ["Likes", post.like_count],
        ["Comments", post.comments_count],
      ];

  return (
    <Card variant="outlined" shape="rounded" className="col-span-full min-w-0 md:col-span-4 lg:col-span-4">
      <Card.Header
        start={
          <span className="flex items-center gap-2">
            <Badge size="sm">#{displayRank}</Badge>
            <span className={cardSubtitleClasses}>{formatPostedAt(post.posted_at)}</span>
          </span>
        }
        end={
          <MoreMenu
            aria-label={`Manage ranked post ${displayRank}`}
            size="xs"
            items={[
              {
                id: "swap",
                label: "Swap post",
                start: <Repeat2 />,
              },
              {
                id: "hide",
                label: "Hide from kit",
                start: <EyeOff />,
              },
            ]}
            onAction={(actionId) => onAction(post.id, actionId)}
          />
        }
      />
      <Card.Body>
        <img
          className={`aspect-[4/3] w-full bg-body object-cover ${cardLayoutBodyOccupantRadiusClasses}`}
          src={publicObjectUrl(post.r2_key)}
          alt=""
        />
      </Card.Body>
      <Card.Footer>
        <div className="grid w-full grid-cols-3 gap-3">
          {metrics.map(([label, value]) => (
            <span key={label} className="flex min-w-0 flex-col gap-1">
              <span className="text-muted">{label}</span>
              <span className="font-mono text-sm tabular-nums text-fg">
                {value == null ? "—" : compactNumber.format(value)}
              </span>
            </span>
          ))}
        </div>
      </Card.Footer>
    </Card>
  );
}
