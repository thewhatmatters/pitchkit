import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const DB_DIR = join(process.cwd(), "db");

describe("schema SQL one-shot apply", () => {
  it("ships users/media plus empty detections and weekly_counts, idempotent", () => {
    const files = readdirSync(DB_DIR).filter((name) => name.endsWith(".sql")).sort();
    assert.deepEqual(files, [
      "001_users.sql",
      "002_media.sql",
      "003_detections.sql",
      "004_weekly_counts.sql",
      "005_media_hidden_from_kit.sql",
    ]);

    const texts = Object.fromEntries(
      files.map((name) => [name, readFileSync(join(DB_DIR, name), "utf8")]),
    );

    assert.match(texts["001_users.sql"]!, /CREATE TABLE IF NOT EXISTS users/);
    assert.match(texts["002_media.sql"]!, /CREATE TABLE IF NOT EXISTS media/);
    assert.match(texts["002_media.sql"]!, /hidden_from_kit_at/);
    assert.match(texts["003_detections.sql"]!, /CREATE TABLE IF NOT EXISTS detections/);
    assert.match(texts["004_weekly_counts.sql"]!, /CREATE TABLE IF NOT EXISTS weekly_counts/);
    assert.match(texts["005_media_hidden_from_kit.sql"]!, /ADD COLUMN IF NOT EXISTS hidden_from_kit_at/);

    for (const text of Object.values(texts)) {
      assert.doesNotMatch(text, /INSERT INTO/i);
    }
  });

  it("comments wrangler Hyperdrive until SQL persist is fixed, keeping the pitchkit config id", () => {
    const wrangler = readFileSync(join(process.cwd(), "wrangler.jsonc"), "utf8");
    assert.match(wrangler, /\/\/ Supabase Postgres via Hyperdrive/);
    assert.match(wrangler, /TODO: uncomment when SQL persist is fixed/);
    assert.match(wrangler, /port 5432/);
    assert.match(wrangler, /\/\/\s+"hyperdrive":/);
    assert.doesNotMatch(wrangler, /^\s+"hyperdrive":/m);
    assert.match(wrangler, /"binding": "HYPERDRIVE"/);
    assert.match(wrangler, /"binding": "HYPERDRIVE_PREVIEW"/);
    assert.match(wrangler, /bf225442516d44f599e083b72df886cd/);
    assert.doesNotMatch(wrangler, /<todo-hyperdrive-id>/);
  });
});
