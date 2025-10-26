import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Vercel handles optimization automatically, no need for standalone output
  images: {
    unoptimized: true, // Required for static export
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
