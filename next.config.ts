import type { NextConfig } from "next";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.9", "192.168.1.22", "192.168.1.11"],
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    return {
      // beforeFiles: must win over the [[...slug]] catch-all page
      beforeFiles: [
        {
          source: "/api/v1/:path*",
          destination: `${BACKEND_API_URL}/api/v1/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
