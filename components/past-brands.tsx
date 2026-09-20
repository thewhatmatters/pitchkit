"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronUp, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import {
  PATTERN_BRAND_CARD_CLASS,
  PATTERN_BRAND_DIALOG_FIELDS_CLASS,
  PATTERN_BRAND_LIST_CLASS,
  PATTERN_BRAND_MARK_CLASS,
  PATTERN_BRAND_MARQUEE_TRACK_CLASS,
  PATTERN_BRAND_MARQUEE_VIEWPORT_CLASS,
  PATTERN_BRAND_NAME_CLASS,
  PATTERN_BRAND_RAIL_CARD_CLASS,
  PATTERN_BRAND_RAIL_HOST_CLASS,
  PATTERN_BRAND_RAIL_MEASURE_CLASS,
  PATTERN_BRAND_RAIL_ROW_CLASS,
  PATTERN_BRAND_RAIL_WRAP_CLASS,
  PATTERN_BRAND_REORDER_CLASS,
  PATTERN_BRAND_ROW_START_CLASS,
  PATTERN_POSTS_HEADER_CLASS,
  PATTERN_POSTS_SECTION_CLASS,
} from "@/components/pattern-tokens";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  IconButton,
  Input,
  MoreMenu,
  Select,
  cardTitleClasses,
  dialogFooterActionsClasses,
} from "@/components/wmds";
import {
  PITCHKIT_BRANDS_MAX,
  PITCHKIT_BRAND_LOGO_KEYS,
  PITCHKIT_BRAND_LOGO_LETTER,
  PITCHKIT_BRAND_NAME_MAX,
  PITCHKIT_BRAND_RESULT_HINTS,
  PITCHKIT_BRAND_RESULT_MAX,
  movePastBrand,
  normalizePastBrandResult,
  pastBrandIdFromName,
  pastBrandLogoKeyLabel,
  pastBrandLogoMonogram,
  pastBrandResultIssues,
  pastBrandResultStatus,
  reorderPastBrand,
  resolvePastBrandLogoKey,
  shouldShowPastBrands,
  type PastBrand,
  type PitchKitBrandLogoKey,
} from "@/lib/kit-profile";

const pastBrandLogoOptions = [
  { value: PITCHKIT_BRAND_LOGO_LETTER, label: "Letter avatar" },
  ...PITCHKIT_BRAND_LOGO_KEYS.map((key) => ({
    value: key,
    label: pastBrandLogoKeyLabel(key),
  })),
];

function BrandMark({
  name,
  logoKey,
}: {
  name: string;
  logoKey?: string | null;
}) {
  const resolved = resolvePastBrandLogoKey(logoKey);
  if (resolved == null) {
    return <Avatar name={name} size="sm" />;
  }

  return (
    <span className={PATTERN_BRAND_MARK_CLASS} role="img" aria-label={name}>
      <span aria-hidden>{pastBrandLogoMonogram(resolved)}</span>
    </span>
  );
}

function BrandResultChip({ label }: { label?: string | null }) {
  const result = normalizePastBrandResult(label);
  if (result == null) {
    return null;
  }
  return (
    <Chip readOnly size="sm">
      {result}
    </Chip>
  );
}

function BrandLockup({ brand }: { brand: PastBrand }) {
  return (
    <div className={PATTERN_BRAND_ROW_START_CLASS}>
      <BrandMark name={brand.name} logoKey={brand.logo_key} />
      <h3 className={PATTERN_BRAND_NAME_CLASS}>{brand.name}</h3>
      <BrandResultChip label={brand.result_label} />
    </div>
  );
}

function PastBrandCard({
  brand,
  className,
}: {
  brand: PastBrand;
  className: string;
}) {
  return (
    <Card variant="outlined" shape="rounded" className={className}>
      <Card.Header start={<BrandLockup brand={brand} />} />
    </Card>
  );
}

function PastBrandsRail({ brands }: { brands: readonly PastBrand[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || window.matchMedia == null) {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const measure = measureRef.current;
    if (host == null || measure == null) {
      return;
    }

    const update = () => {
      setOverflows(measure.scrollWidth > host.clientWidth + 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [brands]);

  const duration = Math.max(16, brands.length * 4);
  const showMarquee = overflows && !reduceMotion;

  return (
    <div
      ref={hostRef}
      className={PATTERN_BRAND_RAIL_HOST_CLASS}
      data-overflow={showMarquee ? "true" : "false"}
    >
      <ul ref={measureRef} className={PATTERN_BRAND_RAIL_MEASURE_CLASS} aria-hidden>
        {brands.map((brand) => (
          <li key={`${brand.id}-measure`}>
            <PastBrandCard brand={brand} className={PATTERN_BRAND_RAIL_CARD_CLASS} />
          </li>
        ))}
      </ul>
      {reduceMotion ? (
        <ul className={PATTERN_BRAND_RAIL_WRAP_CLASS} aria-label="Past brands">
          {brands.map((brand) => (
            <li key={brand.id}>
              <PastBrandCard brand={brand} className={PATTERN_BRAND_RAIL_CARD_CLASS} />
            </li>
          ))}
        </ul>
      ) : showMarquee ? (
        <>
          <ul className="sr-only" aria-label="Past brands">
            {brands.map((brand) => {
              const result = normalizePastBrandResult(brand.result_label);
              return (
                <li key={brand.id}>
                  {result == null ? brand.name : `${brand.name}, ${result}`}
                </li>
              );
            })}
          </ul>
          <div className={PATTERN_BRAND_MARQUEE_VIEWPORT_CLASS} aria-hidden>
            <div
              className={PATTERN_BRAND_MARQUEE_TRACK_CLASS}
              style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
            >
              <ul className={PATTERN_BRAND_RAIL_ROW_CLASS}>
                {brands.map((brand) => (
                  <li key={`${brand.id}-loop-a`}>
                    <PastBrandCard brand={brand} className={PATTERN_BRAND_RAIL_CARD_CLASS} />
                  </li>
                ))}
              </ul>
              <ul className={PATTERN_BRAND_RAIL_ROW_CLASS}>
                {brands.map((brand) => (
                  <li key={`${brand.id}-loop-b`}>
                    <PastBrandCard brand={brand} className={PATTERN_BRAND_RAIL_CARD_CLASS} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <ul className={PATTERN_BRAND_RAIL_ROW_CLASS} aria-label="Past brands">
          {brands.map((brand) => (
            <li key={brand.id}>
              <PastBrandCard brand={brand} className={PATTERN_BRAND_RAIL_CARD_CLASS} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type PublicPastBrandsProps = {
  brands: readonly PastBrand[];
};

/**
 * Pattern — past brands (public) Show code (`examples-pitchkit--past-brands-public`).
 * Overflow: `--past-brands-public-overflow`. Empty: `--past-brands-public-omit`.
 * Ordered `{ id, name, logo_key?, result_label? }`. Letter Avatar when logo_key
 * is missing or unknown. Chip only when result_label is non-empty after trim.
 * Static row when the set fits; marquee only on overflow. Reduced motion wraps.
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
      <PastBrandsRail brands={brands} />
    </section>
  );
}

type OwnerPastBrandsProps = {
  brands: PastBrand[];
  onBrandsChange: (brands: PastBrand[]) => void;
};

/**
 * Pattern — past brands (owner) Show code (`examples-pitchkit--past-brands-owner`).
 * Empty: `--past-brands-owner-empty`. Max: `--past-brands-owner-overflow`.
 * Add / edit / reorder + optional add/clear result. Max 8. Curated logo_key or
 * letter Avatar. No creator upload.
 */
export function OwnerPastBrands({ brands, onBrandsChange }: OwnerPastBrandsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftResult, setDraftResult] = useState("");
  const [draftLogoKey, setDraftLogoKey] = useState(PITCHKIT_BRAND_LOGO_LETTER);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canAdd = brands.length < PITCHKIT_BRANDS_MAX;
  const trimmedDraft = draftName.trim();
  const resultIssue = pastBrandResultIssues(draftResult);
  const canSubmit = trimmedDraft.length > 0 && resultIssue == null;

  function openAdd() {
    if (!canAdd) {
      return;
    }
    setEditingId(null);
    setDraftName("");
    setDraftResult("");
    setDraftLogoKey(PITCHKIT_BRAND_LOGO_LETTER);
    setDialogOpen(true);
  }

  function openEdit(brand: PastBrand) {
    setEditingId(brand.id);
    setDraftName(brand.name);
    setDraftResult(brand.result_label ?? "");
    setDraftLogoKey(resolvePastBrandLogoKey(brand.logo_key) ?? PITCHKIT_BRAND_LOGO_LETTER);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setDraftName("");
    setDraftResult("");
    setDraftLogoKey(PITCHKIT_BRAND_LOGO_LETTER);
  }

  function nextBrandFields(): Pick<PastBrand, "name" | "logo_key" | "result_label"> {
    const logo_key = resolvePastBrandLogoKey(draftLogoKey);
    const result_label = normalizePastBrandResult(draftResult);
    return {
      name: trimmedDraft,
      ...(logo_key == null ? {} : { logo_key }),
      ...(result_label == null ? {} : { result_label }),
    };
  }

  function submitBrand() {
    if (!canSubmit) {
      return;
    }
    const fields = nextBrandFields();
    if (editingId == null) {
      if (!canAdd) {
        return;
      }
      const id = pastBrandIdFromName(
        trimmedDraft,
        brands.map((brand) => brand.id),
      );
      onBrandsChange([...brands, { id, ...fields }]);
    } else {
      onBrandsChange(
        brands.map((brand) =>
          brand.id === editingId ? { ...brand, ...fields } : brand,
        ),
      );
    }
    closeDialog();
  }

  function clearResult(brand: PastBrand) {
    onBrandsChange(
      brands.map((item) => {
        if (item.id !== brand.id) {
          return item;
        }
        return {
          id: item.id,
          name: item.name,
          ...(item.logo_key == null ? {} : { logo_key: item.logo_key }),
        };
      }),
    );
  }

  function handleAction(brand: PastBrand, actionId: string) {
    if (actionId === "edit" || actionId === "add-result") {
      openEdit(brand);
    }
    if (actionId === "clear-result") {
      clearResult(brand);
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
          {brands.map((brand, index) => {
            const hasResult = normalizePastBrandResult(brand.result_label) != null;
            return (
              <Card
                key={brand.id}
                variant="outlined"
                shape="rounded"
                className={PATTERN_BRAND_CARD_CLASS}
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
                      <BrandMark name={brand.name} logoKey={brand.logo_key} />
                      <h3 className={PATTERN_BRAND_NAME_CLASS}>{brand.name}</h3>
                      <BrandResultChip label={brand.result_label} />
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
                        hasResult
                          ? {
                              id: "clear-result",
                              label: "Clear result",
                            }
                          : {
                              id: "add-result",
                              label: "Add result",
                              start: <Plus />,
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
            );
          })}
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
          <div className={PATTERN_BRAND_DIALOG_FIELDS_CLASS}>
            <Input
              label="Brand name"
              value={draftName}
              maxLength={PITCHKIT_BRAND_NAME_MAX}
              onChange={(event) => setDraftName(event.target.value)}
            />
            <Input
              label="Result"
              description={PITCHKIT_BRAND_RESULT_HINTS}
              placeholder="Optional short phrase"
              value={draftResult}
              maxLength={PITCHKIT_BRAND_RESULT_MAX}
              status={pastBrandResultStatus(draftResult)}
              message={resultIssue}
              onChange={(event) => setDraftResult(event.target.value)}
            />
            <Select
              label="Logo"
              description="Optional curated mark. Missing or unknown keys use a letter Avatar."
              options={pastBrandLogoOptions}
              value={draftLogoKey}
              onValueChange={(value) =>
                setDraftLogoKey(value as PitchKitBrandLogoKey | typeof PITCHKIT_BRAND_LOGO_LETTER)
              }
            />
          </div>
        </Dialog.Content>
      </Dialog>
    </section>
  );
}

/** @deprecated Use PublicPastBrands — chip display retired. */
export function PastBrands({ brands }: { brands: readonly PastBrand[] }) {
  return <PublicPastBrands brands={brands} />;
}
