import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const isDev = siteUrl.includes('dev.') || !siteUrl.includes('vsonus.ch')

  return {
    rules: {
      userAgent: '*',
      ...(isDev ? { disallow: '/' } : { allow: '/' }),
    },
    ...(isDev ? {} : { sitemap: 'https://vsonus.ch/sitemap.xml' }),
  }
}
