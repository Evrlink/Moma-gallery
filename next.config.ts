import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['wagmi', 'viem'],
  },
};

export default nextConfig;
