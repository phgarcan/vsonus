import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CAT_LABELS, SOUS_CAT_LABELS } from '@/lib/directus'
import { CatalogueGrid } from '@/components/catalogue/CatalogueGrid'
import { JsonLdBreadcrumb } from '@/components/seo/JsonLdBreadcrumb'
import { getCatalogueData } from '@/app/actions/catalogue'

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

  const { equipements, packs, sousCategories } = await getCatalogueData({
    categorie,
    sousCategorie: sous_categorie,
  })

  if (equipements.length === 0) notFound()

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
      <CatalogueGrid
        initialEquipements={equipements}
        initialPacks={packs}
        initialSousCategories={sousCategories}
        initialCategorie={categorie}
        initialSousCategorie={sous_categorie}
      />
    </div>
  )
}
