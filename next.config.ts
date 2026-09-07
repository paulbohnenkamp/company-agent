import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The local browser check uses 127.0.0.1 while developers often use
  // localhost. Allow both origins so Next can serve client bundles locally.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Keep production output tracing inside this repository. Without an
  // explicit root, Next can walk the user's parent directory during tracing.
  outputFileTracingRoot: process.cwd(),
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
