import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        'D:/pagefile.sys',
        'D:/System Volume Information/**',
        'D:/$RECYCLE.BIN/**',
      ],
    };
    return config;
  },
};

export default nextConfig;
