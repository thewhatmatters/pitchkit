"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  PATTERN_BRAND_CARD_CLASS,
  PATTERN_BRAND_LIST_CLASS,
  PATTERN_BRAND_NAME_CLASS,
  PATTERN_BRAND_REORDER_CLASS,
  PATTERN_BRAND_ROW_START_CLASS,
  PATTERN_POSTS_HEADER_CLASS,
  PATTERN_POSTS_SECTION_CLASS,
} from "@/components/pattern-tokens";
import {
  Avatar,
  Button,
  Card,
  Dialog,
  IconButton,
  Input,
  MoreMenu,
  cardTitleClasses,
  dialogFooterActionsClasses,
} from "@/components/wmds";
import {
  PITCHKIT_BRANDS_MAX,
  PITCHKIT_BRAND_NAME_MAX,
  movePastBrand,
  pastBrandIdFromName,
  reorderPastBrand,
  shouldShowPastBrands,
  type PastBrand,
} from "@/lib/kit-profile";

function BrandMark({ name }: { name: string }) {
  return <Avatar name={name} size="sm" />;
}

type PublicPastBrandsProps = {
  brands: readonly PastBrand[];
};

/**
 * Pattern — past brands (public) Show code (`examples-pitchkit--past-brands-public`).
 * Ordered `{ id, name }` + letter Avatar. Omit the section when empty.
 */
export function PublicPastBrands({ brands }: PublicPastBrandsProps) {
  if (!shouldShowPastBrands(brands)) {
    return null;
  }

  return (
    <section className={PATTERN_POSTS_SECTION_CLASS}>
      <div className={PATTERN_POSTS_HEADER_CLASS}>
        <h2 className={cardTitleClasses}>Past brands</h2>
      </div>
      <div className={PATTERN_BRAND_LIST_CLASS}>
        {brands.map((brand) => (
          <Card
            key={brand.id}
            variant="outlined"
            shape="rounded"
            className={PATTERN_BRAND_CARD_CLASS}
          >
            <Card.Header
              start={
                <div className={PATTERN_BRAND_ROW_START_CLASS}>
                  <BrandMark name={brand.name} />
                  <h3 className={PATTERN_BRAND_NAME_CLASS}>{brand.name}</h3>
                </div>
              }
            />
          </Card>
        ))}
      </div>
    </section>
  );
}

type OwnerPastBrandsProps = {
  brands: PastBrand[];
  onBrandsChange: (brands: PastBrand[]) => void;
};

/**
 * Pattern — past brands (owner) Show code (`examples-pitchkit--past-brands-owner`).
 * Add / edit / reorder. Max 8. Letter Avatar. No logo upload.
 */
export function OwnerPastBrands({ brands, onBrandsChange }: OwnerPastBrandsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canAdd = brands.length < PITCHKIT_BRANDS_MAX;
  const trimmedDraft = draftName.trim();
  const canSubmit = trimmedDraft.length > 0;

  function openAdd() {
    if (!canAdd) {
      return;
    }
    setEditingId(null);
    setDraftName("");
    setDialogOpen(true);
  }

  function openEdit(brand: PastBrand) {
    setEditingId(brand.id);
    setDraftName(brand.name);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setDraftName("");
  }

  function submitBrand() {
    if (!canSubmit) {
      return;
    }
    if (editingId == null) {
      if (!canAdd) {
        return;
      }
      const id = pastBrandIdFromName(
        trimmedDraft,
        brands.map((brand) => brand.id),
      );
      onBrandsChange([...brands, { id, name: trimmedDraft }]);
    } else {
      onBrandsChange(
        brands.map((brand) =>
          brand.id === editingId ? { ...brand, name: trimmedDraft } : brand,
        ),
      );
    }
    closeDialog();
  }

  function handleAction(brand: PastBrand, actionId: string) {
    if (actionId === "edit") {
      openEdit(brand);
    }
    if (actionId === "remove") {
      onBrandsChange(brands.filter((item) => item.id !== brand.id));
    }
  }

  return (
    <section className={PATTERN_POSTS_SECTION_CLASS}>
      <div className={PATTERN_POSTS_HEADER_CLASS}>
        <h2 className={cardTitleClasses}>Past brands</h2>
        {brands.length > 0 && canAdd ? (
          <Button role="secondary" size="sm" onClick={openAdd}>
            Add
          </Button>
        ) : null}
      </div>
      {brands.length === 0 ? (
        <Button role="ghost" onClick={openAdd}>
          Add brands you've worked with
        </Button>
      ) : (
        <div className={PATTERN_BRAND_LIST_CLASS}>
          {brands.map((brand, index) => (
            <div
              key={brand.id}
              draggable
              onDragStart={() => setDraggingId(brand.id)}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={() => {
                if (draggingId != null) {
                  onBrandsChange(reorderPastBrand(brands, draggingId, brand.id));
                }
                setDraggingId(null);
              }}
              onDragEnd={() => setDraggingId(null)}
            >
              <Card variant="outlined" shape="rounded" className={PATTERN_BRAND_CARD_CLASS}>
                <Card.Header
                  start={
                    <div className={PATTERN_BRAND_ROW_START_CLASS}>
                      <span className={PATTERN_BRAND_REORDER_CLASS}>
                        <span aria-hidden>
                          <GripVertical />
                        </span>
                        <IconButton
                          size="xs"
                          icon={<ChevronUp />}
                          aria-label={`Move ${brand.name} up`}
                          disabled={index === 0}
                          onClick={() =>
                            onBrandsChange(movePastBrand(brands, brand.id, -1))
                          }
                        />
                        <IconButton
                          size="xs"
                          icon={<ChevronDown />}
                          aria-label={`Move ${brand.name} down`}
                          disabled={index === brands.length - 1}
                          onClick={() =>
                            onBrandsChange(movePastBrand(brands, brand.id, 1))
                          }
                        />
                      </span>
                      <BrandMark name={brand.name} />
                      <h3 className={PATTERN_BRAND_NAME_CLASS}>{brand.name}</h3>
                    </div>
                  }
                  end={
                    <MoreMenu
                      aria-label={`Manage ${brand.name}`}
                      size="xs"
                      items={[
                        {
                          id: "edit",
                          label: "Edit",
                          start: <Pencil />,
                        },
                        {
                          id: "remove",
                          label: "Remove",
                          start: <Trash2 />,
                        },
                      ]}
                      onAction={(actionId) => handleAction(brand, actionId)}
                    />
                  }
                />
              </Card>
            </div>
          ))}
        </div>
      )}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}
      >
        <Dialog.Content
          title="Past brands"
          footer={
            <div className={dialogFooterActionsClasses}>
              <Button size="sm" role="secondary" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                size="sm"
                role="primary"
                disabled={!canSubmit}
                onClick={submitBrand}
              >
                {editingId == null ? "Add" : "Save"}
              </Button>
            </div>
          }
        >
          <Input
            label="Brand name"
            value={draftName}
            maxLength={PITCHKIT_BRAND_NAME_MAX}
            onChange={(event) => setDraftName(event.target.value)}
          />
        </Dialog.Content>
      </Dialog>
    </section>
  );
}

/** @deprecated Use PublicPastBrands — chip display retired. */
export function PastBrands({ brands }: { brands: readonly PastBrand[] }) {
  return <PublicPastBrands brands={brands} />;
}
