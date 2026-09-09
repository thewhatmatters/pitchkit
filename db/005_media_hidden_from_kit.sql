-- media.hidden_from_kit_at — public-kit visibility only (WHA-312).
-- NULL = eligible for the six-post pick on /k/[handle].
-- timestamptz = hidden from the public kit. Row and R2 object stay.
-- Owner Insights still lists the post so restore / Undo works.

ALTER TABLE media
  ADD COLUMN hidden_from_kit_at timestamptz;
