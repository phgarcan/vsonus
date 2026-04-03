import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Supprime le header X-Powered-By: Next.js
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Production Railway
      {
        protocol: 'https',
        hostname: 'directus-production-daaa.up.railway.app',
      },
      // Domaine custom Directus
      {
        protocol: 'https',
        hostname: 'admin.vsonus.ch',
      },
      // Local développement
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/prestations',
        destination: '/packs',
        permanent: true,
      },
      {
        source: '/prestations/:slug',
        destination: '/packs/:slug',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
