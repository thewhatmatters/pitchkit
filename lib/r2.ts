import { DEMO_USER_ID } from "./seed";

/**
 * Seed r2_key → local public placeholder. Live kits will use public R2 read
 * for the same keys. No R2 bucket is required for /k/demo.
 */
const SEED_PUBLIC: Record<string, string> = {
  [`${DEMO_USER_ID}/avatar.jpg`]: "/demo/avatar.svg",
  [`${DEMO_USER_ID}/media/demo-1.jpg`]: "/demo/post-1.svg",
  [`${DEMO_USER_ID}/media/demo-2-cover.jpg`]: "/demo/post-2.svg",
  [`${DEMO_USER_ID}/media/demo-3-poster.jpg`]: "/demo/post-3.svg",
  [`${DEMO_USER_ID}/media/demo-4.jpg`]: "/demo/post-4.svg",
  [`${DEMO_USER_ID}/media/demo-5.jpg`]: "/demo/post-5.svg",
  [`${DEMO_USER_ID}/media/demo-6.jpg`]: "/demo/post-6.svg",
};

export function publicObjectUrl(r2Key: string | null): string {
  if (!r2Key) {
    return "";
  }

  return SEED_PUBLIC[r2Key] ?? "";
}
