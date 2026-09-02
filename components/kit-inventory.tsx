"use client";

import type { ReactNode } from "react";
import { Card, Chip, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import { PostGrid } from "@/components/post-grid";
import { formatCount, formatEngagementRate } from "@/lib/engagement";
import {
  CHART_SLOT_CAPTION,
  CHART_SLOT_TITLE,
  CITY_MIX_CAPTION,
  COUNTRY_MIX_CAPTION,
  ENGAGEMENT_FORMULA,
  EXAMPLE_AGE_MIX,
  EXAMPLE_CITY_MIX,
  EXAMPLE_COUNTRY_MIX,
  EXAMPLE_DATA_NOTE,
  EXAMPLE_GENDER_MIX,
  EXAMPLE_TYPICAL_REACH,
  EXAMPLE_TYPICAL_SAVES,
  HIDDEN_WHEN_BLANK,
  INVENTORY_BIO,
  INVENTORY_INTRO,
  INVENTORY_TITLE,
  INVENTORY_WEBSITE,
  SIX_POSTS_RANK,
  TYPICAL_REACH_CAPTION,
  TYPICAL_SAVES_CAPTION,
  formatShare,
  type InventoryItemId,
  type RankedShare,
} from "@/lib/inventory";
import type { Media, User } from "@/lib/schema";

type KitInventoryProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
};

function ExampleChip() {
  return (
    <Chip readOnly size="sm">
      {EXAMPLE_DATA_NOTE}
    </Chip>
  );
}

function InventoryCard({
  id,
  title,
  example,
  children,
}: {
  id: InventoryItemId;
  title: string;
  example?: boolean;
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" shape="rounded" padding="none" data-inventory-item={id}>
      <Card.Header>
        <div className="flex flex-col gap-2">
          <p className={cardTitleClasses}>{title}</p>
          {example ? <ExampleChip /> : null}
        </div>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-2 p-3">{children}</div>
      </Card.Body>
    </Card>
  );
}

function ShareList({ rows }: { rows: RankedShare[] }) {
  return (
    <div className="flex flex-col gap-1">
      {rows.map((row) => (
        <p key={row.label} className={cardBodyTextClasses}>
          {formatShare(row)}
        </p>
      ))}
    </div>
  );
}

function HiddenWhenBlank({ value }: { value: string | null }) {
  if (value) {
    return <p className={cardTitleClasses}>{value}</p>;
  }

  return <p className={cardBodyTextClasses}>{HIDDEN_WHEN_BLANK}</p>;
}

export function KitInventory({ user, posts, engagementRate }: KitInventoryProps) {
  return (
    <section aria-label={INVENTORY_TITLE} className="flex flex-col gap-4" data-inventory="static">
      <Card variant="outlined" shape="rounded" padding="none">
        <Card.Header>
          <p className={cardTitleClasses}>{INVENTORY_TITLE}</p>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col gap-2 p-3">
            <p className={cardBodyTextClasses}>{INVENTORY_INTRO}</p>
            <ExampleChip />
          </div>
        </Card.Body>
      </Card>

      <InventoryCard id="engagement-rate" title="Engagement rate">
        <p className={cardTitleClasses}>{formatEngagementRate(engagementRate)}</p>
        <p className={cardBodyTextClasses}>{ENGAGEMENT_FORMULA}</p>
        <p className={cardBodyTextClasses}>
          Demo seed math from public likes and comments on the six posts. Seed Insights are
          missing.
        </p>
      </InventoryCard>

      <InventoryCard id="followers" title="Followers">
        <p className={cardTitleClasses}>{formatCount(user.followers)}</p>
        <p className={cardBodyTextClasses}>Count from the demo seed profile.</p>
      </InventoryCard>

      <InventoryCard id="typical-reach" title="Typical reach" example>
        <p className={cardTitleClasses}>{formatCount(EXAMPLE_TYPICAL_REACH)}</p>
        <p className={cardBodyTextClasses}>{TYPICAL_REACH_CAPTION}</p>
      </InventoryCard>

      <InventoryCard id="saves" title="Saves" example>
        <p className={cardTitleClasses}>{formatCount(EXAMPLE_TYPICAL_SAVES)}</p>
        <p className={cardBodyTextClasses}>{TYPICAL_SAVES_CAPTION}</p>
      </InventoryCard>

      <InventoryCard id="reach-chart" title={CHART_SLOT_TITLE}>
        <p className={cardBodyTextClasses}>{CHART_SLOT_CAPTION}</p>
        <div aria-label={CHART_SLOT_TITLE} data-chart-slot="empty" />
      </InventoryCard>

      <InventoryCard id="six-posts" title="Six posts">
        <p className={cardBodyTextClasses}>{SIX_POSTS_RANK}</p>
        <PostGrid posts={posts} hasInsights={false} />
      </InventoryCard>

      <InventoryCard id="country-mix" title="Country mix" example>
        <p className={cardBodyTextClasses}>{COUNTRY_MIX_CAPTION}</p>
        <ShareList rows={EXAMPLE_COUNTRY_MIX} />
      </InventoryCard>

      <InventoryCard id="city-mix" title="City mix" example>
        <p className={cardBodyTextClasses}>{CITY_MIX_CAPTION}</p>
        <ShareList rows={EXAMPLE_CITY_MIX} />
      </InventoryCard>

      <InventoryCard id="age-mix" title="Age mix" example>
        <p className={cardBodyTextClasses}>API-style brackets. Do not invent other bands.</p>
        <ShareList rows={EXAMPLE_AGE_MIX} />
      </InventoryCard>

      <InventoryCard id="gender-mix" title="Gender mix" example>
        <p className={cardBodyTextClasses}>What Meta typically returns. Do not add buckets.</p>
        <ShareList rows={EXAMPLE_GENDER_MIX} />
      </InventoryCard>

      <InventoryCard id="bio" title="Bio">
        <HiddenWhenBlank value={INVENTORY_BIO} />
      </InventoryCard>

      <InventoryCard id="website" title="Website">
        <HiddenWhenBlank value={INVENTORY_WEBSITE} />
      </InventoryCard>
    </section>
  );
}
