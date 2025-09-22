import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'laqsbz76lppvjhgp.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
