import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mailparser'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

