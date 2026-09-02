/**
 * Same column names as DATA.md / db/*.sql.
 * Stub seed and live Graph write these types. Do not add bio, rates, geo, DMs.
 */

export const USER_COLUMNS = [
  "id",
  "ig_user_id",
  "handle",
  "name",
  "avatar_r2_key",
  "followers",
  "media_count",
  "token_encrypted",
  "refresh_encrypted",
  "token_expires_at",
  "connected_at",
  "disconnected_at",
  "consent_index",
  "ig_account_type",
  "disclosure_version",
] as const;

export const MEDIA_COLUMNS = [
  "id",
  "user_id",
  "ig_media_id",
  "permalink",
  "posted_at",
  "media_type",
  "product_type",
  "caption",
  "r2_key",
  "like_count",
  "comments_count",
  "reach",
  "saves",
  "shares",
  "impressions",
  "fetched_at",
  "insights_fetched_at",
] as const;

export const DETECTION_COLUMNS = [
  "media_id",
  "label",
  "confidence",
  "model_version",
  "detected_at",
] as const;

export type MediaType = "IMAGE" | "VIDEO" | "CAROUSEL";

export type User = {
  id: string;
  ig_user_id: string;
  handle: string;
  name: string;
  avatar_r2_key: string | null;
  followers: number;
  media_count: number;
  token_encrypted: string | null;
  refresh_encrypted: string | null;
  token_expires_at: string | null;
  connected_at: string;
  disconnected_at: string | null;
  consent_index: boolean;
  ig_account_type: string | null;
  disclosure_version: number;
};

export type Media = {
  id: string;
  user_id: string;
  ig_media_id: string;
  permalink: string;
  posted_at: string;
  media_type: MediaType;
  product_type: string | null;
  caption: string | null;
  r2_key: string;
  like_count: number;
  comments_count: number;
  reach: number | null;
  saves: number | null;
  shares: number | null;
  impressions: number | null;
  fetched_at: string;
  insights_fetched_at: string | null;
};

export type Detection = {
  media_id: string;
  label: string;
  confidence: number;
  model_version: string;
  detected_at: string;
};

/** Empty until the first consented rollup. No identifying columns. */
export type WeeklyCount = Record<string, never>;
