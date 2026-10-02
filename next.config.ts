import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sample imagery is served from Unsplash's CDN. The query string is fixed by
    // `unsplash()` in src/lib/catalog.ts so the upstream file is pre-sized.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
        search: "?w=2400&q=80&fm=jpg&fit=max",
      },
    ],
    qualities: [75],
  },
};

export default nextConfig;
