import { readItems } from '@directus/sdk'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getServerDirectus, getImageUrl, parseCategorie } from '@/lib/directus'
import type { Realisation } from '@/lib/directus'
import { Music } from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { RealisationCard } from '@/components/galerie/RealisationCard'
import { RealisationsFilterBar } from '@/components/galerie/RealisationsFilterBar'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Nos Réalisations Événementielles',
  description: 'Découvrez les événements réalisés par V-Sonus : concerts, festivals, sonorisations et éclairages en Suisse Romande.',
  openGraph: {
    title: 'Nos Réalisations Événementielles | V-Sonus',
    description: 'Galerie photo de nos événements : concerts, festivals, sonorisations et éclairages en Suisse Romande.',
    url: 'https://vsonus.ch/realisations',
  },
  alternates: { canonical: 'https://vsonus.ch/realisations' },
}

export default async function GaleriePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>
}) {
  const { categorie } = await searchParams
  const client = getServerDirectus()

  // Fetch toutes les réalisations publiées — le filtrage par catégorie se fait
  // ensuite avec parseCategorie() car le champ categorie est stocké en JSON
  // brut par Directus (cf. commit 3633b11)
  const allRealisations: Realisation[] = await client
    .request(
      readItems('realisations', {
        filter: { publie: { _eq: true } },
        sort: ['-date_evenement'],
        limit: 50,
        fields: [
          'id',
          'titre',
          'description',
          'categorie',
          'date_evenement',
          'lieu',
          'image_principale',
          'publie',
          { images: ['directus_files_id', 'sort'] },
        ],
      })
    )
    .catch(() => [] as Realisation[])

  const realisations = categorie
    ? allRealisations.filter((r) =>
        parseCategorie(r.categorie).some((c) => c.toLowerCase() === categorie.toLowerCase())
      )
    : allRealisations

  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-end min-h-[55vh] overflow-hidden border-b-2 border-vsonus-red">
        <Image
          src="/images/packs/compressed_DSC09742.jpg"
          alt="Nos réalisations événementielles V-Sonus"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-14 pt-32 w-full">
          <AnimateOnScroll>
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span className="text-gray-600">/</span>
              <span className="text-vsonus-red">Réalisations</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Portfolio
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-wider sm:tracking-widest text-white leading-tight break-words">
              Nos <span className="text-vsonus-red">réalisations</span>
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl leading-relaxed">
              Concerts, festivals, sonorisations et éclairages professionnels en Suisse Romande.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Filtres + Grille ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-vsonus-dark min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {/* Filtres */}
          <RealisationsFilterBar />

          {/* Grille */}
          {realisations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-gray-800">
              <Music className="w-14 h-14 text-gray-800 mb-6" strokeWidth={1} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                Aucune réalisation trouvée pour cette sélection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisations.map((real, i) => {
                const coverUrl = getImageUrl(real.image_principale, { width: '800', height: '600', fit: 'cover', quality: '85' })
                const imageUrls = (real.images ?? [])
                  .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
                  .map((f) => getImageUrl(
                    typeof f === 'object' ? f.directus_files_id : null,
                    { width: '1200', quality: '85' }
                  ))
                  .filter((u): u is string => u !== null)

                return (
                  <AnimateOnScroll key={real.id} delay={i * 80}>
                    <RealisationCard
                      realisation={real}
                      coverUrl={coverUrl}
                      imageUrls={imageUrls}
                    />
                  </AnimateOnScroll>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-vsonus-black border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Votre prochain événement
            </p>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white mb-6">
              Envie de créer votre événement ?
            </h2>
            <p className="text-gray-400 leading-relaxed mb-10">
              Que ce soit pour un festival, un concert ou une soirée privée, nous mettons notre
              expertise à votre service.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={150}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/catalogue"
                className="inline-flex items-center justify-center gap-2 border-2 border-vsonus-red text-vsonus-red font-bold uppercase tracking-widest px-8 py-4 hover:bg-vsonus-red hover:text-white transition-colors duration-200"
              >
                Parcourir le catalogue
              </Link>
              <Link
                href="/contact?sujet=devis"
                className="inline-flex items-center justify-center gap-2 bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
              >
                Demander un devis
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  )
}
