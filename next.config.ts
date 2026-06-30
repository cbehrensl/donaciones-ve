import type { NextConfig } from "next";

const ALLOWED_FRAME_ORIGINS = process.env.ALLOWED_FRAME_ORIGINS ?? "https://www.farmatodo.com.co https://www.farmatodo.com.ve http://localhost:4200 http://localhost:3000";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${ALLOWED_FRAME_ORIGINS}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
