import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: ["@whatmatters/wmds"],
  agentRules: false,
};

export default nextConfig;

initOpenNextCloudflareForDev();
