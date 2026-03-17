import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Production Railway
      {
        protocol: 'https',
        hostname: 'directus-production-daaa.up.railway.app',
      },
      // Local développement
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
      },
    ],
  },
}

export default nextConfig
