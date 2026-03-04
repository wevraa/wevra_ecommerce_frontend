import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "txfwxhyfvdovpdeqahsm.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.wevraa.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
