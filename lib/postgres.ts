/**
 * Postgres client for Supabase via Cloudflare Hyperdrive.
 *
 * Choice: `postgres` (postgres.js). Hyperdrive docs use it on Workers with
 * `nodejs_compat` against `env.HYPERDRIVE.connectionString`. Do not use
 * `@supabase/supabase-js` or Neon/Supabase serverless drivers on this path —
 * Hyperdrive is the pool. Origin URI is the Supabase **direct** connection
 * (port 5432), not the transaction pooler (6543).
 *
 * Parameterized queries via `$1…` (`sql.unsafe(text, values)`). Fresh client
 * per request — do not keep a module-level pool (OpenNext / Workers I/O
 * cannot cross requests). Options match the Hyperdrive postgres.js example:
 * `max: 5`, `fetch_types: false`, `prepare: true`.
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

/**
 * postgres.js `sql.unsafe` yields `(Row & Iterable<Row>)[]`. That does not
 * overlap a caller `T extends SqlQueryRow`, so OpenNext typecheck rejects
 * `as T[]` (TS2352). Assert through `unknown` — rows stay untyped SQL
 * records; `sql-store` maps them onto User / Media.
 */
export function asQueryRows<T extends SqlQueryRow = SqlQueryRow>(
  rows: readonly unknown[],
): T[] {
  return rows as unknown as T[];
}

export function createPostgresExecutor(connectionString: string): SqlExecutor {
  const sql = postgres(connectionString, HYPERDRIVE_POSTGRES_OPTIONS);
  return {
    async query<T extends SqlQueryRow = SqlQueryRow>(
      text: string,
      values: readonly unknown[] = [],
    ): Promise<T[]> {
      const rows = await sql.unsafe(text, values as never[]);
      return asQueryRows<T>([...rows]);
    },
  };
}
