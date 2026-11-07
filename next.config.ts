import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 본문 추출용 무거운 패키지는 번들에 넣지 않고 그대로 불러온다 (배포 서버 오류 방지)
  serverExternalPackages: ["jsdom"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
