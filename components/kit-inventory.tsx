"use client";

import type { ReactNode } from "react";
import { Card, Chip, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import { EmptyGrid } from "@/components/empty-grid";
import { CHART_SLOT_NOTE, EXAMPLE_DATA_NOTE } from "@/lib/copy";
import { ER_FORMULA, ER_TOOLTIP, GLOSSARY } from "@/lib/glossary";
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
  name,
  definition,
  help,
  children,
}: {
  name: string;
  definition: string;
  help: string;
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" shape="rounded" padding="md">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className={cardTitleClasses}>{name}</p>
          <p className={cardBodyTextClasses}>{definition}</p>
          <ExampleChip />
        </div>
        {children}
        <p className={cardBodyTextClasses}>{help}</p>
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

      <InventoryCard
        name={GLOSSARY.engagementRate.name}
        definition={GLOSSARY.engagementRate.definition}
        help={GLOSSARY.engagementRate.help}
      >
        <p className={cardTitleClasses}>{formatEngagementRate(inventory.engagementRate)}</p>
        <p className={cardBodyTextClasses} title={ER_TOOLTIP}>
          {ER_FORMULA}
        </p>
        <p className={cardBodyTextClasses}>{ER_TOOLTIP}</p>
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.followers.name}
        definition={GLOSSARY.followers.definition}
        help={GLOSSARY.followers.help}
      >
        <p className={cardTitleClasses}>{formatCount(inventory.followers)}</p>
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.typicalReach.name}
        definition={GLOSSARY.typicalReach.definition}
        help={GLOSSARY.typicalReach.help}
      >
        <p className={cardTitleClasses}>{formatCount(inventory.typicalReach)}</p>
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.saves.name}
        definition={GLOSSARY.saves.definition}
        help={GLOSSARY.saves.help}
      >
        <p className={cardTitleClasses}>{formatCount(inventory.typicalSaves)}</p>
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.chart.name}
        definition={GLOSSARY.chart.definition}
        help={GLOSSARY.chart.help}
      >
        <div
          data-chart-slot="empty"
          className="min-h-32"
          aria-label="30-day reach chart"
        />
        <p className={cardBodyTextClasses}>{CHART_SLOT_NOTE}</p>
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.sixPosts.name}
        definition={GLOSSARY.sixPosts.definition}
        help={GLOSSARY.sixPosts.help}
      >
        {gridReady ? (
          <ol className="flex flex-col gap-3">
            {inventory.posts.map((post, index) => (
              <li key={post.id} className="flex gap-3">
                <img src={publicObjectUrl(post.r2_key)} alt="" width={72} height={72} />
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

      <InventoryCard
        name={GLOSSARY.countryMix.name}
        definition={GLOSSARY.countryMix.definition}
        help={GLOSSARY.countryMix.help}
      >
        <ShareList rows={inventory.countryMix} />
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.cityMix.name}
        definition={GLOSSARY.cityMix.definition}
        help={GLOSSARY.cityMix.help}
      >
        <ShareList rows={inventory.cityMix} />
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.ageMix.name}
        definition={GLOSSARY.ageMix.definition}
        help={GLOSSARY.ageMix.help}
      >
        <ShareList
          rows={inventory.ageMix.map((row) => ({
            label: row.bracket,
            percent: row.percent,
          }))}
        />
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.genderMix.name}
        definition={GLOSSARY.genderMix.definition}
        help={GLOSSARY.genderMix.help}
      >
        <ShareList
          rows={inventory.genderMix.map((row) => ({
            label: `${row.label} (${row.bucket})`,
            percent: row.percent,
          }))}
        />
      </InventoryCard>

      <InventoryCard name={GLOSSARY.bio.name} definition={GLOSSARY.bio.definition} help={GLOSSARY.bio.help}>
        <p className={cardBodyTextClasses}>{inventory.bio}</p>
      </InventoryCard>

      <InventoryCard
        name={GLOSSARY.website.name}
        definition={GLOSSARY.website.definition}
        help={GLOSSARY.website.help}
      >
        <p className={cardBodyTextClasses}>{inventory.website}</p>
      </InventoryCard>
    </div>
  );
}
