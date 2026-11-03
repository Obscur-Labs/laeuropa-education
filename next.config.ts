import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Vercel rejects request bodies above 4.5 MB; images are compressed in the browser first
      bodySizeLimit: "4mb",
    },
  },
  // sharp is a native module; keep it out of the server bundle
  serverExternalPackages: ["sharp"],
  async headers() {
    // Static files (certificates, logo) — the dynamic pages get their headers from src/proxy.ts
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
    ];
  },
};

export default nextConfig;
