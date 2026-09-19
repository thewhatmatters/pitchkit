/**
 * Insights poll: one media page + Insights when token present and stale (>6h) or Refresh.
 * Persist users / media columns. Assemble reach_series + audience on the payload.
 */

import { rankedSharesFromDemographics } from "./demographics";
import type { PitchkitSecrets } from "./env";
import {
  createGraphClient,
  fetchFollowerDemographics,
  fetchMe,
  fetchMediaInsights,
  fetchMediaPage,
  fetchUserReachSeries,
  igUserIdFromMe,
  isPersonalAccount,
  isProfessionalAccount,
  mapMediaType,
  mediaImageUrl,
  type GraphClient,
  type GraphMe,
  type GraphMedia,
  type MediaInsights,
} from "./graph";
import {
  EMPTY_AUDIENCE,
  type AudienceMixes,
  type GraphSnapshot,
} from "./graph-store";
import { decryptToken } from "./token-crypto";
import { shouldShowReachChart, type ReachPoint } from "./reach-series";
import type { Media, User } from "./schema";
import { DEMO_HANDLE } from "./seed";

export const POLL_STALE_MS = 6 * 60 * 60 * 1000;

export type PollFailure =
  | "personal"
  | "no_token"
  | "me_failed"
  | "media_failed"
  | "not_professional";

export type PollSuccess = {
  ok: true;
  snapshot: GraphSnapshot;
};

export type PollError = {
  ok: false;
  reason: PollFailure;
};

export type PollResult = PollSuccess | PollError;

export type PollOptions = {
  token: string;
  secrets: PitchkitSecrets;
  now?: Date;
  existing?: GraphSnapshot | null;
  /** First-connect handle. Reconnect keeps existing unless updateHandle. */
  handle?: string;
  userId?: string;
  updateHandle?: boolean;
  fetch?: typeof fetch;
};

function newId(): string {
  return crypto.randomUUID();
}

export function isFetchedAtStale(fetchedAt: string | null | undefined, now: Date): boolean {
  if (!fetchedAt) {
    return true;
  }
  const stamp = new Date(fetchedAt).getTime();
  if (!Number.isFinite(stamp)) {
    return true;
  }
  return now.getTime() - stamp > POLL_STALE_MS;
}

export function shouldPollInsights(input: {
  token: string | null;
  polledAt: string | null | undefined;
  refresh?: boolean;
  now?: Date;
}): boolean {
  if (!input.token) {
    return false;
  }
  if (input.refresh) {
    return true;
  }
  return isFetchedAtStale(input.polledAt, input.now ?? new Date());
}

/**
 * Token for an Insights poll.
 * Seed `demo` never polls — operator `IG_USER_TOKEN` must not bind a live
 * Graph identity onto the frozen demo kit (Share would copy `/k/demo`).
 * Live OAuth users use their encrypted token; operator token is fallback
 * only for non-demo rows without `token_encrypted`.
 */
export async function resolveAccessToken(
  user: Pick<User, "token_encrypted" | "handle"> | null | undefined,
  secrets: PitchkitSecrets,
): Promise<string | null> {
  if (user?.handle === DEMO_HANDLE) {
    return null;
  }
  const stored = await decryptToken(user?.token_encrypted, secrets.TOKEN_KEY);
  if (stored) {
    return stored;
  }
  return secrets.IG_USER_TOKEN;
}

function mapMeToUser(input: {
  me: GraphMe;
  existing?: User | null;
  handle: string;
  userId: string;
  now: string;
  tokenEncrypted: string | null;
  tokenExpiresAt: string | null;
}): User {
  const igUserId = igUserIdFromMe(input.me) ?? input.existing?.ig_user_id ?? input.userId;
  return {
    id: input.userId,
    ig_user_id: igUserId,
    handle: input.handle,
    name: input.me.name?.trim() || input.existing?.name || input.me.username || input.handle,
    avatar_r2_key: input.me.profile_picture_url ?? input.existing?.avatar_r2_key ?? null,
    followers: typeof input.me.followers_count === "number" ? input.me.followers_count : input.existing?.followers ?? 0,
    media_count: typeof input.me.media_count === "number" ? input.me.media_count : input.existing?.media_count ?? 0,
    token_encrypted: input.tokenEncrypted,
    refresh_encrypted: input.existing?.refresh_encrypted ?? null,
    token_expires_at: input.tokenExpiresAt,
    connected_at: input.existing?.connected_at ?? input.now,
    disconnected_at: null,
    consent_index: input.existing?.consent_index ?? false,
    ig_account_type: input.me.account_type ?? input.existing?.ig_account_type ?? null,
    disclosure_version: input.existing?.disclosure_version ?? 1,
  };
}

function mapGraphMedia(row: GraphMedia, userId: string, fetchedAt: string, previous?: Media): Media | null {
  if (!row.id) {
    return null;
  }
  const image = mediaImageUrl(row);
  return {
    id: previous?.id ?? crypto.randomUUID(),
    user_id: userId,
    ig_media_id: row.id,
    permalink: row.permalink ?? previous?.permalink ?? `https://www.instagram.com/p/${row.id}/`,
    posted_at: row.timestamp ?? previous?.posted_at ?? fetchedAt,
    media_type: mapMediaType(row.media_type),
    product_type: row.media_product_type ?? previous?.product_type ?? null,
    caption: row.caption ?? previous?.caption ?? null,
    r2_key: image ?? previous?.r2_key ?? "",
    like_count: typeof row.like_count === "number" ? row.like_count : previous?.like_count ?? 0,
    comments_count: typeof row.comments_count === "number" ? row.comments_count : previous?.comments_count ?? 0,
    reach: previous?.reach ?? null,
    saves: previous?.saves ?? null,
    shares: previous?.shares ?? null,
    impressions: previous?.impressions ?? null,
    fetched_at: fetchedAt,
    insights_fetched_at: previous?.insights_fetched_at ?? null,
    hidden_from_kit_at: previous?.hidden_from_kit_at ?? null,
  };
}

function applyInsights(row: Media, insights: MediaInsights, fetchedAt: string): Media {
  if (insights.skipped) {
    return {
      ...row,
      reach: null,
      saves: null,
      shares: null,
      impressions: null,
      insights_fetched_at: null,
    };
  }
  return {
    ...row,
    reach: insights.reach,
    saves: insights.saves,
    shares: insights.shares,
    impressions: insights.views,
    insights_fetched_at: fetchedAt,
  };
}

async function pollAudience(client: GraphClient, igUserId: string, followers: number): Promise<AudienceMixes> {
  if (followers > 0 && followers < 100) {
    return EMPTY_AUDIENCE;
  }

  const [country, city, age, gender] = await Promise.all([
    fetchFollowerDemographics(client, igUserId, "country"),
    fetchFollowerDemographics(client, igUserId, "city"),
    fetchFollowerDemographics(client, igUserId, "age"),
    fetchFollowerDemographics(client, igUserId, "gender"),
  ]);

  const mixes: AudienceMixes = {
    country: country.ok ? rankedSharesFromDemographics(country.data) : [],
    city: city.ok ? rankedSharesFromDemographics(city.data) : [],
    age: age.ok ? rankedSharesFromDemographics(age.data) : [],
    gender: gender.ok ? rankedSharesFromDemographics(gender.data) : [],
  };

  const anyRows = (mixes.country.length + mixes.city.length + mixes.age.length + mixes.gender.length) > 0;
  return anyRows ? mixes : EMPTY_AUDIENCE;
}

export function payloadReachSeries(series: ReachPoint[] | null | undefined): ReachPoint[] {
  return shouldShowReachChart(series) ? series ?? [] : [];
}

export async function pollInsights(options: PollOptions): Promise<PollResult> {
  const now = options.now ?? new Date();
  const fetchedAt = now.toISOString();
  const client = createGraphClient({
    token: options.token,
    version: options.secrets.GRAPH_API_VERSION,
    fetch: options.fetch,
  });

  const meResult = await fetchMe(client);
  if (!meResult.ok) {
    return { ok: false, reason: "me_failed" };
  }
  const me = meResult.data;
  if (isPersonalAccount(me.account_type) || (me.account_type && !isProfessionalAccount(me.account_type))) {
    return { ok: false, reason: "personal" };
  }
  const igUserId = igUserIdFromMe(me);
  if (!igUserId) {
    return { ok: false, reason: "me_failed" };
  }

  const existing = options.existing ?? null;
  const userId = options.userId ?? existing?.user.id ?? newId();
  const handle = options.handle ?? existing?.user.handle ?? me.username ?? userId;

  const mediaResult = await fetchMediaPage(client, igUserId);
  if (!mediaResult.ok) {
    return { ok: false, reason: "media_failed" };
  }

  const previousByIg = new Map((existing?.media ?? []).map((row) => [row.ig_media_id, row]));
  const mapped: Media[] = [];
  for (const row of mediaResult.data.data ?? []) {
    const media = mapGraphMedia(row, userId, fetchedAt, previousByIg.get(row.id ?? ""));
    if (media) {
      mapped.push(media);
    }
  }

  const withInsights: Media[] = [];
  for (const row of mapped) {
    const insights = await fetchMediaInsights(client, row.ig_media_id);
    if (!insights.ok) {
      withInsights.push(row);
      continue;
    }
    withInsights.push(applyInsights(row, insights.data, fetchedAt));
  }

  const reachResult = await fetchUserReachSeries(client, igUserId);
  const reachSeries = reachResult.ok ? payloadReachSeries(reachResult.data) : [];

  const user = mapMeToUser({
    me,
    existing: existing?.user ?? null,
    handle,
    userId,
    now: existing?.user.connected_at ?? fetchedAt,
    tokenEncrypted: existing?.user.token_encrypted ?? null,
    tokenExpiresAt: existing?.user.token_expires_at ?? null,
  });

  const audience = await pollAudience(client, igUserId, user.followers);

  return {
    ok: true,
    snapshot: {
      user,
      media: withInsights,
      reach_series: reachSeries,
      audience,
      polled_at: fetchedAt,
    },
  };
}

