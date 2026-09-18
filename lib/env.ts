/**
 * Workers secrets / Infisical / process env. Never log values.
 * node:test ignores process env so CI cannot accidentally poll Graph.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

export const DEFAULT_GRAPH_API_VERSION = "v25.0";
export const DEFAULT_REDIRECT_URI = "https://pitchkit.app/auth/instagram";

/** Instagram Login scopes only. */
export const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_insights",
] as const;

export type PitchkitSecrets = {
  IG_APP_ID: string | null;
  IG_APP_SECRET: string | null;
  TOKEN_KEY: string | null;
  /** Temporary operator dry-run token. Not an OAuth cookie. */
  IG_USER_TOKEN: string | null;
  GRAPH_API_VERSION: string;
  IG_REDIRECT_URI: string | null;
};

export type SecretsAccess = "route" | "page";

let injectedSecrets: PitchkitSecrets | null | undefined;

export function emptySecrets(): PitchkitSecrets {
  return {
    IG_APP_ID: null,
    IG_APP_SECRET: null,
    TOKEN_KEY: null,
    IG_USER_TOKEN: null,
    GRAPH_API_VERSION: DEFAULT_GRAPH_API_VERSION,
    IG_REDIRECT_URI: null,
  };
}

/** Tests: pass a bag, `null` for empty, or `undefined` to restore default. */
export function setSecretsForTests(secrets: PitchkitSecrets | null | undefined): void {
  injectedSecrets = secrets;
}

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function graphVersion(value: unknown): string {
  const raw = nonEmpty(value);
  if (!raw || raw === "latest") {
    return DEFAULT_GRAPH_API_VERSION;
  }
  return raw.startsWith("v") ? raw : `v${raw}`;
}

export function secretsFromRecord(record: Record<string, unknown> | undefined): PitchkitSecrets {
  const env = record ?? {};
  return {
    IG_APP_ID: nonEmpty(env.IG_APP_ID),
    IG_APP_SECRET: nonEmpty(env.IG_APP_SECRET),
    TOKEN_KEY: nonEmpty(env.TOKEN_KEY),
    IG_USER_TOKEN: nonEmpty(env.IG_USER_TOKEN) ?? nonEmpty(env.IG_USER_ACCESS_TOKEN),
    GRAPH_API_VERSION: graphVersion(env.GRAPH_API_VERSION),
    IG_REDIRECT_URI: nonEmpty(env.IG_REDIRECT_URI),
  };
}

export function hasLiveAuthSecrets(secrets: PitchkitSecrets): boolean {
  return secrets.IG_APP_ID != null && secrets.IG_APP_SECRET != null;
}

export function hasOperatorToken(secrets: PitchkitSecrets): boolean {
  return secrets.IG_USER_TOKEN != null;
}

function processEnvRecord(): Record<string, unknown> {
  return process.env as Record<string, unknown>;
}

/** Sync read for tests and Node. Cloud pages/routes should prefer `readSecrets`. */
export function readProcessSecrets(): PitchkitSecrets {
  if (injectedSecrets !== undefined) {
    return injectedSecrets ?? emptySecrets();
  }
  // node:test sets this — do not inherit operator tokens from the shell.
  if (process.env.NODE_TEST_CONTEXT) {
    return emptySecrets();
  }
  return secretsFromRecord(processEnvRecord());
}

function secretsFromUnknownEnv(env: unknown): PitchkitSecrets | null {
  if (!env || typeof env !== "object") {
    return null;
  }
  return secretsFromRecord(env as Record<string, unknown>);
}

/**
 * Routes: `getCloudflareContext().env`.
 * Pages: `await getCloudflareContext({ async: true }).env`.
 * Falls back to process.env when the Worker binding is missing (local Next).
 */
export async function readSecrets(access: SecretsAccess = "page"): Promise<PitchkitSecrets> {
  if (injectedSecrets !== undefined) {
    return injectedSecrets ?? emptySecrets();
  }
  if (process.env.NODE_TEST_CONTEXT) {
    return emptySecrets();
  }

  try {
    const ctx =
      access === "page" ? await getCloudflareContext({ async: true }) : getCloudflareContext();
    const fromWorker = secretsFromUnknownEnv(ctx.env);
    if (fromWorker && (hasLiveAuthSecrets(fromWorker) || hasOperatorToken(fromWorker) || fromWorker.TOKEN_KEY)) {
      return {
        ...fromWorker,
        GRAPH_API_VERSION: fromWorker.GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION,
      };
    }
    const processSecrets = secretsFromRecord(processEnvRecord());
    return {
      IG_APP_ID: fromWorker?.IG_APP_ID ?? processSecrets.IG_APP_ID,
      IG_APP_SECRET: fromWorker?.IG_APP_SECRET ?? processSecrets.IG_APP_SECRET,
      TOKEN_KEY: fromWorker?.TOKEN_KEY ?? processSecrets.TOKEN_KEY,
      IG_USER_TOKEN: fromWorker?.IG_USER_TOKEN ?? processSecrets.IG_USER_TOKEN,
      GRAPH_API_VERSION:
        fromWorker?.GRAPH_API_VERSION || processSecrets.GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION,
      IG_REDIRECT_URI: fromWorker?.IG_REDIRECT_URI ?? processSecrets.IG_REDIRECT_URI,
    };
  } catch {
    return secretsFromRecord(processEnvRecord());
  }
}
