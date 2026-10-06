import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 클립보드 읽기(붙여넣기 버튼)만 쓰고, 카메라·마이크·위치는 쓰지 않는다
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), clipboard-read=(self)" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
