import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "**.api-sports.io" },
    ],
  },
  experimental: {
    // Keep server actions available for future admin forms if needed.
  },
};

export default nextConfig;
