/** Generated shape for OpenNext `getCloudflareContext().env`. */
interface CloudflareEnv {
  HIDDEN_KIT: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
}
