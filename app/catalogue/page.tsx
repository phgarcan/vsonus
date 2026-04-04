import { Music } from 'lucide-react'
import { readItems } from '@directus/sdk'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getServerDirectus, getImageUrl } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'
import { isPromoActive, getPackCapacite } from '@/lib/directus'
import { Users } from 'lucide-react'
import { AddToCartButton } from '@/components/catalogue/AddToCartButton'
import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters'
import { ScrollToHash } from '@/components/catalogue/ScrollToHash'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Catalogue Location Matériel Événementiel',
  description: 'Louez du matériel événementiel pro en Suisse Romande : enceintes L-Acoustics, lyres, LED, consoles DJ Pioneer, scènes modulaires.',
  openGraph: {
    title: 'Catalogue Location Matériel Événementiel | V-Sonus',
    description: 'Louez du matériel événementiel pro en Suisse Romande : sono, éclairage, scènes, DJ et mapping.',
    url: 'https://vsonus.ch/catalogue',
  },
  alternates: { canonical: 'https://vsonus.ch/catalogue' },
}

// Pas d'ISR : la page doit être rendue dynamiquement pour que les
// searchParams soient toujours pris en compte (filtre catégorie).
export const dynamic = 'force-dynamic'

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
        fields: ['id', 'nom', 'prix_journalier', 'stock_total', 'technicien_obligatoire', 'transport_obligatoire', 'image', 'categorie', 'marque', 'description', 'prix_livraison', 'sort'],
        sort: ['sort'],
      })
    ).catch(() => [] as Equipement[]),
    client.request(
      readItems('packs', {
        ...(categorie ? { filter: { categorie: { _eq: categorie } } } : {}),
        limit: 50,
        fields: ['id', 'nom', 'categorie', 'prix_base', 'prix_livraison', 'prix_fourgon', 'mode_livraison', 'image_principale', 'description', 'sort', 'prix_promo', 'promo_label', 'promo_date_fin', 'capacite'],
        sort: ['sort'],
      })
    ).catch(() => [] as Pack[]),
  ])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
        Catalogue
      </h1>
      <p className="text-gray-300 mb-8">
        Location de matériel événementiel professionnel · Suisse Romande
      </p>

      {/* Scroll auto vers la section si hash présent */}
      <ScrollToHash />

      {/* Filtres par catégorie — Client Component avec useSearchParams() */}
      <Suspense fallback={<div className="h-10 mb-10" />}>
        <CatalogueFilters />
      </Suspense>

      {/* Section Packs */}
      {packs.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
            Packs clé en main
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packs.map((pack, i) => (
              <PackCard key={pack.id} pack={pack} priority={i < 2} />
            ))}
          </div>
        </section>
      )}

      {/* Section Équipements */}
      <section id="materiel-unitaire">
        <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
          Matériel unitaire
        </h2>
        {equipements.length === 0 ? (
          <p className="text-gray-500 py-12 text-center">Aucun matériel trouvé pour cette sélection.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equipements.map((eq, i) => (
              <EquipementCard key={eq.id} equipement={eq} priority={i < 2} />
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

function EquipementCard({ equipement, priority = false }: { equipement: Equipement; priority?: boolean }) {
  const imageUrl = getImageUrl(equipement.image, { width: '400', fit: 'contain' })

  return (
    <article className="bg-vsonus-dark border border-gray-800 flex flex-col hover:border-vsonus-red hover:scale-[1.02] hover:shadow-card-hover transition-all duration-300 group">
      <Link href={`/catalogue/${equipement.id}`} className="block">
        <div className="relative w-full h-48 bg-white overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={equipement.nom}
              fill
              priority={priority}
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Music className="w-8 h-8 text-gray-700" strokeWidth={1} /></div>
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
            <p className="text-xs text-gray-300 mt-2 line-clamp-2">{equipement.description}</p>
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

function PackCard({ pack, priority = false }: { pack: Pack; priority?: boolean }) {
  const imageUrl = getImageUrl(pack.image_principale, { width: '400', fit: 'contain' })

  return (
    <article className="bg-vsonus-dark border-2 border-vsonus-red flex flex-col hover:shadow-glow-red hover:scale-[1.02] transition-all duration-300 group">
      <Link href={`/catalogue/pack/${pack.id}`} className="block">
        <div className="relative w-full h-48 bg-white overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={pack.nom}
              fill
              priority={priority}
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">★</div>
          )}
          <span className="absolute top-2 left-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
            Pack
          </span>
          {isPromoActive(pack) && (
            <span className="absolute top-2 right-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider animate-pulse">
              {pack.promo_label || 'PROMO'}
            </span>
          )}
        </div>

        <div className="p-4 pb-2 flex-1">
          <h3 className="font-bold text-white text-sm leading-tight group-hover:text-vsonus-red transition-colors">{pack.nom}</h3>
          {getPackCapacite(pack) && (
            <p className="text-xs text-gray-300 mt-1 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />{getPackCapacite(pack)}
            </p>
          )}
          {pack.description && (
            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{pack.description}</p>
          )}
          <div className="mt-3">
            {isPromoActive(pack) ? (
              <>
                <span className="text-gray-500 text-sm line-through mr-2">{pack.prix_base.toFixed(2)}</span>
                <span className="text-vsonus-red font-black text-lg">{pack.prix_promo!.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-vsonus-red font-black text-lg">{pack.prix_base.toFixed(2)}</span>
            )}
            <span className="text-gray-500 text-xs ml-1">CHF / événement</span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-2">
        <AddToCartButton type="pack" item={pack} />
      </div>
    </article>
  )
}
