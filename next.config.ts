import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile in the home folder otherwise confuses Turbopack).
  turbopack: { root: __dirname },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
};

export default nextConfig;
