import { readItems } from '@directus/sdk'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Music } from 'lucide-react'
import { getServerDirectus, getImageUrl, CAT_LABELS, SOUS_CAT_LABELS, getEquipementUrl } from '@/lib/directus'
import type { Equipement } from '@/lib/directus'
import { AddToCartButton } from '@/components/catalogue/AddToCartButton'
import { CategoryFilterBar } from '@/components/catalogue/CategoryFilterBar'
import { SubCategoryBar } from '@/components/catalogue/SubCategoryBar'
import { JsonLdBreadcrumb } from '@/components/seo/JsonLdBreadcrumb'

export const revalidate = 300

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string; sous_categorie: string }>
}): Promise<Metadata> {
  const { categorie, sous_categorie } = await params
  const catLabel = CAT_LABELS[categorie]
  const sousCatLabel = SOUS_CAT_LABELS[sous_categorie] ?? sous_categorie
  if (!catLabel) return {}
  return {
    title: `${sousCatLabel} – Location ${catLabel} – V-Sonus`,
    description: `Location de ${sousCatLabel.toLowerCase()} (${catLabel.toLowerCase()}) pour vos événements en Suisse Romande. Prix compétitifs, devis gratuit.`,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SousCategoriePage({
  params,
}: {
  params: Promise<{ categorie: string; sous_categorie: string }>
}) {
  const { categorie, sous_categorie } = await params

  if (!CAT_LABELS[categorie]) notFound()

  const client = getServerDirectus()

  const equipFilter: Record<string, unknown> = {
    categorie: { _contains: categorie },
    sous_categorie: { _eq: sous_categorie },
  }

  // Fetch les équipements de cette sous-catégorie + toutes les sous-catégories de la catégorie parente
  const [equipements, allCatEquip] = await Promise.all([
    client.request(
      readItems('equipements', {
        filter: equipFilter,
        limit: 100,
        fields: ['id', 'slug', 'nom', 'prix_journalier', 'stock_total', 'technicien_obligatoire', 'transport_obligatoire', 'image', 'categorie', 'sous_categorie', 'marque', 'description', 'prix_livraison', 'sort'],
        sort: ['sort'],
      })
    ).catch(() => [] as Equipement[]),
    client.request(
      readItems('equipements', {
        filter: { categorie: { _contains: categorie } } as Record<string, unknown>,
        limit: -1,
        fields: ['sous_categorie'],
      })
    ).catch(() => [] as Equipement[]),
  ])

  if ((equipements as Equipement[]).length === 0) notFound()

  const sousCategories = [...new Set(
    (allCatEquip as Equipement[]).map((eq) => eq.sous_categorie).filter((sc): sc is string => !!sc)
  )].sort()

  const catLabel = CAT_LABELS[categorie] ?? categorie
  const sousCatLabel = SOUS_CAT_LABELS[sous_categorie] ?? sous_categorie

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <JsonLdBreadcrumb items={[
        { name: 'Accueil', href: '/' },
        { name: 'Catalogue', href: '/catalogue' },
        { name: catLabel, href: `/catalogue/${categorie}` },
        { name: sousCatLabel, href: `/catalogue/${categorie}/${sous_categorie}` },
      ]} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-600 mb-8 uppercase tracking-widest flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
        <span>/</span>
        <Link href={`/catalogue/${categorie}`} className="hover:text-white transition-colors">{catLabel}</Link>
        <span>/</span>
        <span className="text-gray-400">{sousCatLabel}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider md:tracking-widest text-white mb-2 break-words">
        {sousCatLabel}
      </h1>
      <p className="text-gray-300 mb-8">
        {catLabel} · Matériel professionnel · Suisse Romande
      </p>

      {/* Filtres par catégorie */}
      <CategoryFilterBar activeCategory={categorie} />
      <SubCategoryBar categorie={categorie} activeSousCategorie={sous_categorie} sousCategories={sousCategories} />

      {/* Grille équipements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(equipements as Equipement[]).map((eq) => {
          const imageUrl = getImageUrl(eq.image, { width: '400', fit: 'contain' })
          return (
            <article key={eq.id} className="bg-vsonus-dark border border-gray-800 flex flex-col hover:border-vsonus-red hover:scale-[1.02] hover:shadow-card-hover transition-all duration-300 group">
              <Link href={getEquipementUrl(eq)} className="block">
                <div className="relative w-full h-48 bg-white overflow-hidden">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={eq.nom} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Music className="w-8 h-8 text-gray-700" strokeWidth={1} /></div>
                  )}
                </div>
                <div className="p-4 pb-2">
                  <h3 className="font-bold text-white text-sm leading-tight group-hover:text-vsonus-red transition-colors">{eq.nom}</h3>
                  {eq.marque && <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{eq.marque}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-vsonus-red font-black text-lg">{eq.prix_journalier.toFixed(2)}</span>
                      <span className="text-gray-500 text-xs ml-1">CHF/jour</span>
                    </div>
                    <span className="text-xs text-gray-600">Stock: {eq.stock_total}</span>
                  </div>
                </div>
              </Link>
              <div className="p-4 pt-2">
                <AddToCartButton type="equipement" item={eq} />
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
