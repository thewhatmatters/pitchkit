-- weekly_counts — create now, leave empty until consented rollups exist.
-- Write only when users.consent_index is true (default off).
-- Column names lock with the first rollup. This table must not identify a person.
-- Allowed later: time bucket, metric name, hashed or global cohort, integer.
-- Forbidden: user_id, ig_user_id, handle, name, tokens, captions, permalinks.
--
-- Postgres needs at least one column. `_placeholder` is not a rollup field and
-- must never store creator data. Drop it when real columns land.

CREATE TABLE weekly_counts (
  _placeholder boolean NOT NULL DEFAULT true
);
