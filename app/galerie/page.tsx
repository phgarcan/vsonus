import { readItems } from '@directus/sdk'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getServerDirectus, getImageUrl } from '@/lib/directus'
import type { Realisation } from '@/lib/directus'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { RealisationCard } from '@/components/galerie/RealisationCard'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Nos Réalisations Événementielles',
  description: 'Découvrez les événements réalisés par V-Sonus : concerts, festivals, sonorisations et éclairages en Suisse Romande.',
  openGraph: {
    title: 'Nos Réalisations Événementielles | V-Sonus',
    description: 'Galerie photo de nos événements : concerts, festivals, sonorisations et éclairages en Suisse Romande.',
    url: 'https://vsonus.ch/galerie',
  },
  alternates: { canonical: 'https://vsonus.ch/galerie' },
}

const CATEGORIES = [
  { label: 'Tous', slug: undefined },
  { label: 'Sonorisation', slug: 'sonorisation' },
  { label: 'Éclairage', slug: 'eclairage' },
  { label: 'Scène', slug: 'scene' },
  { label: 'DJ', slug: 'dj' },
  { label: 'Concert', slug: 'concert' },
  { label: 'Mapping', slug: 'mapping' },
  { label: 'Festival', slug: 'festival' },
]

export default async function GaleriePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>
}) {
  const { categorie } = await searchParams
  const client = getServerDirectus()

  const realisations: Realisation[] = await client
    .request(
      readItems('realisations', {
        filter: {
          publie: { _eq: true },
          ...(categorie ? { categorie: { _eq: categorie } } : {}),
        },
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 pt-32 w-full">
          <AnimateOnScroll>
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span className="text-gray-600">/</span>
              <span className="text-vsonus-red">Réalisations</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Portfolio
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-widest text-white leading-tight">
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
          <div className="flex flex-wrap gap-2 mb-12">
            {CATEGORIES.map((cat) => {
              const isActive = cat.slug === categorie || (!cat.slug && !categorie)
              return (
                <a
                  key={cat.label}
                  href={cat.slug ? `/galerie?categorie=${cat.slug}` : '/galerie'}
                  className={[
                    'px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all duration-150',
                    isActive
                      ? 'bg-vsonus-red border-vsonus-red text-white'
                      : 'bg-transparent border-gray-700 text-gray-400 hover:border-vsonus-red hover:text-white',
                  ].join(' ')}
                >
                  {cat.label}
                </a>
              )
            })}
          </div>

          {/* Grille */}
          {realisations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-gray-800">
              <div className="text-6xl text-gray-800 mb-6">♪</div>
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
