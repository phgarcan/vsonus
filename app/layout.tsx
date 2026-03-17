import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { TarifsProvider } from '@/components/layout/TarifsProvider'
import { getServerDirectus } from '@/lib/directus'
import type { TarifAnnexe } from '@/lib/directus'
import { readItems } from '@directus/sdk'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'V-Sonus – Location Matériel Événementiel Suisse',
  description:
    'Location de sonorisation, éclairage, scènes et mapping pour vos événements en Suisse Romande.',
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
    <html lang="fr" className={montserrat.variable}>
      <body className="bg-vsonus-black text-white font-sans antialiased">
        <TarifsProvider tarifs={tarifs as TarifAnnexe[]} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
