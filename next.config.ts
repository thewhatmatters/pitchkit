import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: ["@whatmatters/wmds"],
};

export default nextConfig;

initOpenNextCloudflareForDev();
