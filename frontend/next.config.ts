import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Vercel handles optimization automatically, no need for standalone output
  images: {
    unoptimized: true, // Required for static export
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Only enable if needed.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has type errors. Only enable if needed.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
