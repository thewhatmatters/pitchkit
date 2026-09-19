import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { EMPTY_AUDIENCE, persistOwnerKitProfile, readGraphSnapshot, writeGraphSnapshot } from "./graph-store";
import { createMemoryHiddenKit, setHiddenKitNamespaceForTests } from "./hidden-kit";
import {
  PITCHKIT_BRANDS_MAX,
  PITCHKIT_INTRO_HARD_LIMIT,
  PITCHKIT_INTRO_SOFT_LIMIT,
  SEED_INTRO,
  SEED_PAST_BRANDS,
  movePastBrand,
  normalizeIntro,
  normalizePastBrands,
  parseKitProfileBody,
  pastBrandIdFromName,
  pitchKitIntroIsEmpty,
  pitchKitIntroStatus,
  reorderPastBrand,
  shouldShowPastBrands,
  shouldShowPublicIntro,
} from "./kit-profile";
import type { User } from "./schema";
import { DEMO_HANDLE, DEMO_USER_ID, seedMedia } from "./seed";
import { loadOwnerKit, loadPublicKit } from "./store";

const NOW = new Date("2026-09-19T12:00:00.000Z");

function liveUser(partial: Partial<User> = {}): User {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    ig_user_id: "ig-rxndy",
    handle: "rxndy.dxniel",
    name: "Randy",
    avatar_r2_key: null,
    followers: 100,
    media_count: 10,
    token_encrypted: "enc-token",
    refresh_encrypted: null,
    token_expires_at: null,
    connected_at: "2026-09-01T00:00:00.000Z",
    disconnected_at: null,
    consent_index: false,
    ig_account_type: "BUSINESS",
    disclosure_version: 1,
    ...partial,
  };
}

afterEach(() => {
  setHiddenKitNamespaceForTests(undefined);
});

describe("kit intro + past brands contract", () => {
  it("soft 160 / hard 280 and public omit when empty", () => {
    assert.equal(pitchKitIntroIsEmpty(""), true);
    assert.equal(pitchKitIntroIsEmpty("   "), true);
    assert.equal(pitchKitIntroIsEmpty("Hello"), false);
    assert.equal(shouldShowPublicIntro(null), false);
    assert.equal(shouldShowPublicIntro("Hello"), true);
    assert.equal(pitchKitIntroStatus("x".repeat(PITCHKIT_INTRO_SOFT_LIMIT - 1)), undefined);
    assert.equal(pitchKitIntroStatus("x".repeat(PITCHKIT_INTRO_SOFT_LIMIT)), "warning");
    assert.equal(pitchKitIntroStatus("x".repeat(PITCHKIT_INTRO_HARD_LIMIT)), "error");
    assert.equal(normalizeIntro("  hi  "), "hi");
    assert.equal(normalizeIntro("x".repeat(300))?.length, PITCHKIT_INTRO_HARD_LIMIT);
    assert.equal(normalizeIntro(12), null);
  });

  it("keeps ordered { id, name } up to 8 and drops blank names", () => {
    assert.deepEqual(normalizePastBrands(null), []);
    assert.deepEqual(
      normalizePastBrands([
        { id: "acme", name: " Acme " },
        { id: "", name: "Blank id" },
        { name: "No id" },
        { id: "skip", name: "  " },
        { id: "acme", name: "Dup" },
      ]),
      [
        { id: "acme", name: "Acme" },
        { id: "blank-id", name: "Blank id" },
        { id: "no-id", name: "No id" },
      ],
    );
    const nine = Array.from({ length: 9 }, (_, i) => ({ id: `b${i}`, name: `Brand ${i}` }));
    assert.equal(normalizePastBrands(nine).length, PITCHKIT_BRANDS_MAX);
    assert.equal(shouldShowPastBrands([]), false);
    assert.equal(shouldShowPastBrands([{ id: "acme", name: "Acme" }]), true);
    assert.equal(pastBrandIdFromName("Hearth & Home", []), "hearth-home");
    assert.equal(pastBrandIdFromName("Hearth & Home", ["hearth-home"]), "hearth-home-2");
    const brands = [
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" },
    ];
    assert.deepEqual(
      movePastBrand(brands, "b", -1).map((row) => row.id),
      ["b", "a", "c"],
    );
    assert.deepEqual(
      reorderPastBrand(brands, "a", "c").map((row) => row.id),
      ["b", "c", "a"],
    );
  });

  it("rejects over-limit owner POST bodies instead of clipping", () => {
    assert.equal(parseKitProfileBody(null).ok, false);
    assert.equal(parseKitProfileBody({ intro: 1 }).ok, false);
    assert.equal(
      parseKitProfileBody({ intro: "x".repeat(PITCHKIT_INTRO_HARD_LIMIT + 1) }).ok,
      false,
    );
    const tooMany = {
      intro: "Hi",
      past_brands: Array.from({ length: 9 }, (_, i) => ({ id: `b${i}`, name: `Brand ${i}` })),
    };
    assert.deepEqual(parseKitProfileBody(tooMany), { ok: false, error: "brands_too_many" });
    const parsed = parseKitProfileBody({
      intro: "  Hello  ",
      past_brands: [{ id: "acme", name: "Acme" }],
    });
    assert.deepEqual(parsed, {
      ok: true,
      profile: { intro: "Hello", past_brands: [{ id: "acme", name: "Acme" }] },
    });
  });

  it("parses old Graph snapshots without intro/past_brands", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const user = liveUser();
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW.toISOString(),
      }),
      true,
    );
    const stored = await readGraphSnapshot(user.id);
    assert.ok(stored);
    assert.equal(stored.intro, null);
    assert.deepEqual(stored.past_brands, []);
  });

  it("writes intro and past brands onto the KV Graph snapshot", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const user = liveUser();
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW.toISOString(),
        intro: "Old",
        past_brands: [{ id: "old", name: "Old Co" }],
      }),
      true,
    );
    const profile = {
      intro: "I shoot tables for hosts.",
      past_brands: [
        { id: "hearth-home", name: "Hearth & Home" },
        { id: "studio-line", name: "Studio Line" },
      ],
    };
    assert.equal(
      await persistOwnerKitProfile({ handle: user.handle, userId: user.id }, profile),
      true,
    );
    const stored = await readGraphSnapshot(user.id);
    assert.deepEqual(stored?.intro, profile.intro);
    assert.deepEqual(stored?.past_brands, profile.past_brands);

    const kit = await loadPublicKit(user.handle, NOW);
    assert.equal(kit?.intro, profile.intro);
    assert.deepEqual(kit?.past_brands, profile.past_brands);
  });

  it("keeps intro/past_brands when a later snapshot omits them", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const user = liveUser();
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW.toISOString(),
        intro: "Keep me",
        past_brands: [{ id: "acme", name: "Acme" }],
      }),
      true,
    );
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedMedia,
        reach_series: [],
        audience: EMPTY_AUDIENCE,
        polled_at: NOW.toISOString(),
      }),
      true,
    );
    const stored = await readGraphSnapshot(user.id);
    assert.equal(stored?.intro, "Keep me");
    assert.deepEqual(stored?.past_brands, [{ id: "acme", name: "Acme" }]);
  });

  it("seed /k/demo uses frozen Pattern display until a demo snapshot exists", async () => {
    const publicKit = await loadPublicKit(DEMO_HANDLE, NOW);
    const owner = await loadOwnerKit(DEMO_HANDLE, NOW);
    assert.equal(publicKit?.intro, SEED_INTRO);
    assert.deepEqual(publicKit?.past_brands, SEED_PAST_BRANDS);
    assert.equal(owner?.intro, SEED_INTRO);
    assert.deepEqual(owner?.past_brands, SEED_PAST_BRANDS);

    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    assert.equal(
      await persistOwnerKitProfile(
        { handle: DEMO_HANDLE, userId: DEMO_USER_ID },
        { intro: null, past_brands: [] },
      ),
      true,
    );
    const omitted = await loadPublicKit(DEMO_HANDLE, NOW);
    assert.equal(omitted?.intro, null);
    assert.deepEqual(omitted?.past_brands, []);
    assert.equal(shouldShowPublicIntro(omitted?.intro), false);
    assert.equal(shouldShowPastBrands(omitted?.past_brands), false);
  });
});
