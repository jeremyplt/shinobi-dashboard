import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Vercel deployment
  poweredByHeader: false,

  // Turbopack root to avoid lockfile warnings
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
