/**
 * Instagram Login Graph client. Host is graph.instagram.com (not Facebook).
 * Pin GRAPH_API_VERSION. Do not float "latest".
 */

import { DEFAULT_GRAPH_API_VERSION } from "./env";
import { utcDayFromGraphEndTime, type ReachPoint } from "./reach-series";
import type { MediaType } from "./schema";

export const GRAPH_HOST = "https://graph.instagram.com";

export const ME_FIELDS = [
  "user_id",
  "username",
  "name",
  "account_type",
  "profile_picture_url",
  "followers_count",
  "media_count",
].join(",");

export const MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_product_type",
  "permalink",
  "timestamp",
  "like_count",
  "comments_count",
  "media_url",
  "thumbnail_url",
  "children{media_url,media_type,thumbnail_url}",
].join(",");

/** Live 2026-09-18 (@rxndy.dxniel): reach, views, saved, shares after Professional. */
export const MEDIA_INSIGHTS_METRICS = ["reach", "views", "saved", "shares"] as const;

export const MEDIA_PAGE_LIMIT = 25;

export type GraphFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type GraphClient = {
  token: string;
  version: string;
  fetch: GraphFetch;
};

export type GraphError = {
  status: number;
  code?: number;
  message: string;
};

export type GraphResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: GraphError };

export type GraphMe = {
  user_id?: string;
  id?: string;
  username?: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
};

export type GraphMediaChild = {
  media_url?: string;
  media_type?: string;
  thumbnail_url?: string;
};

export type GraphMedia = {
  id?: string;
  caption?: string | null;
  media_type?: string;
  media_product_type?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  media_url?: string;
  thumbnail_url?: string;
  children?: { data?: GraphMediaChild[] };
};

export type GraphMediaPage = {
  data?: GraphMedia[];
  paging?: { next?: string };
};

export type GraphInsightValue = {
  value?: unknown;
  end_time?: string;
};

export type GraphInsight = {
  name?: string;
  period?: string;
  values?: GraphInsightValue[];
  total_value?: { value?: unknown };
};

export type GraphInsightsPayload = {
  data?: GraphInsight[];
  error?: { message?: string; code?: number };
};

export type MediaInsights = {
  reach: number | null;
  saves: number | null;
  shares: number | null;
  views: number | null;
  /** Pre-Personal→Professional media: Insights 400 — skip medians, keep likes/comments. */
  skipped: boolean;
};

export function createGraphClient(input: {
  token: string;
  version?: string;
  fetch?: GraphFetch;
}): GraphClient {
  return {
    token: input.token,
    version: input.version && input.version !== "latest" ? input.version : DEFAULT_GRAPH_API_VERSION,
    fetch: input.fetch ?? fetch,
  };
}

export function graphUrl(client: GraphClient, path: string, params: Record<string, string> = {}): string {
  const trimmed = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${GRAPH_HOST}/${client.version}${trimmed}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("access_token", client.token);
  return url.toString();
}

function errorFromBody(status: number, body: unknown): GraphError {
  const err = body && typeof body === "object" ? (body as { error?: { message?: string; code?: number } }).error : null;
  return {
    status,
    code: typeof err?.code === "number" ? err.code : undefined,
    message: typeof err?.message === "string" ? err.message : `graph_${status}`,
  };
}

export async function graphGet<T>(
  client: GraphClient,
  path: string,
  params: Record<string, string> = {},
): Promise<GraphResult<T>> {
  try {
    const response = await client.fetch(graphUrl(client, path, params), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok) {
      return { ok: false, error: errorFromBody(response.status, body) };
    }
    return { ok: true, data: body as T };
  } catch (error) {
    return {
      ok: false,
      error: {
        status: 0,
        message: error instanceof Error ? error.message : "graph_network",
      },
    };
  }
}

export function igUserIdFromMe(me: GraphMe): string | null {
  const id = me.user_id ?? me.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/** Business or Media_Creator (any casing / underscore). Personal cannot power Insights. */
export function isProfessionalAccount(accountType: string | null | undefined): boolean {
  const normalized = (accountType ?? "").toLowerCase().replaceAll("_", "").replaceAll(" ", "");
  return normalized === "business" || normalized === "mediacreator";
}

export function isPersonalAccount(accountType: string | null | undefined): boolean {
  const normalized = (accountType ?? "").toLowerCase().replaceAll("_", "").replaceAll(" ", "");
  return normalized === "personal";
}

export function mapMediaType(graphType: string | null | undefined): MediaType {
  const raw = (graphType ?? "").toUpperCase();
  if (raw === "CAROUSEL_ALBUM" || raw === "CAROUSEL") {
    return "CAROUSEL";
  }
  if (raw === "VIDEO") {
    return "VIDEO";
  }
  return "IMAGE";
}

/** Carousel: first child frame. Video: poster (`thumbnail_url`). Image: `media_url`. */
export function mediaImageUrl(row: GraphMedia): string | null {
  const type = mapMediaType(row.media_type);
  if (type === "CAROUSEL") {
    const first = row.children?.data?.[0];
    return first?.thumbnail_url ?? first?.media_url ?? row.thumbnail_url ?? row.media_url ?? null;
  }
  if (type === "VIDEO") {
    return row.thumbnail_url ?? row.media_url ?? null;
  }
  return row.media_url ?? row.thumbnail_url ?? null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function insightMetricValue(insight: GraphInsight | undefined): number | null {
  if (!insight) {
    return null;
  }
  const fromValues = insight.values?.[0]?.value;
  if (typeof fromValues === "number" && Number.isFinite(fromValues)) {
    return fromValues;
  }
  return finiteNumber(insight.total_value?.value);
}

export function parseMediaInsights(payload: GraphInsightsPayload | null | undefined): MediaInsights {
  const rows = payload?.data ?? [];
  const byName = new Map(rows.map((row) => [row.name, row]));
  return {
    reach: insightMetricValue(byName.get("reach")),
    saves: insightMetricValue(byName.get("saved")),
    shares: insightMetricValue(byName.get("shares")),
    views: insightMetricValue(byName.get("views")),
    skipped: false,
  };
}

export function skippedMediaInsights(): MediaInsights {
  return { reach: null, saves: null, shares: null, views: null, skipped: true };
}

export function parseReachTimeSeries(payload: GraphInsightsPayload | null | undefined): ReachPoint[] {
  const values = payload?.data?.find((row) => row.name === "reach")?.values ?? [];
  const points: ReachPoint[] = [];
  for (const row of values) {
    if (typeof row.end_time !== "string" || typeof row.value !== "number" || !Number.isFinite(row.value)) {
      continue;
    }
    points.push({
      day: utcDayFromGraphEndTime(row.end_time),
      reach: row.value,
    });
  }
  return points;
}

export async function fetchMe(client: GraphClient): Promise<GraphResult<GraphMe>> {
  return graphGet<GraphMe>(client, "/me", { fields: ME_FIELDS });
}

export async function fetchMediaPage(
  client: GraphClient,
  igUserId: string,
): Promise<GraphResult<GraphMediaPage>> {
  return graphGet<GraphMediaPage>(client, `/${igUserId}/media`, {
    fields: MEDIA_FIELDS,
    limit: String(MEDIA_PAGE_LIMIT),
  });
}

export async function fetchMediaInsights(
  client: GraphClient,
  igMediaId: string,
): Promise<GraphResult<MediaInsights>> {
  const result = await graphGet<GraphInsightsPayload>(client, `/${igMediaId}/insights`, {
    metric: MEDIA_INSIGHTS_METRICS.join(","),
  });
  if (!result.ok) {
    if (result.error.status === 400) {
      return { ok: true, data: skippedMediaInsights() };
    }
    return result;
  }
  return { ok: true, data: parseMediaInsights(result.data) };
}

export async function fetchUserReachSeries(
  client: GraphClient,
  igUserId: string,
): Promise<GraphResult<ReachPoint[]>> {
  const result = await graphGet<GraphInsightsPayload>(client, `/${igUserId}/insights`, {
    metric: "reach",
    period: "day",
    metric_type: "time_series",
  });
  if (!result.ok) {
    return result;
  }
  return { ok: true, data: parseReachTimeSeries(result.data) };
}

export async function fetchFollowerDemographics(
  client: GraphClient,
  igUserId: string,
  breakdown: "country" | "city" | "age" | "gender",
): Promise<GraphResult<import("./demographics").GraphDemographicsPayload>> {
  return graphGet(client, `/${igUserId}/insights`, {
    metric: "follower_demographics",
    period: "lifetime",
    metric_type: "total_value",
    breakdown,
  });
}
