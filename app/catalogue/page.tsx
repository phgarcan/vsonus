import { readItems } from '@directus/sdk'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getServerDirectus, getImageUrl } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'
import { AddToCartButton } from '@/components/catalogue/AddToCartButton'

export const metadata: Metadata = {
  title: 'Catalogue – V-Sonus',
  description: 'Parcourez notre catalogue de matériel événementiel : sonorisation, éclairage, scènes et mapping en Suisse Romande.',
}

// Revalidation ISR toutes les 5 minutes
export const revalidate = 300

interface SearchParams {
  categorie?: string
  q?: string
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { categorie, q } = params

  const client = getServerDirectus()

  // Fetch équipements depuis Directus (Server Component = SSR/ISR)
  const [equipements, packs] = await Promise.all([
    client.request(
      readItems('equipements', {
        ...(categorie ? { filter: { categorie: { _eq: categorie } } } : {}),
        ...(q ? { search: q } : {}),
        limit: 100,
        fields: ['id', 'nom', 'prix_journalier', 'stock_total', 'technicien_obligatoire', 'transport_obligatoire', 'image', 'categorie', 'marque', 'description'],
      })
    ).catch(() => [] as Equipement[]),
    client.request(
      readItems('packs', {
        ...(categorie ? { filter: { categorie: { _eq: categorie } } } : {}),
        limit: 50,
        fields: ['id', 'nom', 'categorie', 'prix_base', 'image_principale', 'description'],
      })
    ).catch(() => [] as Pack[]),
  ])

  const categories = [
    { label: 'Tous', slug: undefined },
    { label: 'Sonorisation', slug: 'sonorisation' },
    { label: 'Éclairage', slug: 'eclairage' },
    { label: 'Scènes', slug: 'scenes' },
    { label: 'Mapping', slug: 'mapping' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
        Catalogue
      </h1>
      <p className="text-gray-400 mb-8">
        Location de matériel événementiel professionnel · Suisse Romande
      </p>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => {
          const isActive = cat.slug === categorie || (!cat.slug && !categorie)
          return (
            <a
              key={cat.label}
              href={cat.slug ? `/catalogue?categorie=${cat.slug}` : '/catalogue'}
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

      {/* Section Packs */}
      {packs.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
            Packs tout-en-un
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </section>
      )}

      {/* Section Équipements */}
      <section>
        <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
          Matériel unitaire
        </h2>
        {equipements.length === 0 ? (
          <p className="text-gray-500 py-12 text-center">Aucun matériel trouvé pour cette sélection.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equipements.map((eq) => (
              <EquipementCard key={eq.id} equipement={eq} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sous-composants de carte (Server Components)
// ---------------------------------------------------------------------------

function EquipementCard({ equipement }: { equipement: Equipement }) {
  const imageUrl = getImageUrl(equipement.image, { width: '400', height: '300', fit: 'cover' })

  return (
    <article className="bg-vsonus-dark border border-gray-800 flex flex-col hover:border-vsonus-red transition-colors duration-200 group">
      <Link href={`/catalogue/${equipement.id}`} className="block">
        <div className="relative w-full h-48 bg-black overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={equipement.nom}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">♪</div>
          )}
          {(equipement.technicien_obligatoire || equipement.transport_obligatoire) && (
            <span className="absolute top-2 right-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
              Tech requis
            </span>
          )}
        </div>

        <div className="p-4 pb-2">
          <h3 className="font-bold text-white text-sm leading-tight group-hover:text-vsonus-red transition-colors">{equipement.nom}</h3>
          {equipement.marque && (
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{equipement.marque}</p>
          )}
          {equipement.description && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{equipement.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-vsonus-red font-black text-lg">{equipement.prix_journalier.toFixed(2)}</span>
              <span className="text-gray-500 text-xs ml-1">CHF/jour</span>
            </div>
            <span className="text-xs text-gray-600">Stock: {equipement.stock_total}</span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-2">
        <AddToCartButton type="equipement" item={equipement} />
      </div>
    </article>
  )
}

function PackCard({ pack }: { pack: Pack }) {
  const imageUrl = getImageUrl(pack.image_principale, { width: '400', height: '300', fit: 'cover' })

  return (
    <article className="bg-vsonus-dark border-2 border-vsonus-red flex flex-col hover:shadow-glow-red transition-shadow duration-200">
      <div className="relative w-full h-48 bg-black overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={pack.nom}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">★</div>
        )}
        <span className="absolute top-2 left-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
          Pack
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm leading-tight">{pack.nom}</h3>
          {pack.description && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{pack.description}</p>
          )}
        </div>

        <div>
          <span className="text-vsonus-red font-black text-lg">{pack.prix_base.toFixed(2)}</span>
          <span className="text-gray-500 text-xs ml-1">CHF / événement</span>
        </div>

        <AddToCartButton type="pack" item={pack} />
      </div>
    </article>
  )
}
