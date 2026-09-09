"use client";

import { useEffect, useMemo, useState } from "react";
import { EyeOff, Repeat2, Undo2 } from "lucide-react";
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
import {
  clearHiddenFromKit,
  hideFromKit,
  partitionOwnerProofPosts,
  restoreToKit,
  stampHiddenFromKit,
} from "@/lib/kit-visibility";
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
  const [ownerPosts, setOwnerPosts] = useState(posts);
  const [proofMetric, setProofMetric] = useState<PostSortKey>(DEFAULT_POST_SORT);
  const [postNotice, setPostNotice] = useState<string | null>(null);
  const [pendingHidePostId, setPendingHidePostId] = useState<string | null>(null);

  useEffect(() => {
    setOwnerPosts(posts);
  }, [posts]);

  const { shown, hidden } = useMemo(() => partitionOwnerProofPosts(ownerPosts), [ownerPosts]);
  const rankedPosts = useMemo(() => sortPosts(shown, proofMetric), [proofMetric, shown]);

  function handlePostAction(postId: string, actionId: string) {
    if (actionId === "hide") {
      setPendingHidePostId(postId);
      return;
    }
    if (actionId === "restore") {
      const hiddenPost = ownerPosts.find((post) => post.id === postId);
      if (hiddenPost != null) {
        void restoreHiddenPost(hiddenPost);
      }
      return;
    }
    setPostNotice("Swap is not wired. Backend will own replacement selection.");
  }

  async function handleConfirmHide() {
    if (pendingHidePostId == null) {
      return;
    }
    const hiddenPost = shown.find((post) => post.id === pendingHidePostId);
    if (hiddenPost == null) {
      setPendingHidePostId(null);
      return;
    }

    const optimisticHiddenAt = new Date().toISOString();
    setOwnerPosts((current) => stampHiddenFromKit(current, hiddenPost.id, optimisticHiddenAt));
    setPostNotice("Post hidden from the shareable kit preview.");
    setPendingHidePostId(null);

    const result = await hideFromKit(hiddenPost.id);
    if (!result.ok) {
      setOwnerPosts((current) => clearHiddenFromKit(current, hiddenPost.id));
      setPostNotice(result.error);
      return;
    }

    if (result.hiddenFromKitAt != null) {
      setOwnerPosts((current) =>
        current.map((post) =>
          post.id === hiddenPost.id ? { ...post, hidden_from_kit_at: result.hiddenFromKitAt } : post,
        ),
      );
    }

    toast.add({
      title: "Post hidden from kit",
      description: "It no longer appears in the shareable PitchKit.",
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          void restoreHiddenPost({ ...hiddenPost, hidden_from_kit_at: result.hiddenFromKitAt });
        },
      },
    });
  }

  async function restoreHiddenPost(hiddenPost: Media) {
    const previousHiddenAt = hiddenPost.hidden_from_kit_at;
    setOwnerPosts((current) => clearHiddenFromKit(current, hiddenPost.id));
    setPostNotice("Post restored to the shareable kit preview.");
    const result = await restoreToKit(hiddenPost.id);
    if (!result.ok) {
      if (previousHiddenAt != null) {
        setOwnerPosts((current) => stampHiddenFromKit(current, hiddenPost.id, previousHiddenAt));
      }
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
          {shown.length} shown
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
            hidden={false}
            hasInsights={hasInsights}
            onAction={handlePostAction}
          />
        ))}
        {hidden.map((post) => (
          <ProofPostCard
            key={post.id}
            post={post}
            displayRank={null}
            hidden
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
  hidden,
  hasInsights,
  onAction,
}: {
  post: Media;
  displayRank: number | null;
  hidden: boolean;
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
    <Card
      variant="outlined"
      shape="rounded"
      className={`col-span-full min-w-0 md:col-span-4 lg:col-span-4${hidden ? " text-muted" : ""}`}
    >
      <Card.Header
        start={
          <span className="flex items-center gap-2">
            {hidden ? (
              <Badge variant="neutral" emphasis="muted" size="sm">
                Hidden
              </Badge>
            ) : (
              <Badge size="sm">#{displayRank}</Badge>
            )}
            <span className={cardSubtitleClasses}>{formatPostedAt(post.posted_at)}</span>
          </span>
        }
        end={
          <MoreMenu
            aria-label={hidden ? "Manage hidden post" : `Manage ranked post ${displayRank}`}
            size="xs"
            items={
              hidden
                ? [
                    {
                      id: "restore",
                      label: "Restore to kit",
                      start: <Undo2 />,
                    },
                  ]
                : [
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
                  ]
            }
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
