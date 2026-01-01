import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile monorepo packages to avoid React version conflicts
  transpilePackages: ['@cc/types'],
  // Next.js 16 uses Turbopack by default
  turbopack: {},
}

export default nextConfig
