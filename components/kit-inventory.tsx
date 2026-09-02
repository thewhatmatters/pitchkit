"use client";

import type { ReactNode } from "react";
import { Card, Chip, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import { EmptyGrid } from "@/components/empty-grid";
import {
  CHART_SLOT_LABEL,
  CHART_SLOT_NOTE,
  CITY_MIX_CAPTION,
  COUNTRY_MIX_CAPTION,
  ER_FORMULA,
  ER_TOOLTIP,
  EXAMPLE_DATA_NOTE,
  HIDDEN_WHEN_BLANK,
  SAVES_CAPTION,
  TYPICAL_REACH_CAPTION,
} from "@/lib/copy";
import { formatCount, formatEngagementRate } from "@/lib/engagement";
import { buildExampleInventory } from "@/lib/inventory-example";
import { publicObjectUrl } from "@/lib/r2";
import type { Media } from "@/lib/schema";

type KitInventoryProps = {
  posts: Media[];
  followers: number;
  gridReady: boolean;
};

function ExampleChip() {
  return (
    <Chip readOnly size="sm">
      Example
    </Chip>
  );
}

function InventoryCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" shape="rounded" padding="md">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cardTitleClasses}>{label}</p>
          <ExampleChip />
        </div>
        {children}
      </div>
    </Card>
  );
}

function ShareList({ rows }: { rows: Array<{ label: string; percent: number }> }) {
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((row) => (
        <li key={row.label} className={cardBodyTextClasses}>
          {row.label} {row.percent}%
        </li>
      ))}
    </ul>
  );
}

export function KitInventory({ posts, followers, gridReady }: KitInventoryProps) {
  const inventory = buildExampleInventory(posts, followers);

  return (
    <div className="flex flex-col gap-4">
      <Card variant="outlined" shape="rounded" padding="md">
        <div className="flex flex-col gap-2">
          <Chip readOnly>{inventory.banner}</Chip>
          <p className={cardBodyTextClasses}>{EXAMPLE_DATA_NOTE}</p>
        </div>
      </Card>

      <InventoryCard label="Engagement rate">
        <p className={cardTitleClasses}>{formatEngagementRate(inventory.engagementRate)}</p>
        <p className={cardBodyTextClasses} title={ER_TOOLTIP}>
          {ER_FORMULA}
        </p>
        <p className={cardBodyTextClasses}>{ER_TOOLTIP}</p>
      </InventoryCard>

      <InventoryCard label="Followers">
        <p className={cardTitleClasses}>{formatCount(inventory.followers)}</p>
      </InventoryCard>

      <InventoryCard label="Typical reach">
        <p className={cardTitleClasses}>{formatCount(inventory.typicalReach)}</p>
        <p className={cardBodyTextClasses}>{TYPICAL_REACH_CAPTION}</p>
      </InventoryCard>

      <InventoryCard label="Saves">
        <p className={cardTitleClasses}>{formatCount(inventory.typicalSaves)}</p>
        <p className={cardBodyTextClasses}>{SAVES_CAPTION}</p>
      </InventoryCard>

      <InventoryCard label={CHART_SLOT_LABEL}>
        <div
          data-chart-slot="empty"
          className="min-h-32"
          aria-label={CHART_SLOT_LABEL}
        />
        <p className={cardBodyTextClasses}>{CHART_SLOT_NOTE}</p>
      </InventoryCard>

      <InventoryCard label="Six posts">
        <p className={cardBodyTextClasses}>Ranked saves → reach → likes. Last 30 days.</p>
        {gridReady ? (
          <ol className="flex flex-col gap-3">
            {inventory.posts.map((post, index) => (
              <li key={post.id} className="flex gap-3">
                <img
                  src={publicObjectUrl(post.r2_key)}
                  alt=""
                  width={72}
                  height={72}
                />
                <div className="flex flex-col gap-1">
                  <p className={cardTitleClasses}>
                    {index + 1}. {post.media_type}
                  </p>
                  <p className={cardBodyTextClasses}>
                    {formatCount(post.saves)} saves · {formatCount(post.reach)} reach ·{" "}
                    {formatCount(post.like_count)} likes
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyGrid />
        )}
      </InventoryCard>

      <InventoryCard label="Country mix">
        <p className={cardBodyTextClasses}>{COUNTRY_MIX_CAPTION}</p>
        <ShareList rows={inventory.countryMix} />
      </InventoryCard>

      <InventoryCard label="City mix">
        <p className={cardBodyTextClasses}>{CITY_MIX_CAPTION}</p>
        <ShareList rows={inventory.cityMix} />
      </InventoryCard>

      <InventoryCard label="Age mix">
        <ShareList
          rows={inventory.ageMix.map((row) => ({
            label: row.bracket,
            percent: row.percent,
          }))}
        />
      </InventoryCard>

      <InventoryCard label="Gender mix">
        <ShareList
          rows={inventory.genderMix.map((row) => ({
            label: `${row.label} (${row.bucket})`,
            percent: row.percent,
          }))}
        />
      </InventoryCard>

      <InventoryCard label="Bio">
        <p className={cardBodyTextClasses}>{inventory.bio}</p>
        <p className={cardBodyTextClasses}>{HIDDEN_WHEN_BLANK}</p>
      </InventoryCard>

      <InventoryCard label="Website">
        <p className={cardBodyTextClasses}>{inventory.website}</p>
        <p className={cardBodyTextClasses}>{HIDDEN_WHEN_BLANK}</p>
      </InventoryCard>
    </div>
  );
}
