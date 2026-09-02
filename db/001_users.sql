-- users — one row per creator. Columns: DATA.md.
-- Handle is frozen at first successful connect. IG rename does not move our URL.
-- token_encrypted / refresh_encrypted are ciphertext. TOKEN_KEY is a Workers
-- secret and is never stored in SQL or git. Seed rows leave tokens null.

CREATE TABLE users (
  id uuid PRIMARY KEY,
  ig_user_id text NOT NULL UNIQUE,
  handle text NOT NULL UNIQUE,
  name text NOT NULL,
  avatar_r2_key text,
  followers integer NOT NULL,
  media_count integer NOT NULL,
  token_encrypted text,
  refresh_encrypted text,
  token_expires_at timestamptz,
  connected_at timestamptz NOT NULL,
  disconnected_at timestamptz,
  consent_index boolean NOT NULL DEFAULT false,
  ig_account_type text,
  disclosure_version integer NOT NULL DEFAULT 1
);
