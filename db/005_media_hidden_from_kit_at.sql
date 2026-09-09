-- media.hidden_from_kit_at — owner hide-from-kit (not Graph).
-- Null = visible on the public kit. ISO timestamp when hidden.
-- Hide/restore are idempotent. Public kit filters this before selectSixPosts.
-- Owner Insights keeps the row so Undo can restore.

ALTER TABLE media ADD COLUMN hidden_from_kit_at timestamptz;
