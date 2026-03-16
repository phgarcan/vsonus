import { readItems } from '@directus/sdk'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getServerDirectus, getImageUrl } from '@/lib/directus'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Galerie – V-Sonus',
  description: 'Découvrez nos réalisations : événements sonorisation, éclairage, scène et mapping en Suisse Romande.',
}

// ---------------------------------------------------------------------------
// Types locaux (collection galerie_photos dans Directus)
// ---------------------------------------------------------------------------

interface GaleriePhoto {
  id: string
  titre?: string
  description?: string
  image: string
  categorie?: string
  date_evenement?: string
  sort?: number
}

const CAT_LABELS: Record<string, string> = {
  sonorisation: 'Sonorisation',
  eclairage: 'Éclairage',
  scene: 'Scène & Structure',
  mapping: 'Mapping & Vidéo',
  complet: 'Événement complet',
}

// ---------------------------------------------------------------------------
// Page Galerie (Server Component)
// ---------------------------------------------------------------------------

export default async function GaleriePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>
}) {
  const { categorie } = await searchParams
  const client = getServerDirectus()

  // Récupération des photos depuis Directus
  // Si la collection n'existe pas encore, on renvoie un tableau vide
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos: GaleriePhoto[] = await (client as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .request((readItems as any)('galerie_photos', {
      ...(categorie ? { filter: { categorie: { _eq: categorie } } } : {}),
      sort: ['sort', '-date_evenement'],
      limit: 100,
      fields: ['id', 'titre', 'description', 'image', 'categorie', 'date_evenement', 'sort'],
    }))
    .catch(() => [] as GaleriePhoto[])

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">

      {/* En-tête */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-2">Portfolio</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white leading-tight">
          Nos <span className="text-vsonus-red">réalisations</span>
        </h1>
        <div className="mt-4 h-0.5 w-20 bg-vsonus-red" />
      </div>

      {/* Filtres catégories */}
      <div className="flex flex-wrap gap-2 mb-10">
        <FilterChip label="Tout" href="/galerie" active={!categorie} />
        {Object.entries(CAT_LABELS).map(([slug, label]) => (
          <FilterChip
            key={slug}
            label={label}
            href={`/galerie?categorie=${slug}`}
            active={categorie === slug}
          />
        ))}
      </div>

      {/* Grille masonry */}
      {photos.length === 0 ? (
        <EmptyState />
      ) : (
        <MasonryGrid photos={photos as GaleriePhoto[]} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Composants internes
// ---------------------------------------------------------------------------

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border transition-colors duration-200 ${
        active
          ? 'bg-vsonus-red border-vsonus-red text-white'
          : 'border-gray-700 text-gray-400 hover:border-vsonus-red hover:text-white'
      }`}
    >
      {label}
    </a>
  )
}

function MasonryGrid({ photos }: { photos: GaleriePhoto[] }) {
  // Distribution en 3 colonnes pour effet masonry via CSS columns
  return (
    <div
      className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
      style={{ columnGap: '1rem' }}
    >
      {photos.map((photo) => {
        const imgUrl = getImageUrl(photo.image, { width: '800', fit: 'cover', quality: '85' })
        if (!imgUrl) return null

        return (
          <div
            key={photo.id}
            className="break-inside-avoid group relative overflow-hidden border border-gray-800 hover:border-vsonus-red transition-colors duration-300 cursor-pointer mb-4"
          >
            <div className="relative w-full">
              <Image
                src={imgUrl}
                alt={photo.titre ?? 'Réalisation V-Sonus'}
                width={800}
                height={600}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>

            {/* Overlay au survol */}
            {(photo.titre || photo.categorie) && (
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                {photo.categorie && (
                  <span className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-1">
                    {CAT_LABELS[photo.categorie] ?? photo.categorie}
                  </span>
                )}
                {photo.titre && (
                  <p className="text-white font-bold text-sm leading-tight">{photo.titre}</p>
                )}
                {photo.description && (
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{photo.description}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center border border-gray-800">
      <div className="text-6xl text-gray-800 mb-6">♪</div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
        La galerie sera bientôt disponible.
      </p>
      <p className="text-gray-700 text-xs mt-2">
        Revenez prochainement pour découvrir nos réalisations.
      </p>
    </div>
  )
}
