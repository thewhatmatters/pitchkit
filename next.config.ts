import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: ["@thewhatmatters/wmds"],
  serverExternalPackages: ["postgres"],
  agentRules: false,
};

export default nextConfig;

initOpenNextCloudflareForDev();
