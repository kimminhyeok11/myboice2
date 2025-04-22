import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 다른 config 옵션이 있으면 여기에 추가
};

export default nextConfig;
