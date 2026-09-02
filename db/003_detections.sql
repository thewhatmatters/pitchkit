-- detections — create now, leave empty until computer vision exists.
-- Future CV joins detections.media_id → media.id. No rows in v1.

CREATE TABLE detections (
  media_id uuid NOT NULL REFERENCES media (id) ON DELETE CASCADE,
  label text NOT NULL,
  confidence double precision NOT NULL,
  model_version text NOT NULL,
  detected_at timestamptz NOT NULL
);
