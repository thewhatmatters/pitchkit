import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { EMPTY_AUDIENCE, persistOwnerKitProfile, readGraphSnapshot, writeGraphSnapshot } from "./graph-store";
import { createMemoryHiddenKit, setHiddenKitNamespaceForTests } from "./hidden-kit";
import {
  PITCHKIT_BRANDS_MAX,
  PITCHKIT_BRAND_RESULT_MAX,
  PITCHKIT_INTRO_HARD_LIMIT,
  PITCHKIT_INTRO_SOFT_LIMIT,
  PITCHKIT_THEME_DEFAULT,
  SEED_INTRO,
  SEED_PAST_BRANDS,
  isPitchKitTheme,
  movePastBrand,
  normalizeIntro,
  normalizePastBrandResult,
  normalizePastBrands,
  normalizeTheme,
  parseKitProfileBody,
  pastBrandIdFromName,
  pitchKitIntroIsEmpty,
  pitchKitIntroStatus,
  resolvePastBrandLogoKey,
  reorderPastBrand,
  shouldShowPastBrands,
  shouldShowPublicIntro,
} from "./kit-profile";
import type { User } from "./schema";
import { DEMO_HANDLE, DEMO_USER_ID, seedMedia, seedOwnerMedia, seedReachSeries } from "./seed";
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

  it("migrates { id, name } and keeps optional logo_key / result_label honest", () => {
    assert.deepEqual(normalizePastBrands([{ id: "acme", name: "Acme" }]), [
      { id: "acme", name: "Acme" },
    ]);
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        normalizePastBrands([{ id: "acme", name: "Acme" }])[0],
        "logo_key",
      ),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        normalizePastBrands([{ id: "acme", name: "Acme" }])[0],
        "result_label",
      ),
      false,
    );
    assert.deepEqual(
      normalizePastBrands([
        {
          id: "nike",
          name: "Nike",
          logo_key: "nike",
          result_label: "  +12% CTR  ",
        },
        { id: "mystery", name: "Mystery", logo_key: "not-a-pack", result_label: "   " },
        {
          id: "long",
          name: "Long",
          result_label: "x".repeat(PITCHKIT_BRAND_RESULT_MAX + 8),
        },
      ]),
      [
        { id: "nike", name: "Nike", logo_key: "nike", result_label: "+12% CTR" },
        { id: "mystery", name: "Mystery" },
        { id: "long", name: "Long", result_label: "x".repeat(PITCHKIT_BRAND_RESULT_MAX) },
      ],
    );
    assert.equal(normalizePastBrandResult(""), undefined);
    assert.equal(normalizePastBrandResult("   "), undefined);
    assert.equal(normalizePastBrandResult("Sold out in 48h"), "Sold out in 48h");
    assert.equal(resolvePastBrandLogoKey(null), undefined);
    assert.equal(resolvePastBrandLogoKey("letter"), undefined);
    assert.equal(resolvePastBrandLogoKey("unknown-brand"), undefined);
    assert.equal(resolvePastBrandLogoKey("adobe"), "adobe");
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
      profile: {
        intro: "Hello",
        past_brands: [{ id: "acme", name: "Acme" }],
        theme: PITCHKIT_THEME_DEFAULT,
      },
    });
    assert.equal(parseKitProfileBody({ intro: "Hi", theme: "neon" }).ok, false);
    assert.deepEqual(parseKitProfileBody({ intro: "Hi", theme: "dark" }), {
      ok: true,
      profile: { intro: "Hi", past_brands: [], theme: "dark" },
    });
    const v2 = parseKitProfileBody({
      intro: "Hi",
      past_brands: [
        {
          id: "nike",
          name: "Nike",
          logo_key: "not-a-pack",
          result_label: `  ${"y".repeat(PITCHKIT_BRAND_RESULT_MAX + 4)}  `,
        },
      ],
    });
    assert.deepEqual(v2, {
      ok: true,
      profile: {
        intro: "Hi",
        past_brands: [
          {
            id: "nike",
            name: "Nike",
            result_label: "y".repeat(PITCHKIT_BRAND_RESULT_MAX),
          },
        ],
        theme: PITCHKIT_THEME_DEFAULT,
      },
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
    assert.equal(stored.theme, PITCHKIT_THEME_DEFAULT);
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
        { id: "hearth-home", name: "Hearth & Home", result_label: "3.2x ROAS" },
        { id: "studio-line", name: "Studio Line", logo_key: "adobe" },
      ],
      theme: "soft" as const,
    };
    assert.equal(
      await persistOwnerKitProfile({ handle: user.handle, userId: user.id }, profile),
      true,
    );
    const stored = await readGraphSnapshot(user.id);
    assert.deepEqual(stored?.intro, profile.intro);
    assert.deepEqual(stored?.past_brands, profile.past_brands);
    assert.equal(stored?.theme, "soft");

    const kit = await loadPublicKit(user.handle, NOW);
    assert.equal(kit?.intro, profile.intro);
    assert.deepEqual(kit?.past_brands, profile.past_brands);
    assert.equal(kit?.theme, "soft");
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
        theme: "dark",
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
    assert.equal(stored?.theme, "dark");
  });

  it("seed /k/demo uses frozen Pattern display until a demo snapshot exists", async () => {
    const publicKit = await loadPublicKit(DEMO_HANDLE, NOW);
    const owner = await loadOwnerKit(DEMO_HANDLE, NOW);
    assert.equal(publicKit?.intro, SEED_INTRO);
    assert.deepEqual(publicKit?.past_brands, SEED_PAST_BRANDS);
    assert.equal(publicKit?.theme, PITCHKIT_THEME_DEFAULT);
    assert.equal(owner?.intro, SEED_INTRO);
    assert.deepEqual(owner?.past_brands, SEED_PAST_BRANDS);
    assert.equal(owner?.theme, PITCHKIT_THEME_DEFAULT);

    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    assert.equal(
      await persistOwnerKitProfile(
        { handle: DEMO_HANDLE, userId: DEMO_USER_ID },
        { intro: null, past_brands: [], theme: "dark" },
      ),
      true,
    );
    const omitted = await loadPublicKit(DEMO_HANDLE, NOW);
    assert.equal(omitted?.intro, null);
    assert.deepEqual(omitted?.past_brands, []);
    assert.equal(shouldShowPublicIntro(omitted?.intro), false);
    assert.equal(shouldShowPastBrands(omitted?.past_brands), false);
    assert.equal(omitted?.theme, "dark");
  });

  it("live public kit includes Graph KPIs from the snapshot", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    const user = liveUser();
    assert.equal(
      await writeGraphSnapshot({
        user,
        media: seedOwnerMedia.map((row) => ({ ...row, user_id: user.id })),
        reach_series: seedReachSeries,
        audience: {
          country: [
            { label: "United States", percent: 42 },
            { label: "United Kingdom", percent: 16 },
            { label: "Canada", percent: 11 },
            { label: "Australia", percent: 8 },
          ],
          city: [],
          age: [],
          gender: [],
        },
        polled_at: NOW.toISOString(),
        theme: "dark",
      }),
      true,
    );
    const kit = await loadPublicKit(user.handle, NOW);
    assert.ok(kit);
    assert.equal(kit.hasInsights, true);
    assert.ok(kit.reach_series);
    assert.equal(kit.reach_series.length, seedReachSeries.length);
    assert.equal(kit.theme, "dark");
    assert.equal(kit.audience?.country.length, 4);
    assert.notEqual(kit.typicalReach, null);
  });

  it("defaults theme to light and rejects unknown values", () => {
    assert.equal(isPitchKitTheme("light"), true);
    assert.equal(isPitchKitTheme("dark"), true);
    assert.equal(isPitchKitTheme("soft"), true);
    assert.equal(isPitchKitTheme("neon"), false);
    assert.equal(normalizeTheme(undefined), PITCHKIT_THEME_DEFAULT);
    assert.equal(normalizeTheme("soft"), "soft");
    assert.equal(normalizeTheme("neon"), PITCHKIT_THEME_DEFAULT);
  });
});
