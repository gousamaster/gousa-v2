import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
