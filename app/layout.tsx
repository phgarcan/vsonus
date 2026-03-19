import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { TarifsProvider } from '@/components/layout/TarifsProvider'
import { CookieBanner } from '@/components/ui/CookieBanner'
import ChatBot from '@/components/ui/ChatBot'
import { getServerDirectus } from '@/lib/directus'
import type { TarifAnnexe } from '@/lib/directus'
import { readItems } from '@directus/sdk'

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
  const tarifs = await getServerDirectus()
    .request(readItems('tarifs_annexes', { limit: 20 }))
    .catch(() => [] as TarifAnnexe[])

  return (
    <html lang="fr" className={`${montserrat.variable} overflow-x-hidden`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-vsonus-black text-white font-sans antialiased overflow-x-hidden">
        <TarifsProvider tarifs={tarifs as TarifAnnexe[]} />
        <Header />
        <main className="overflow-x-hidden">{children}</main>
        <Footer />
        <CookieBanner />
        <ChatBot />
      </body>
    </html>
  )
}
