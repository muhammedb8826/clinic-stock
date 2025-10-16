import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Vercel handles optimization automatically, no need for standalone output
  eslint: {
    // Disable ESLint during builds in Docker
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // Disable TypeScript errors during builds in Docker
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
