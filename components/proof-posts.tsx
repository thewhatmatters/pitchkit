"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PATTERN_POST_CARD_CLASS,
  PATTERN_POST_HEADER_START_CLASS,
  PATTERN_POST_IMAGE_CLASS,
  PATTERN_POST_METRIC_CLASS,
  PATTERN_POST_METRIC_LABEL_CLASS,
  PATTERN_POST_METRIC_VALUE_CLASS,
  PATTERN_POST_METRICS_CLASS,
  PATTERN_POSTS_HEADER_CLASS,
  PATTERN_POSTS_PANEL_CLASS,
  PATTERN_POSTS_SECTION_CLASS,
  PATTERN_POSTS_TABS_CLASS,
  PATTERN_SUPPORTING_CLASS,
} from "@/components/pattern-tokens";
import { Badge, Card, Tab, cardSubtitleClasses, cardTitleClasses } from "@/components/wmds";
import { partitionOwnerProofPosts } from "@/lib/kit-visibility";
import { formatPostedAt } from "@/lib/posted-at";
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

type ProofPostsProps = {
  posts: Media[];
  hasInsights: boolean;
  onPostsChange?: (posts: Media[] | ((current: Media[]) => Media[])) => void;
};

export function ProofPosts({ posts, hasInsights }: ProofPostsProps) {
  const [ownerPosts, setOwnerPosts] = useState(posts);
  const [proofMetric, setProofMetric] = useState<PostSortKey>(DEFAULT_POST_SORT);

  useEffect(() => {
    setOwnerPosts(posts);
  }, [posts]);

  const { shown, hidden } = useMemo(() => partitionOwnerProofPosts(ownerPosts), [ownerPosts]);
  const rankedPosts = useMemo(() => sortPosts(shown, proofMetric), [proofMetric, shown]);

  return (
    <section className={PATTERN_POSTS_SECTION_CLASS}>
      <div className={PATTERN_POSTS_HEADER_CLASS}>
        <div>
          <h2 className={cardTitleClasses}>Recent proof</h2>
          <p className={PATTERN_SUPPORTING_CLASS}>{proofMetricNotices[proofMetric]}</p>
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
          }
        }}
        className={PATTERN_POSTS_TABS_CLASS}
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
      <div id="recent-proof-panel" role="tabpanel" className={PATTERN_POSTS_PANEL_CLASS}>
        {rankedPosts.map((post, index) => (
          <ProofPostCard
            key={post.id}
            post={post}
            displayRank={index + 1}
            hidden={false}
            hasInsights={hasInsights}
          />
        ))}
        {hidden.map((post) => (
          <ProofPostCard
            key={post.id}
            post={post}
            displayRank={null}
            hidden
            hasInsights={hasInsights}
          />
        ))}
      </div>
    </section>
  );
}

function ProofPostCard({
  post,
  displayRank,
  hidden,
  hasInsights,
}: {
  post: Media;
  displayRank: number | null;
  hidden: boolean;
  hasInsights: boolean;
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
      className={`${PATTERN_POST_CARD_CLASS}${hidden ? " text-muted" : ""}`}
    >
      <Card.Header
        start={
          <span className={PATTERN_POST_HEADER_START_CLASS}>
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
      />
      <Card.Body>
        <img
          className={PATTERN_POST_IMAGE_CLASS}
          src={publicObjectUrl(post.r2_key)}
          alt=""
        />
      </Card.Body>
      <Card.Footer>
        <div className={PATTERN_POST_METRICS_CLASS}>
          {metrics.map(([label, value]) => (
            <span key={label} className={PATTERN_POST_METRIC_CLASS}>
              <span className={PATTERN_POST_METRIC_LABEL_CLASS}>{label}</span>
              <span className={PATTERN_POST_METRIC_VALUE_CLASS}>
                {value == null ? "—" : compactNumber.format(value)}
              </span>
            </span>
          ))}
        </div>
      </Card.Footer>
    </Card>
  );
}
