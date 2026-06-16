import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a parent lockfile exists in the
  // user's home dir, which otherwise triggers a root-inference warning).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
