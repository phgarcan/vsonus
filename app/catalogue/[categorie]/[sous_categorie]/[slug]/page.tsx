import { Music } from 'lucide-react'
import { readItems } from '@directus/sdk'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getServerDirectus, getImageUrl, CAT_LABELS, SOUS_CAT_LABELS, getEquipementUrl, parseCategorie } from '@/lib/directus'
import { JsonLdBreadcrumb } from '@/components/seo/JsonLdBreadcrumb'
import type { Equipement } from '@/lib/directus'
import { AddToCartSection } from './AddToCartSection'
import { ProductGallery } from './ProductGallery'

export const revalidate = 300

// ---------------------------------------------------------------------------
// Métadonnées SEO dynamiques
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string; sous_categorie: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const results = await getServerDirectus().request(
      readItems('equipements', {
        filter: { slug: { _eq: slug } },
        limit: 1,
        fields: ['nom', 'description', 'marque', 'categorie'],
      })
    )
    const eq = results?.[0] as Equipement | undefined
    if (!eq) return { title: 'Produit – V-Sonus' }
    const catLabel = CAT_LABELS[parseCategorie(eq.categorie)[0] ?? ''] ?? ''
    return {
      title: `${eq.nom} – Location ${catLabel} – V-Sonus`,
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
  params: Promise<{ categorie: string; sous_categorie: string; slug: string }>
}) {
  const { categorie, sous_categorie, slug } = await params
  const client = getServerDirectus()

  const results = await client.request(
    readItems('equipements', {
      filter: { slug: { _eq: slug } },
      limit: 1,
      fields: ['id', 'slug', 'nom', 'marque', 'categorie', 'sous_categorie', 'description', 'prix_journalier', 'stock_total', 'technicien_obligatoire', 'transport_obligatoire', 'image', 'prix_livraison', 'images.id', 'images.directus_files_id'],
    })
  ).catch(() => [] as Equipement[])
  const equipement = (results as Equipement[])?.[0]
  if (!equipement) notFound()

  // Vérifier la cohérence de l'URL — rediriger vers l'URL canonique si nécessaire
  const cats = parseCategorie(equipement.categorie)
  const primaryCat = cats[0]
  if (primaryCat !== categorie || equipement.sous_categorie !== sous_categorie) {
    redirect(getEquipementUrl(equipement))
  }

  // Suggestions : autres produits de la même catégorie
  const suggestFilter: Record<string, unknown> = {}
  if (primaryCat) suggestFilter.categorie = { _contains: primaryCat }
  const suggestions = await client.request(
    readItems('equipements', {
      ...(Object.keys(suggestFilter).length ? { filter: suggestFilter } : {}),
      limit: 4,
      fields: ['id', 'slug', 'nom', 'prix_journalier', 'image', 'marque', 'categorie', 'sous_categorie', 'sort'],
      sort: ['sort'],
    })
  ).catch(() => [] as Equipement[])

  const filteredSuggestions = (suggestions as Equipement[]).filter((s) => s.id !== equipement.id).slice(0, 3)

  const imageUrl = getImageUrl(equipement.image, { width: '900', fit: 'contain' })
  const extraImages = (equipement.images ?? []).map((img) => ({
    full: getImageUrl(img.directus_files_id, { width: '900', fit: 'contain' })!,
    thumb: getImageUrl(img.directus_files_id, { width: '80', height: '80', fit: 'cover' })!,
  })).filter((img) => img.full && img.thumb)
  const catLabel = CAT_LABELS[primaryCat ?? ''] ?? primaryCat ?? ''
  const sousCatLabel = SOUS_CAT_LABELS[equipement.sous_categorie ?? ''] ?? equipement.sous_categorie ?? ''

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <JsonLdBreadcrumb items={[
        { name: 'Accueil', href: '/' },
        { name: 'Catalogue', href: '/catalogue' },
        { name: catLabel, href: `/catalogue/${categorie}` },
        { name: sousCatLabel, href: `/catalogue/${categorie}/${sous_categorie}` },
        { name: equipement.nom, href: `/catalogue/${categorie}/${sous_categorie}/${slug}` },
      ]} />

      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-600 mb-8 uppercase tracking-widest flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
        {primaryCat && (
          <>
            <span>/</span>
            <Link href={`/catalogue/${primaryCat}`} className="hover:text-white transition-colors">
              {catLabel}
            </Link>
          </>
        )}
        {equipement.sous_categorie && (
          <>
            <span>/</span>
            <Link href={`/catalogue/${primaryCat}/${equipement.sous_categorie}`} className="hover:text-white transition-colors">
              {sousCatLabel}
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
          <ProductGallery
            mainImageUrl={imageUrl}
            extraImages={extraImages}
            alt={equipement.nom}
          />
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
            {cats.map((cat) => (
              <span key={cat} className="bg-vsonus-dark border border-gray-700 text-gray-300 text-xs font-bold uppercase tracking-widest px-3 py-1">
                {CAT_LABELS[cat] ?? cat}
              </span>
            ))}
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
            <div className="border-l-4 border-vsonus-red bg-vsonus-dark px-4 py-3 text-sm text-gray-300">
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
                  href={getEquipementUrl(s)}
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
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{s.marque}</p>
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
