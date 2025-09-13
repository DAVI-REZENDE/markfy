import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@apollo/client'],
  experimental: {
    esmExternals: 'loose'
  },
  output: 'standalone',
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'
  }
};

export default nextConfig;
