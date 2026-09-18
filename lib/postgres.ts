/**
 * Postgres client for Neon via Cloudflare Hyperdrive.
 *
 * Choice: `postgres` (postgres.js). Cloudflare Hyperdrive docs use it on
 * Workers with `nodejs_compat`. No native bindings. Parameterized queries
 * via `$1…` (`sql.unsafe(text, values)`). Fresh client per request — do not
 * keep a module-level pool (OpenNext / Workers I/O cannot cross requests).
 *
 * Options match the Hyperdrive postgres.js example: `max: 5`,
 * `fetch_types: false`, `prepare: true`.
 */

import postgres from "postgres";

export type SqlQueryRow = Record<string, unknown>;

export type SqlExecutor = {
  query<T extends SqlQueryRow = SqlQueryRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<T[]>;
};

export const POSTGRES_CLIENT = "postgres.js";

const HYPERDRIVE_POSTGRES_OPTIONS = {
  max: 5,
  fetch_types: false,
  prepare: true,
} as const;

export function createPostgresExecutor(connectionString: string): SqlExecutor {
  const sql = postgres(connectionString, HYPERDRIVE_POSTGRES_OPTIONS);
  return {
    async query<T extends SqlQueryRow = SqlQueryRow>(
      text: string,
      values: readonly unknown[] = [],
    ): Promise<T[]> {
      const rows = await sql.unsafe(text, values as never[]);
      return [...rows] as T[];
    },
  };
}
