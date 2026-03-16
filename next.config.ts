import type { NextConfig } from 'next'

const directusHost = process.env.DIRECTUS_HOST ?? 'directus.example.com'
const isLocalhost = directusHost === 'localhost'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: isLocalhost ? 'http' : 'https',
        hostname: directusHost,
        port: isLocalhost ? '8055' : '',
      },
    ],
  },
}

export default nextConfig
