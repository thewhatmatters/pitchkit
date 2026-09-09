import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  applyHiddenOverlay,
  cookieValue,
  HIDDEN_COOKIE,
  hideFromKit,
  hiddenCookieSetHeader,
  mediaVisibilityResponse,
  mergeHiddenOverlay,
  readHiddenFromKitStore,
  resetHiddenFromKitStore,
  parseHiddenOverlay,
  parseMediaId,
  restoreToKit,
  serializeHiddenOverlay,
} from "./hidden-kit";
import { excludeHiddenFromPublicKit } from "./kit";
import type { Media } from "./schema";
import { DEMO_HANDLE, DEMO_USER_ID, seedMedia } from "./seed";
import { parseSessionValue, SESSION_COOKIE, stubSignOut } from "./session";
import { hideFromKit as storeHide, loadOwnerKit, loadPublicKit, restoreToKit as storeRestore } from "./store";

const NOW = new Date("2026-09-02T12:00:00.000Z");
const HIDDEN_AT = "2026-09-09T01:30:00.000Z";
const TOP_ID = seedMedia[0]!.id;
const session = parseSessionValue(DEMO_HANDLE);

function media(
  partial: Partial<Media> & Pick<Media, "id" | "posted_at" | "like_count">,
): Media {
  return {
    user_id: DEMO_USER_ID,
    ig_media_id: partial.id,
    permalink: `https://www.instagram.com/p/${partial.id}/`,
    media_type: "IMAGE",
    product_type: "FEED",
    caption: null,
    r2_key: `${partial.id}.jpg`,
    comments_count: 0,
    reach: null,
    saves: null,
    shares: null,
    impressions: null,
    fetched_at: NOW.toISOString(),
    insights_fetched_at: null,
    hidden_from_kit_at: null,
    ...partial,
  };
}

function cookieHeader(sessionHandle: string, overlayValue?: string): string {
  const parts = [`${SESSION_COOKIE}=${sessionHandle}`];
  if (overlayValue != null) {
    parts.push(`${HIDDEN_COOKIE}=${overlayValue}`);
  }
  return parts.join("; ");
}

function postVisibility(
  path: "/api/media/hide" | "/api/media/restore",
  body: unknown,
  cookies?: string,
): Promise<Response> {
  return mediaVisibilityResponse(
    new Request(`http://localhost${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookies ? { cookie: cookies } : {}),
      },
      body: JSON.stringify(body),
    }),
    path.endsWith("hide") ? "hide" : "restore",
  );
}

beforeEach(() => {
  resetHiddenFromKitStore();
});

afterEach(() => {
  resetHiddenFromKitStore();
});

describe("hide/restore helpers", () => {
  it("exports hideFromKit and restoreToKit from the store seam", () => {
    assert.equal(storeHide, hideFromKit);
    assert.equal(storeRestore, restoreToKit);
  });

  it("hides and restores a seed post; hide is idempotent on the first timestamp", () => {
    assert.ok(session);
    const hidden = hideFromKit({
      session,
      mediaId: TOP_ID,
      overlay: null,
      now: new Date(HIDDEN_AT),
    });
    assert.equal(hidden.ok, true);
    if (!hidden.ok) {
      return;
    }
    assert.deepEqual(
      { mediaId: hidden.mediaId, hiddenFromKitAt: hidden.hiddenFromKitAt },
      { mediaId: TOP_ID, hiddenFromKitAt: HIDDEN_AT },
    );
    assert.equal(hidden.overlay.hidden[TOP_ID], HIDDEN_AT);

    const again = hideFromKit({
      session,
      mediaId: TOP_ID,
      overlay: hidden.overlay,
      now: new Date("2026-09-09T02:00:00.000Z"),
    });
    assert.equal(again.ok, true);
    if (!again.ok) {
      return;
    }
    assert.equal(again.hiddenFromKitAt, HIDDEN_AT);

    const restored = restoreToKit({
      session,
      mediaId: TOP_ID,
      overlay: again.overlay,
    });
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }
    assert.equal(restored.hiddenFromKitAt, null);
    assert.equal(restored.overlay.hidden[TOP_ID], undefined);

    const alreadyVisible = restoreToKit({
      session,
      mediaId: TOP_ID,
      overlay: restored.overlay,
    });
    assert.equal(alreadyVisible.ok, true);
    if (!alreadyVisible.ok) {
      return;
    }
    assert.equal(alreadyVisible.hiddenFromKitAt, null);
  });

  it("returns the stamped failure codes", () => {
    assert.deepEqual(
      hideFromKit({ session: null, mediaId: TOP_ID, overlay: null }),
      { ok: false, status: 401, error: "unauthenticated" },
    );
    assert.deepEqual(
      hideFromKit({ session, mediaId: 12, overlay: null }),
      { ok: false, status: 400, error: "invalid_body" },
    );
    assert.deepEqual(
      hideFromKit({ session, mediaId: "", overlay: null }),
      { ok: false, status: 400, error: "invalid_body" },
    );
    assert.deepEqual(
      hideFromKit({ session, mediaId: "missing-media", overlay: null }),
      { ok: false, status: 404, error: "not_found" },
    );
    assert.deepEqual(
      hideFromKit({
        session,
        mediaId: "foreign",
        overlay: null,
        catalog: [media({ id: "foreign", user_id: "other-user", posted_at: NOW.toISOString(), like_count: 1 })],
      }),
      { ok: false, status: 403, error: "forbidden" },
    );
    assert.deepEqual(
      hideFromKit({
        session,
        mediaId: TOP_ID,
        overlay: null,
        persist: { write: () => false },
      }),
      { ok: false, status: 500, error: "persist_failed" },
    );
    assert.equal(readHiddenFromKitStore(DEMO_USER_ID), undefined);
    assert.equal(parseMediaId(null), null);
    assert.equal(parseMediaId({ mediaId: TOP_ID }), TOP_ID);
  });
});

describe("public vs owner kit visibility", () => {
  it("excludes hidden rows before selectSixPosts on the public kit only", () => {
    const rows = [
      media({ id: "top", posted_at: "2026-08-20T00:00:00.000Z", saves: 90, like_count: 1 }),
      media({ id: "mid", posted_at: "2026-08-21T00:00:00.000Z", saves: 40, like_count: 1 }),
      media({ id: "low", posted_at: "2026-08-22T00:00:00.000Z", saves: 10, like_count: 1 }),
      media({
        id: "old",
        posted_at: "2026-07-01T00:00:00.000Z",
        saves: 80,
        like_count: 1,
      }),
    ];
    const overlay = {
      userId: DEMO_USER_ID,
      hidden: { top: HIDDEN_AT },
    };
    const stamped = applyHiddenOverlay(rows, overlay, DEMO_USER_ID);
    assert.equal(stamped.find((row) => row.id === "top")?.hidden_from_kit_at, HIDDEN_AT);
    assert.deepEqual(
      excludeHiddenFromPublicKit(stamped).map((row) => row.id),
      ["mid", "low", "old"],
    );

    const publicKit = loadPublicKit(DEMO_HANDLE, NOW, {
      userId: DEMO_USER_ID,
      hidden: { [TOP_ID]: HIDDEN_AT },
    });
    assert.ok(publicKit);
    assert.equal(publicKit.posts.some((row) => row.id === TOP_ID), false);
    assert.equal(publicKit.posts.length, 5);
    assert.equal(publicKit.posts.every((row) => row.hidden_from_kit_at == null), true);

    const owner = loadOwnerKit(DEMO_HANDLE, NOW, {
      userId: DEMO_USER_ID,
      hidden: { [TOP_ID]: HIDDEN_AT },
    });
    assert.ok(owner);
    assert.equal(owner.posts.length, seedMedia.length);
    const hidden = owner.posts.find((row) => row.id === TOP_ID);
    assert.ok(hidden);
    assert.equal(hidden.hidden_from_kit_at, HIDDEN_AT);
    assert.equal(owner.reach_series?.length, 30);
  });

  it("ignores another user's overlay cookie", () => {
    const publicKit = loadPublicKit(DEMO_HANDLE, NOW, {
      userId: "someone-else",
      hidden: { [TOP_ID]: HIDDEN_AT },
    });
    assert.ok(publicKit);
    assert.equal(publicKit.posts.some((row) => row.id === TOP_ID), true);
    assert.equal(publicKit.posts.length, 6);
  });

  it("excludes a hidden post from the public kit without the hidden cookie (Map SoT)", () => {
    assert.ok(session);
    const hidden = hideFromKit({
      session,
      mediaId: TOP_ID,
      overlay: null,
      now: new Date(HIDDEN_AT),
    });
    assert.equal(hidden.ok, true);
    assert.deepEqual(readHiddenFromKitStore(DEMO_USER_ID), { [TOP_ID]: HIDDEN_AT });

    const brandKit = loadPublicKit(DEMO_HANDLE, NOW, null);
    assert.ok(brandKit);
    assert.equal(brandKit.posts.some((row) => row.id === TOP_ID), false);
    assert.equal(brandKit.posts.length, 5);

    const merged = mergeHiddenOverlay(DEMO_USER_ID, null);
    assert.equal(merged.hidden[TOP_ID], HIDDEN_AT);

    const restored = restoreToKit({ session, mediaId: TOP_ID, overlay: null });
    assert.equal(restored.ok, true);
    const after = loadPublicKit(DEMO_HANDLE, NOW, null);
    assert.ok(after);
    assert.equal(after.posts.some((row) => row.id === TOP_ID), true);
    assert.equal(after.posts.length, 6);
  });
});

describe("pitchkit_hidden cookie overlay", () => {
  it("round-trips an httpOnly overlay keyed to the session user", () => {
    const overlay = { userId: DEMO_USER_ID, hidden: { [TOP_ID]: HIDDEN_AT } };
    const header = hiddenCookieSetHeader(overlay, false);
    assert.match(header, new RegExp(`${HIDDEN_COOKIE}=`));
    assert.match(header, /HttpOnly/i);
    assert.match(header, /Path=\//);
    assert.match(header, /SameSite=Lax/i);
    assert.doesNotMatch(header, /Secure/i);

    const value = cookieValue(
      new Request("http://localhost/insights", { headers: { cookie: header.split(";")[0] } }),
      HIDDEN_COOKIE,
    );
    assert.deepEqual(parseHiddenOverlay(value), overlay);
    assert.equal(parseHiddenOverlay("not-json"), null);
    assert.equal(serializeHiddenOverlay(overlay), encodeURIComponent(JSON.stringify(overlay)));
  });

  it("clears the overlay cookie on sign-out", () => {
    const cookies = stubSignOut(new Request("http://localhost/auth/sign-out")).headers.getSetCookie();
    assert.equal(
      cookies.some((row) => row.startsWith(`${HIDDEN_COOKIE}=`) && /Max-Age=0/.test(row)),
      true,
    );
  });
});

describe("POST /api/media/hide and /restore", () => {
  it("returns 200 + cookie overlay and is idempotent", async () => {
    const hide = await postVisibility("/api/media/hide", { mediaId: TOP_ID }, cookieHeader(DEMO_HANDLE));
    assert.equal(hide.status, 200);
    const hideBody = (await hide.json()) as { mediaId: string; hiddenFromKitAt: string | null };
    assert.equal(hideBody.mediaId, TOP_ID);
    assert.equal(typeof hideBody.hiddenFromKitAt, "string");
    const setCookie = hide.headers.getSetCookie().find((row) => row.startsWith(`${HIDDEN_COOKIE}=`));
    assert.ok(setCookie);
    assert.match(setCookie, /HttpOnly/i);

    const overlayValue = setCookie.slice(`${HIDDEN_COOKIE}=`.length).split(";")[0];
    const hideAgain = await postVisibility(
      "/api/media/hide",
      { mediaId: TOP_ID },
      cookieHeader(DEMO_HANDLE, overlayValue),
    );
    assert.equal(hideAgain.status, 200);
    const hideAgainBody = (await hideAgain.json()) as { hiddenFromKitAt: string | null };
    assert.equal(hideAgainBody.hiddenFromKitAt, hideBody.hiddenFromKitAt);

    const restore = await postVisibility(
      "/api/media/restore",
      { mediaId: TOP_ID },
      cookieHeader(DEMO_HANDLE, overlayValue),
    );
    assert.equal(restore.status, 200);
    assert.deepEqual(await restore.json(), { mediaId: TOP_ID, hiddenFromKitAt: null });
  });

  it("maps each failure mode", async () => {
    const unauthenticated = await postVisibility("/api/media/hide", { mediaId: TOP_ID });
    assert.equal(unauthenticated.status, 401);
    assert.deepEqual(await unauthenticated.json(), { error: "unauthenticated" });

    const invalid = await postVisibility(
      "/api/media/restore",
      { mediaId: 1 },
      cookieHeader(DEMO_HANDLE),
    );
    assert.equal(invalid.status, 400);
    assert.deepEqual(await invalid.json(), { error: "invalid_body" });

    const missing = await postVisibility(
      "/api/media/hide",
      { mediaId: "nope" },
      cookieHeader(DEMO_HANDLE),
    );
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { error: "not_found" });
  });

  it("does not use localStorage", async () => {
    const response = await mediaVisibilityResponse(
      new Request("http://localhost/api/media/hide", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader(DEMO_HANDLE),
        },
        body: JSON.stringify({ mediaId: TOP_ID }),
      }),
      "hide",
    );
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), /localStorage/);
  });
});
