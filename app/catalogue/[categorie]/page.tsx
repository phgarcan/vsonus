import { readItems } from '@directus/sdk'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getServerDirectus, CAT_LABELS, getEquipementUrl } from '@/lib/directus'
import type { Equipement } from '@/lib/directus'
import { CatalogueGrid } from '@/components/catalogue/CatalogueGrid'
import { JsonLdBreadcrumb } from '@/components/seo/JsonLdBreadcrumb'
import { getCatalogueData } from '@/app/actions/catalogue'

export const revalidate = 300

const VALID_CATEGORIES = Object.keys(CAT_LABELS)

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>
}): Promise<Metadata> {
  const { categorie } = await params
  const label = CAT_LABELS[categorie]
  if (!label) return {}
  return {
    title: `Location ${label} – V-Sonus Vevey`,
    description: `Location de matériel ${label.toLowerCase()} professionnel pour événements en Suisse Romande. Catalogue complet, devis en ligne.`,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CategoriePage({
  params,
}: {
  params: Promise<{ categorie: string }>
}) {
  const { categorie } = await params

  // Cas 1 : catégorie valide → listing via CatalogueGrid
  if (VALID_CATEGORIES.includes(categorie)) {
    const { equipements, packs, sousCategories } = await getCatalogueData({ categorie })
    const catLabel = CAT_LABELS[categorie] ?? categorie

    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <JsonLdBreadcrumb items={[
          { name: 'Accueil', href: '/' },
          { name: 'Catalogue', href: '/catalogue' },
          { name: catLabel, href: `/catalogue/${categorie}` },
        ]} />
        <CatalogueGrid
          initialEquipements={equipements}
          initialPacks={packs}
          initialSousCategories={sousCategories}
          initialCategorie={categorie}
        />
      </div>
    )
  }

  // Cas 2 : pas une catégorie → tenter redirection ancien slug produit
  const client = getServerDirectus()
  const eqResults = await client
    .request(
      readItems('equipements', {
        filter: { slug: { _eq: categorie } },
        limit: 1,
        fields: ['slug', 'categorie', 'sous_categorie'],
      })
    )
    .catch(() => [])
  const eq = (eqResults as Equipement[])?.[0]
  if (eq) {
    redirect(getEquipementUrl(eq))
  }

  notFound()
}
