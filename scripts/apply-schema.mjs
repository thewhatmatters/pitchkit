#!/usr/bin/env node
/**
 * One-shot apply of db/*.sql (lexical order). Not a migration framework.
 * Creates users, media, empty detections, empty weekly_counts, and
 * media.hidden_from_kit_at. Files use IF NOT EXISTS so re-runs are safe.
 *
 * Usage (after Randy has the Supabase **direct** URI, port 5432):
 *   HYPERDRIVE_LOCAL_CONNECTION_STRING='postgresql://…:5432/postgres' npm run db:apply
 *   DATABASE_URL='postgresql://…:5432/postgres' npm run db:apply
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const connectionString = (
  process.env.HYPERDRIVE_LOCAL_CONNECTION_STRING ||
  process.env.DATABASE_URL ||
  ""
).trim();

if (!connectionString) {
  console.error(
    "Set HYPERDRIVE_LOCAL_CONNECTION_STRING or DATABASE_URL to the Supabase direct URI (port 5432), then re-run npm run db:apply.",
  );
  process.exit(1);
}

const dir = join(root, "db");
const files = (await readdir(dir))
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error(`No db/*.sql files in ${dir}`);
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1, prepare: true });
try {
  for (const file of files) {
    const text = await readFile(join(dir, file), "utf8");
    process.stdout.write(`apply ${file}\n`);
    await sql.unsafe(text);
  }
  process.stdout.write("schema applied (users, media, detections, weekly_counts).\n");
} finally {
  await sql.end({ timeout: 5 });
}
