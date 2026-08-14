import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Monorepo npm : next et les deps sont hoistes a la racine du repo
    root: path.join(__dirname, "../.."),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:3001/api"}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "crafatar.com" },
      { protocol: "https", hostname: "mc-heads.net" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
};

export default nextConfig;
