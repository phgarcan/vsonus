import { Music } from 'lucide-react'
import { readItem, readItems } from '@directus/sdk'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getServerDirectus, getImageUrl } from '@/lib/directus'
import type { Equipement } from '@/lib/directus'
import { AddToCartSection } from './AddToCartSection'

export const revalidate = 300

// ---------------------------------------------------------------------------
// Métadonnées SEO dynamiques
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const eq = await getServerDirectus().request(
      readItem('equipements', id, { fields: ['nom', 'description', 'marque'] })
    ) as Equipement
    return {
      title: `${eq.nom} – V-Sonus`,
      description: eq.description?.slice(0, 160) ?? `Location ${eq.nom} en Suisse Romande.`,
    }
  } catch {
    return { title: 'Produit – V-Sonus' }
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProduitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = getServerDirectus()

  let equipement: Equipement
  try {
    equipement = await client.request(
      readItem('equipements', id, {
        fields: ['id', 'nom', 'marque', 'categorie', 'description', 'prix_journalier', 'stock_total', 'technicien_obligatoire', 'transport_obligatoire', 'image', 'prix_livraison'],
      })
    ) as Equipement
  } catch {
    notFound()
  }

  // Suggestions : autres produits de la même catégorie
  const suggestions = await client.request(
    readItems('equipements', {
      ...(equipement.categorie ? { filter: { categorie: { _eq: equipement.categorie } } } : {}),
      limit: 4,
      fields: ['id', 'nom', 'prix_journalier', 'image', 'marque', 'sort'],
      sort: ['sort'],
    })
  ).catch(() => [] as Equipement[])

  const filteredSuggestions = (suggestions as Equipement[]).filter((s) => s.id !== equipement.id).slice(0, 3)

  const imageUrl = getImageUrl(equipement.image, { width: '900', fit: 'contain' })
  const catLabel: Record<string, string> = {
    sonorisation: 'Sonorisation',
    eclairage: 'Éclairage',
    scenes: 'Scènes & Structures',
    mapping: 'Mapping & Vidéo',
    accessoires: 'Accessoires',
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-600 mb-8 uppercase tracking-widest">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
        {equipement.categorie && (
          <>
            <span>/</span>
            <Link href={`/catalogue?categorie=${equipement.categorie}`} className="hover:text-white transition-colors">
              {catLabel[equipement.categorie] ?? equipement.categorie}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-400">{equipement.nom}</span>
      </nav>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* Colonne image */}
        <div className="space-y-4">
          <div className="relative w-full aspect-[3/2] bg-white border border-gray-800 overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={equipement.nom}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Music className="w-12 h-12 text-gray-700" strokeWidth={1} /></div>
            )}
          </div>
        </div>

        {/* Colonne infos */}
        <div className="space-y-6">

          {/* En-tête */}
          <div>
            {equipement.marque && (
              <p className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-1">
                {equipement.marque}
              </p>
            )}
            <h1 className="text-3xl font-black uppercase tracking-wide text-white leading-tight">
              {equipement.nom}
            </h1>
          </div>

          {/* Prix */}
          <div className="border-t border-b border-gray-800 py-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-vsonus-red">{equipement.prix_journalier.toFixed(2)}</span>
            <span className="text-gray-500 text-sm uppercase tracking-widest">CHF / jour</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {equipement.categorie && (
              <span className="bg-vsonus-dark border border-gray-700 text-gray-300 text-xs font-bold uppercase tracking-widest px-3 py-1">
                {catLabel[equipement.categorie] ?? equipement.categorie}
              </span>
            )}
            {equipement.technicien_obligatoire && (
              <span className="bg-vsonus-red text-white text-xs font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1">
                ⚠ Technicien obligatoire
              </span>
            )}
            {equipement.transport_obligatoire && (
              <span className="bg-vsonus-dark border border-vsonus-red text-vsonus-red text-xs font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1">
                🚛 Transport inclus
              </span>
            )}
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 ${equipement.stock_total > 0 ? 'bg-green-900/40 border border-green-800 text-green-400' : 'bg-red-900/40 border border-red-800 text-red-400'}`}>
              {equipement.stock_total > 0 ? `${equipement.stock_total} disponible${equipement.stock_total > 1 ? 's' : ''}` : 'Indisponible'}
            </span>
          </div>

          {/* Avertissement règles métier */}
          {equipement.technicien_obligatoire && (
            <div className="border-l-4 border-vsonus-red bg-vsonus-dark px-4 py-3 text-sm text-gray-400">
              Ce matériel nécessite une livraison et une installation par un technicien V-Sonus certifié.
              Le retrait sur place n'est pas disponible. Des frais de transport et montage seront ajoutés au devis.
            </div>
          )}

          {/* Description */}
          {equipement.description && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-vsonus-red">Caractéristiques</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {equipement.description}
              </p>
            </div>
          )}

          {/* Ajout à la liste */}
          <div className="border-t border-gray-800 pt-6">
            <AddToCartSection equipement={equipement} />
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {filteredSuggestions.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
            Dans la même catégorie
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {filteredSuggestions.map((s) => {
              const sImg = getImageUrl(s.image, { width: '300', fit: 'contain' })
              return (
                <Link
                  key={s.id}
                  href={`/catalogue/${s.id}`}
                  className="bg-vsonus-dark border border-gray-800 hover:border-vsonus-red transition-colors duration-200 flex flex-col"
                >
                  <div className="relative h-36 bg-white overflow-hidden">
                    {sImg ? (
                      <Image src={sImg} alt={s.nom} fill className="object-contain p-3"
                        sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Music className="w-6 h-6 text-gray-700" strokeWidth={1} /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{s.marque}</p>
                    <p className="text-sm font-bold text-white mt-0.5 line-clamp-2">{s.nom}</p>
                    <p className="text-vsonus-red font-black text-sm mt-2">{s.prix_journalier.toFixed(2)} CHF/j</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
