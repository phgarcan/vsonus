import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { TarifsProvider } from '@/components/layout/TarifsProvider'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { ConsentScripts } from '@/components/layout/ConsentScripts'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { AccountDeletedBanner } from '@/components/layout/AccountDeletedBanner'
import ChatBot from '@/components/ui/ChatBot'
import { getServerDirectus } from '@/lib/directus'
import type { TarifAnnexe, SiteSettings } from '@/lib/directus'
import { readItems, readSingleton } from '@directus/sdk'
import { PromoBanner } from '@/components/layout/PromoBanner'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const SITE_URL = 'https://vsonus.ch'
const OG_IMAGE = `${SITE_URL}/logo-vsonus.png`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'V-Sonus – Location Matériel Événementiel Suisse Romande',
    template: '%s | V-Sonus',
  },
  description:
    'Location de sonorisation L-Acoustics, éclairage, scènes et mapping pour vos événements en Suisse Romande. Basé à Vevey (VD).',
  keywords: ['location sono', 'location éclairage', 'événementiel suisse', 'sonorisation vaud', 'V-Sonus', 'Vevey'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'fr_CH',
    url: SITE_URL,
    siteName: 'V-Sonus',
    title: 'V-Sonus – Location Matériel Événementiel Suisse Romande',
    description: 'Location de sonorisation, éclairage, scènes et mapping pour vos événements en Suisse Romande.',
    images: [{ url: OG_IMAGE, width: 512, height: 512, alt: 'V-Sonus Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'V-Sonus – Location Matériel Événementiel Suisse Romande',
    description: 'Location de sonorisation, éclairage, scènes et mapping pour vos événements en Suisse Romande.',
    images: [OG_IMAGE],
  },
  alternates: { canonical: SITE_URL },
  icons: { icon: '/favicon.ico' },
  other: {
    'geo.region': 'CH-VD',
    'geo.placename': 'Vevey',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'V-Sonus',
  description: 'Location de matériel événementiel professionnel en Suisse Romande',
  url: SITE_URL,
  telephone: '+41796512114',
  email: 'info@vsonus.ch',
  image: OG_IMAGE,
  priceRange: 'CHF 120 - CHF 4050',
  areaServed: 'Suisse Romande',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rue des Bosquets 17',
    addressLocality: 'Vevey',
    postalCode: '1800',
    addressCountry: 'CH',
    addressRegion: 'VD',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const client = getServerDirectus()

  const [tarifs, siteSettings] = await Promise.all([
    client.request(readItems('tarifs_annexes', { limit: 20 })).catch(() => [] as TarifAnnexe[]),
    client.request(readSingleton('site_settings', {
      fields: ['promo_active', 'promo_texte', 'promo_lien', 'promo_cta', 'menu_image_sonorisation', 'menu_image_eclairage', 'menu_image_mapping', 'menu_image_scenes', 'menu_image_nettoyage'],
    })).catch(() => null as SiteSettings | null),
  ])

  return (
    <html lang="fr" className={montserrat.variable}>
      <head>
        <link rel="dns-prefetch" href="https://directus-production-daaa.up.railway.app" />
        <link rel="preconnect" href="https://directus-production-daaa.up.railway.app" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-vsonus-black text-white font-sans antialiased" suppressHydrationWarning>
        <ScrollToTop />
        <TarifsProvider tarifs={tarifs as TarifAnnexe[]} />
        <Suspense><AccountDeletedBanner /></Suspense>
        <Header menuImages={{
          sonorisation: siteSettings?.menu_image_sonorisation ?? null,
          eclairage: siteSettings?.menu_image_eclairage ?? null,
          mapping: siteSettings?.menu_image_mapping ?? null,
          scenes: siteSettings?.menu_image_scenes ?? null,
          nettoyage: siteSettings?.menu_image_nettoyage ?? null,
        }} />
        <PromoBanner
          active={siteSettings?.promo_active ?? false}
          texte={siteSettings?.promo_texte ?? null}
          lien={siteSettings?.promo_lien ?? null}
          cta={siteSettings?.promo_cta ?? null}
        />
        <main className="overflow-x-hidden">{children}</main>
        <Footer />
        <CookieBanner />
        <ConsentScripts />
        <ChatBot />
      </body>
    </html>
  )
}
