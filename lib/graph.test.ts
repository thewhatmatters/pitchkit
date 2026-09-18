import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GRAPH_HOST,
  createGraphClient,
  fetchMediaInsights,
  graphUrl,
  igUserIdFromMe,
  isPersonalAccount,
  isProfessionalAccount,
  mapMediaType,
  mediaImageUrl,
  parseMediaInsights,
  parseReachTimeSeries,
  skippedMediaInsights,
} from "./graph";
import { DEFAULT_GRAPH_API_VERSION } from "./env";

describe("Instagram Login Graph client", () => {
  it("hosts graph.instagram.com and pins GRAPH_API_VERSION", () => {
    const client = createGraphClient({ token: "tok", version: "v25.0" });
    const url = graphUrl(client, "/me", { fields: "username" });
    assert.equal(url.startsWith(`${GRAPH_HOST}/${DEFAULT_GRAPH_API_VERSION}/me`), true);
    assert.match(url, /access_token=tok/);
    assert.doesNotMatch(url, /graph\.facebook\.com/);
    assert.equal(createGraphClient({ token: "x", version: "latest" }).version, "v25.0");
  });

  it("maps CAROUSEL_ALBUM → CAROUSEL and Professional account types", () => {
    assert.equal(mapMediaType("CAROUSEL_ALBUM"), "CAROUSEL");
    assert.equal(mapMediaType("IMAGE"), "IMAGE");
    assert.equal(mapMediaType("VIDEO"), "VIDEO");
    assert.equal(isProfessionalAccount("MEDIA_CREATOR"), true);
    assert.equal(isProfessionalAccount("Media_Creator"), true);
    assert.equal(isProfessionalAccount("BUSINESS"), true);
    assert.equal(isProfessionalAccount("Personal"), false);
    assert.equal(isPersonalAccount("PERSONAL"), true);
    assert.equal(igUserIdFromMe({ user_id: "1784" }), "1784");
  });

  it("picks carousel first frame and video poster", () => {
    assert.equal(
      mediaImageUrl({
        media_type: "CAROUSEL_ALBUM",
        children: { data: [{ media_url: "https://cdn.example/cover.jpg" }] },
      }),
      "https://cdn.example/cover.jpg",
    );
    assert.equal(
      mediaImageUrl({ media_type: "VIDEO", thumbnail_url: "https://cdn.example/poster.jpg" }),
      "https://cdn.example/poster.jpg",
    );
  });

  it("maps insights saved → saves and skips 400 pre-conversion media", async () => {
    const parsed = parseMediaInsights({
      data: [
        { name: "reach", values: [{ value: 40 }] },
        { name: "saved", values: [{ value: 3 }] },
        { name: "shares", values: [{ value: 1 }] },
        { name: "views", values: [{ value: 90 }] },
      ],
    });
    assert.deepEqual(parsed, {
      reach: 40,
      saves: 3,
      shares: 1,
      views: 90,
      skipped: false,
    });
    assert.equal(skippedMediaInsights().skipped, true);

    const client = createGraphClient({
      token: "tok",
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: "unsupported", code: 100 } }), {
          status: 400,
        }),
    });
    const skipped = await fetchMediaInsights(client, "old-media");
    assert.equal(skipped.ok, true);
    if (skipped.ok) {
      assert.equal(skipped.data.skipped, true);
      assert.equal(skipped.data.reach, null);
    }
  });

  it("maps user reach time_series end_time to UTC days", () => {
    const series = parseReachTimeSeries({
      data: [
        {
          name: "reach",
          values: [
            { value: 0, end_time: "2026-09-01T07:00:00+0000" },
            { value: 12, end_time: "2026-09-02T07:00:00+0000" },
          ],
        },
      ],
    });
    assert.deepEqual(series, [
      { day: "2026-09-01", reach: 0 },
      { day: "2026-09-02", reach: 12 },
    ]);
  });
});
