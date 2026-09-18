import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { emptySecrets, setSecretsForTests } from "./env";
import { GRAPH_HOST } from "./graph";
import { createMemoryHiddenKit, setHiddenKitNamespaceForTests } from "./hidden-kit";
import { pollInsights, shouldPollInsights } from "./poll";
import { loadOwnerKit } from "./store";
import { DEMO_HANDLE } from "./seed";

afterEach(() => {
  setSecretsForTests(undefined);
  setHiddenKitNamespaceForTests(undefined);
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("Insights poll", () => {
  it("is stale after 6h or when Refresh is tapped", () => {
    const now = new Date("2026-09-18T12:00:00.000Z");
    assert.equal(
      shouldPollInsights({
        token: "tok",
        polledAt: "2026-09-18T05:00:00.000Z",
        now,
      }),
      true,
    );
    assert.equal(
      shouldPollInsights({
        token: "tok",
        polledAt: "2026-09-18T10:00:00.000Z",
        now,
      }),
      false,
    );
    assert.equal(
      shouldPollInsights({
        token: "tok",
        polledAt: "2026-09-18T10:00:00.000Z",
        refresh: true,
        now,
      }),
      true,
    );
    assert.equal(shouldPollInsights({ token: null, polledAt: null, refresh: true }), false);
  });

  it("polls me + media + insights and skips 400 posts for medians", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = String(input);
      assert.match(url, new RegExp(GRAPH_HOST));
      if (url.includes("/me?")) {
        return jsonResponse({
          user_id: "1784",
          username: "rxndy.dxniel",
          name: "Randy",
          account_type: "MEDIA_CREATOR",
          followers_count: 97,
          media_count: 6,
        });
      }
      if (url.includes("/media?")) {
        return jsonResponse({
          data: [
            {
              id: "fresh",
              media_type: "IMAGE",
              permalink: "https://www.instagram.com/p/fresh/",
              timestamp: "2026-09-10T00:00:00+0000",
              like_count: 10,
              comments_count: 1,
              media_url: "https://cdn.example/fresh.jpg",
            },
            {
              id: "legacy",
              media_type: "IMAGE",
              permalink: "https://www.instagram.com/p/legacy/",
              timestamp: "2026-08-01T00:00:00+0000",
              like_count: 4,
              comments_count: 0,
              media_url: "https://cdn.example/legacy.jpg",
            },
          ],
        });
      }
      if (url.includes("/fresh/insights")) {
        return jsonResponse({
          data: [
            { name: "reach", values: [{ value: 50 }] },
            { name: "saved", values: [{ value: 2 }] },
            { name: "shares", values: [{ value: 1 }] },
            { name: "views", values: [{ value: 80 }] },
          ],
        });
      }
      if (url.includes("/legacy/insights")) {
        return jsonResponse({ error: { message: "not available" } }, 400);
      }
      if (url.includes("metric=reach") && url.includes("time_series")) {
        return jsonResponse({
          data: [{ name: "reach", values: [{ value: 0, end_time: "2026-09-17T07:00:00+0000" }] }],
        });
      }
      if (url.includes("follower_demographics")) {
        return jsonResponse({ data: [{ total_value: { breakdowns: [{ results: [] }] } }] });
      }
      return jsonResponse({ error: { message: "unexpected " + url } }, 500);
    };

    const result = await pollInsights({
      token: "operator-token",
      secrets: { ...emptySecrets(), GRAPH_API_VERSION: "v25.0" },
      now: new Date("2026-09-18T12:00:00.000Z"),
      handle: "demo",
      userId: "00000000-0000-4000-8000-000000000001",
      fetch: fetchMock,
    });
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.snapshot.user.followers, 97);
    assert.equal(result.snapshot.user.ig_account_type, "MEDIA_CREATOR");
    assert.equal(result.snapshot.media.length, 2);
    const fresh = result.snapshot.media.find((row) => row.ig_media_id === "fresh");
    const legacy = result.snapshot.media.find((row) => row.ig_media_id === "legacy");
    assert.equal(fresh?.reach, 50);
    assert.equal(fresh?.saves, 2);
    assert.equal(legacy?.reach, null);
    assert.equal(legacy?.like_count, 4);
    assert.equal(legacy?.insights_fetched_at, null);
    assert.deepEqual(result.snapshot.reach_series, []);
    assert.deepEqual(result.snapshot.audience.country, []);
    assert.deepEqual(result.snapshot.audience, {
      country: [],
      city: [],
      age: [],
      gender: [],
    });
  });

  it("loadOwnerKit stays on seed when secrets and token are missing", async () => {
    setHiddenKitNamespaceForTests(createMemoryHiddenKit());
    setSecretsForTests(emptySecrets());
    const owner = await loadOwnerKit(DEMO_HANDLE, new Date("2026-09-02T12:00:00.000Z"));
    assert.ok(owner);
    assert.equal(owner.user.handle, DEMO_HANDLE);
    assert.equal(owner.hasInsights, true);
    assert.ok(owner.reach_series && owner.reach_series.length === 30);
    // Tokenless seed may keep example reach_series; audience stays empty
    // (insufficient-data Card), never EXAMPLE country/city/age/gender mixes.
    assert.deepEqual(owner.audience, {
      country: [],
      city: [],
      age: [],
      gender: [],
    });
  });
});
