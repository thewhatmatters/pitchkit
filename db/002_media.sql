-- media — one row per post we actually fetched (first kit: one page).
-- r2_key is the canonical image: carousel first frame, video poster only.
-- Bytes live in R2, not SQL. Insights columns are nullable until fetch succeeds.

CREATE TABLE media (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  ig_media_id text NOT NULL UNIQUE,
  permalink text NOT NULL,
  posted_at timestamptz NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO', 'CAROUSEL')),
  product_type text,
  caption text,
  r2_key text NOT NULL,
  like_count integer NOT NULL,
  comments_count integer NOT NULL,
  reach integer,
  saves integer,
  shares integer,
  impressions integer,
  fetched_at timestamptz NOT NULL,
  insights_fetched_at timestamptz
);

CREATE INDEX media_user_posted_at_idx ON media (user_id, posted_at DESC);
