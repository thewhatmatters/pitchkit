/** Generated shape for OpenNext `getCloudflareContext().env`. */
interface CloudflareEnv {
  HIDDEN_KIT: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
  /** Present only after Randy binds Hyperdrive. Leave wrangler ids commented until then. */
  HYPERDRIVE?: {
    connectionString: string;
  };
  HYPERDRIVE_PREVIEW?: {
    connectionString: string;
  };
  IG_APP_ID?: string;
  IG_APP_SECRET?: string;
  TOKEN_KEY?: string;
  IG_USER_TOKEN?: string;
  GRAPH_API_VERSION?: string;
  IG_REDIRECT_URI?: string;
}
