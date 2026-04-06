import { Music } from 'lucide-react'
import { readItems } from '@directus/sdk'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getServerDirectus, getImageUrl, getEquipementUrl, getPackUrl } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'
import { isPromoActive, getPackCapacite, getPackPrixEffectif } from '@/lib/directus'
import { Users } from 'lucide-react'
import { AddToCartButton } from '@/components/catalogue/AddToCartButton'
import { CategoryFilterBar } from '@/components/catalogue/CategoryFilterBar'
import { JsonLdBreadcrumb } from '@/components/seo/JsonLdBreadcrumb'

export const revalidate = 300

/** Extrait la ligne "type d'événement" d'une description pack, sans le détail matériel */
function truncatePackDescription(desc: string): string {
  let text = desc.replace(/^Adapté pour\s*:\s*/i, '')
  const sepIndex = Math.min(
    ...['\n', '•', '·'].map((s) => { const i = text.indexOf(s); return i === -1 ? Infinity : i })
  )
  if (sepIndex !== Infinity) text = text.slice(0, sepIndex).trim()
  if (text.length > 80) text = text.slice(0, 80).trim() + '…'
  return text
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams
  if (q) {
    return {
      title: `Recherche : ${q} – V-Sonus`,
      robots: { index: false },
    }
  }
  return {
    title: 'Catalogue Location Matériel Événementiel',
    description: 'Louez du matériel événementiel pro en Suisse Romande : enceintes L-Acoustics, lyres, LED, consoles DJ Pioneer, scènes modulaires.',
    openGraph: {
      title: 'Catalogue Location Matériel Événementiel | V-Sonus',
      description: 'Louez du matériel événementiel pro en Suisse Romande : sono, éclairage, scènes, DJ et mapping.',
      url: 'https://vsonus.ch/catalogue',
    },
    alternates: { canonical: 'https://vsonus.ch/catalogue' },
  }
}

interface SearchParams {
  q?: string
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { q } = params

  const client = getServerDirectus()

  // Filtre recherche multi-mots (chaque mot doit matcher nom OU marque OU description)
  const searchFilter = q ? {
    _and: (q.split(/[\s\-_]+/).filter((w: string) => w.length >= 2).length > 0
      ? q.split(/[\s\-_]+/).filter((w: string) => w.length >= 2)
      : [q.replace(/[\s\-_]+/g, '')]
    ).map((word: string) => ({
      _or: [
        { nom: { _icontains: word } },
        { marque: { _icontains: word } },
        { description: { _icontains: word } },
      ],
    })),
  } : null

  const [equipements, packs] = await Promise.all([
    client.request(
      readItems('equipements', {
        ...(searchFilter ? { filter: searchFilter as Record<string, unknown> } : {}),
        limit: 100,
        fields: ['id', 'slug', 'nom', 'prix_journalier', 'stock_total', 'technicien_obligatoire', 'transport_obligatoire', 'image', 'categorie', 'sous_categorie', 'marque', 'description', 'prix_livraison', 'sort'],
        sort: ['sort'],
      })
    ).catch((err) => { console.error('[catalogue] Erreur equipements:', err?.errors ?? err?.message); return [] as Equipement[] }),
    client.request(
      readItems('packs', {
        ...(searchFilter ? { filter: searchFilter as Record<string, unknown> } : {}),
        limit: 50,
        fields: ['id', 'slug', 'nom', 'categorie', 'sous_categorie', 'prix_base', 'prix_livraison', 'prix_fourgon', 'mode_livraison', 'image_principale', 'description', 'sort', 'promo_pourcentage', 'promo_label', 'promo_date_fin', 'capacite', 'marque'],
        sort: ['sort'],
      })
    ).catch((err) => { console.error('[catalogue] Erreur packs:', err?.errors ?? err?.message); return [] as Pack[] }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <JsonLdBreadcrumb items={[
        { name: 'Accueil', href: '/' },
        { name: 'Catalogue', href: '/catalogue' },
      ]} />

      {q ? (
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-2">
            Résultats pour &laquo; {q} &raquo;
          </h1>
          <p className="text-gray-400">
            {equipements.length + packs.length} résultat{equipements.length + packs.length > 1 ? 's' : ''} trouvé{equipements.length + packs.length > 1 ? 's' : ''}
          </p>
          <Link href="/catalogue" className="text-vsonus-red text-sm hover:underline mt-2 inline-block">
            ← Retour au catalogue complet
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
            Catalogue
          </h1>
          <p className="text-gray-300 mb-8">
            Location de matériel événementiel professionnel · Suisse Romande
          </p>
          <CategoryFilterBar />
        </>
      )}

      {/* Aucun résultat en mode recherche */}
      {q && equipements.length === 0 && packs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">Aucun résultat pour &laquo; {q} &raquo;</p>
          <p className="text-gray-600 text-sm mb-6">Essayez avec d&apos;autres termes ou parcourez notre catalogue.</p>
          <Link href="/catalogue" className="inline-block bg-vsonus-red text-white px-6 py-3 font-bold uppercase text-sm">
            Voir tout le catalogue
          </Link>
        </div>
      )}

      {/* Mode recherche : équipements d'abord, packs ensuite */}
      {q ? (
        <>
          {equipements.length > 0 && (
            <section className="mb-14">
              <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
                Matériel unitaire
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {equipements.map((eq, i) => (
                  <EquipementCard key={eq.id} equipement={eq} priority={i < 2} />
                ))}
              </div>
            </section>
          )}
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
        </>
      ) : (
        <>
          {/* Mode catalogue normal : packs d'abord */}
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
        </>
      )}
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
      <Link href={getEquipementUrl(equipement)} className="block">
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
      <Link href={getPackUrl(pack)} className="block">
        <div className="relative w-full aspect-[4/3] bg-white overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={pack.nom}
              fill
              priority={priority}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
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
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-sm leading-tight group-hover:text-vsonus-red transition-colors">{pack.nom}</h3>
            {pack.marque && (
              <span className="text-[10px] text-gray-400 border border-gray-600 px-1.5 py-0.5 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                {pack.marque}
              </span>
            )}
          </div>
          {getPackCapacite(pack) && (
            <p className="text-xs text-gray-300 mt-1 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />{getPackCapacite(pack)}
            </p>
          )}
          {pack.description && (
            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{truncatePackDescription(pack.description)}</p>
          )}
          <div className="mt-3">
            {isPromoActive(pack) ? (
              <>
                <span className="text-gray-500 text-sm line-through mr-2">{pack.prix_base.toFixed(2)}</span>
                <span className="text-vsonus-red font-black text-lg">{getPackPrixEffectif(pack).toFixed(2)}</span>
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
