"use client";

import { useState } from "react";
import { Button, Input, Switch } from "@/components/wmds";
import { KitCard } from "@/components/kit-card";
import { PastBrands } from "@/components/past-brands";
import { sourcedContact, visibleBrandNames } from "@/lib/kit-chips";
import type { Media, User } from "@/lib/schema";

type KitEditProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  hasInsights: boolean;
  canEdit: boolean;
};

export function KitEdit({ user, posts, engagementRate, hasInsights, canEdit }: KitEditProps) {
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState("");
  const [draftBrand, setDraftBrand] = useState("");
  const [brands, setBrands] = useState<string[]>([]);

  const visibleContact = sourcedContact(contact);
  const visibleBrands = visibleBrandNames(brands);

  function addBrand() {
    const name = draftBrand.trim();
    if (!name || brands.includes(name)) {
      setDraftBrand("");
      return;
    }
    setBrands([...brands, name]);
    setDraftBrand("");
  }

  return (
    <div className="flex flex-col gap-4">
      {canEdit ? (
        <Switch
          layout="settings"
          label="Edit"
          checked={editing}
          onChange={(event) => setEditing(event.target.checked)}
        />
      ) : null}

      {canEdit && editing ? (
        <div className="flex flex-col gap-3">
          <Input
            label="Contact"
            description="Hidden when blank. Not stored on Insights."
            value={contact}
            onChange={(event) => setContact(event.target.value)}
          />
          <Input
            label="Past brand"
            description="Wrap as chips. Empty stays hidden."
            value={draftBrand}
            onChange={(event) => setDraftBrand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addBrand();
              }
            }}
          />
          <Button role="secondary" size="sm" type="button" onClick={addBrand}>
            Add brand
          </Button>
          <PastBrands brands={visibleBrands} />
        </div>
      ) : null}

      <KitCard
        user={user}
        posts={posts}
        engagementRate={engagementRate}
        hasInsights={hasInsights}
        pastBrands={visibleBrands}
        contact={visibleContact}
      />
    </div>
  );
}
