"use client";

import type { ReactNode } from "react";
import { Card, Chip, cardBodyTextClasses, cardTitleClasses } from "@/components/wmds";
import { EmptyGrid } from "@/components/empty-grid";
import { PostGrid } from "@/components/post-grid";
import { formatCount, formatEngagementRate } from "@/lib/engagement";
import {
  CHART_SLOT_CAPTION,
  CHART_SLOT_TITLE,
  CITY_MIX_CAPTION,
  CONTACT_CAPTION,
  COUNTRY_MIX_CAPTION,
  ENGAGEMENT_FORMULA,
  EXAMPLE_AGE_MIX,
  EXAMPLE_CITY_MIX,
  EXAMPLE_COUNTRY_MIX,
  EXAMPLE_DATA_NOTE,
  EXAMPLE_GENDER_MIX,
  EXAMPLE_TYPICAL_REACH,
  EXAMPLE_TYPICAL_SAVES,
  GLOSSARY_FIRST_SENTENCE,
  HIDDEN_WHEN_BLANK,
  INVENTORY_BIO,
  INVENTORY_CONTACT,
  INVENTORY_INTRO,
  INVENTORY_PAST_BRANDS,
  INVENTORY_TITLE,
  INVENTORY_WEBSITE,
  LAST_UPDATED_CAPTION,
  NAME_CAPTION,
  PAST_BRANDS_CAPTION,
  PHOTO_CAPTION,
  SIX_POSTS_RANK,
  TYPICAL_REACH_CAPTION,
  TYPICAL_SAVES_CAPTION,
  USERNAME_CAPTION,
  formatShare,
  inventoryLastUpdated,
  sourcedText,
  type InventoryItemId,
  type RankedShare,
} from "@/lib/inventory";
import { publicObjectUrl } from "@/lib/r2";
import type { Media, User } from "@/lib/schema";

type KitInventoryProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  gridReady?: boolean;
};

function ExampleChip() {
  return (
    <Chip readOnly size="sm">
      {EXAMPLE_DATA_NOTE}
    </Chip>
  );
}

function GlossaryDefinition({ id }: { id: InventoryItemId }) {
  const sentence = GLOSSARY_FIRST_SENTENCE[id];
  if (!sentence) {
    return null;
  }

  return (
    <p className={cardBodyTextClasses} data-glossary-definition={id}>
      {sentence}
    </p>
  );
}

function InventoryCard({
  id,
  title,
  example,
  value,
  children,
}: {
  id: InventoryItemId;
  title: string;
  example?: boolean;
  value?: ReactNode;
  children?: ReactNode;
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
        <div className="flex flex-col gap-2 p-3">
          <div className="flex flex-wrap items-baseline gap-3">
            {value}
            <GlossaryDefinition id={id} />
          </div>
          {children}
        </div>
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

function PhotoValue({ avatarKey }: { avatarKey: string | null }) {
  const src = publicObjectUrl(avatarKey);
  if (!src) {
    return <p className={cardBodyTextClasses}>{HIDDEN_WHEN_BLANK}</p>;
  }

  return <img src={src} alt="" width={56} height={56} data-inventory-avatar="" />;
}

function PastBrandsValue({ brands }: { brands: readonly string[] }) {
  if (brands.length === 0) {
    return <p className={cardBodyTextClasses}>{HIDDEN_WHEN_BLANK}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {brands.map((brand) => (
        <p key={brand} className={cardTitleClasses}>
          {brand}
        </p>
      ))}
    </div>
  );
}

export function KitInventory({
  user,
  posts,
  engagementRate,
  gridReady = true,
}: KitInventoryProps) {
  const name = sourcedText(user.name);
  const username = sourcedText(user.handle);
  const lastUpdated = inventoryLastUpdated(posts);
  const avatarSrc = publicObjectUrl(user.avatar_r2_key);

  return (
    <section aria-label={INVENTORY_TITLE} className="flex flex-col gap-4" data-inventory="static">
      <Card variant="outlined" shape="rounded" padding="none" data-inventory-banner="example">
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

      <InventoryCard
        id="name"
        title="Name"
        example={name != null}
        value={<HiddenWhenBlank value={name} />}
      >
        <p className={cardBodyTextClasses}>{NAME_CAPTION}</p>
      </InventoryCard>

      <InventoryCard
        id="username"
        title="Username"
        example={username != null}
        value={<HiddenWhenBlank value={username ? `@${username}` : null} />}
      >
        <p className={cardBodyTextClasses}>{USERNAME_CAPTION}</p>
      </InventoryCard>

      <InventoryCard id="photo" title="Photo" example={Boolean(avatarSrc)}>
        <PhotoValue avatarKey={user.avatar_r2_key} />
        <p className={cardBodyTextClasses}>{PHOTO_CAPTION}</p>
      </InventoryCard>

      <InventoryCard
        id="last-updated"
        title="Last-updated"
        example={lastUpdated != null}
        value={<HiddenWhenBlank value={lastUpdated} />}
      >
        <p className={cardBodyTextClasses}>{LAST_UPDATED_CAPTION}</p>
      </InventoryCard>

      <InventoryCard
        id="contact"
        title="Contact"
        value={<HiddenWhenBlank value={INVENTORY_CONTACT} />}
      >
        <p className={cardBodyTextClasses}>{CONTACT_CAPTION}</p>
      </InventoryCard>

      <InventoryCard
        id="past-brands"
        title="Past brands"
        value={<PastBrandsValue brands={INVENTORY_PAST_BRANDS} />}
      >
        <p className={cardBodyTextClasses}>{PAST_BRANDS_CAPTION}</p>
      </InventoryCard>

      <InventoryCard
        id="engagement-rate"
        title="Engagement rate"
        value={<p className={cardTitleClasses}>{formatEngagementRate(engagementRate)}</p>}
      >
        <p className={cardBodyTextClasses}>{ENGAGEMENT_FORMULA}</p>
        <p className={cardBodyTextClasses}>
          Demo seed math from public likes and comments on the six posts. Seed Insights are
          missing.
        </p>
      </InventoryCard>

      <InventoryCard
        id="followers"
        title="Followers"
        value={<p className={cardTitleClasses}>{formatCount(user.followers)}</p>}
      >
        <p className={cardBodyTextClasses}>Count from the demo seed profile.</p>
      </InventoryCard>

      <InventoryCard
        id="typical-reach"
        title="Typical reach"
        example
        value={<p className={cardTitleClasses}>{formatCount(EXAMPLE_TYPICAL_REACH)}</p>}
      >
        <p className={cardBodyTextClasses}>{TYPICAL_REACH_CAPTION}</p>
      </InventoryCard>

      <InventoryCard
        id="saves"
        title="Saves"
        example
        value={<p className={cardTitleClasses}>{formatCount(EXAMPLE_TYPICAL_SAVES)}</p>}
      >
        <p className={cardBodyTextClasses}>{TYPICAL_SAVES_CAPTION}</p>
      </InventoryCard>

      <InventoryCard id="reach-chart" title={CHART_SLOT_TITLE}>
        <p className={cardBodyTextClasses}>{CHART_SLOT_CAPTION}</p>
        <div aria-label={CHART_SLOT_TITLE} data-chart-slot="empty" />
      </InventoryCard>

      <InventoryCard id="six-posts" title="Six posts">
        <p className={cardBodyTextClasses}>{SIX_POSTS_RANK}</p>
        {gridReady ? <PostGrid posts={posts} hasInsights={false} /> : <EmptyGrid />}
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

      <InventoryCard
        id="bio"
        title="Bio"
        value={<HiddenWhenBlank value={INVENTORY_BIO} />}
      />

      <InventoryCard
        id="website"
        title="Website"
        value={<HiddenWhenBlank value={INVENTORY_WEBSITE} />}
      />
    </section>
  );
}
