import Link from 'next/link'
import type { Metadata } from 'next'
import { readItems } from '@directus/sdk'
import { getServerDirectus } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'
import { CatalogueGrid } from '@/components/catalogue/CatalogueGrid'
import { EquipementCard } from '@/components/catalogue/EquipementCard'
import { PackCard } from '@/components/catalogue/PackCard'
import { JsonLdBreadcrumb } from '@/components/seo/JsonLdBreadcrumb'
import { getCatalogueData } from '@/app/actions/catalogue'

export const revalidate = 300

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  if (q) {
    return {
      title: `Recherche : ${q} – V-Sonus`,
      robots: { index: false },
    }
  }
  return {
    title: 'Catalogue Location Matériel Événementiel',
    description:
      'Louez du matériel événementiel pro en Suisse Romande : enceintes L-Acoustics, lyres, LED, consoles DJ Pioneer, scènes modulaires.',
    openGraph: {
      title: 'Catalogue Location Matériel Événementiel | V-Sonus',
      description:
        'Louez du matériel événementiel pro en Suisse Romande : sono, éclairage, scènes, DJ et mapping.',
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

  // ─── Mode recherche ───────────────────────────────────────────────────────
  // Reste un Server Component classique : pas de filtres catégorie, donc pas
  // concerné par le bug de navigation Next.js corrigé via CatalogueGrid.
  if (q) {
    const client = getServerDirectus()

    const searchFilter = {
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
    }

    const [equipements, packs] = await Promise.all([
      client
        .request(
          readItems('equipements', {
            filter: searchFilter as Record<string, unknown>,
            limit: 100,
            fields: [
              'id', 'slug', 'nom', 'prix_journalier', 'stock_total',
              'technicien_obligatoire', 'transport_obligatoire', 'image',
              'categorie', 'sous_categorie', 'marque', 'description',
              'prix_livraison', 'sort',
            ],
            sort: ['sort'],
          })
        )
        .catch((err) => {
          console.error('[catalogue] Erreur equipements:', err?.errors ?? err?.message)
          return [] as Equipement[]
        }),
      client
        .request(
          readItems('packs', {
            filter: searchFilter as Record<string, unknown>,
            limit: 50,
            fields: [
              'id', 'slug', 'nom', 'categorie', 'sous_categorie', 'prix_base',
              'prix_livraison', 'prix_fourgon', 'mode_livraison', 'image_principale',
              'description', 'sort', 'promo_pourcentage', 'promo_label',
              'promo_date_fin', 'capacite', 'marque',
            ],
            sort: ['sort'],
          })
        )
        .catch((err) => {
          console.error('[catalogue] Erreur packs:', err?.errors ?? err?.message)
          return [] as Pack[]
        }),
    ])

    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <JsonLdBreadcrumb items={[
          { name: 'Accueil', href: '/' },
          { name: 'Catalogue', href: '/catalogue' },
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider md:tracking-widest text-white mb-2 break-words">
            Résultats pour &laquo; {q} &raquo;
          </h1>
          <p className="text-gray-400">
            {(equipements as Equipement[]).length + (packs as Pack[]).length} résultat
            {(equipements as Equipement[]).length + (packs as Pack[]).length > 1 ? 's' : ''} trouvé
            {(equipements as Equipement[]).length + (packs as Pack[]).length > 1 ? 's' : ''}
          </p>
          <Link href="/catalogue" className="text-vsonus-red text-sm hover:underline mt-2 inline-block">
            ← Retour au catalogue complet
          </Link>
        </div>

        {(equipements as Equipement[]).length === 0 && (packs as Pack[]).length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">Aucun résultat pour &laquo; {q} &raquo;</p>
            <p className="text-gray-600 text-sm mb-6">
              Essayez avec d&apos;autres termes ou parcourez notre catalogue.
            </p>
            <Link
              href="/catalogue"
              className="inline-block bg-vsonus-red text-white px-6 py-3 font-bold uppercase text-sm"
            >
              Voir tout le catalogue
            </Link>
          </div>
        )}

        {(equipements as Equipement[]).length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
              Matériel unitaire
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(equipements as Equipement[]).map((eq, i) => (
                <EquipementCard key={eq.id} equipement={eq} priority={i < 2} />
              ))}
            </div>
          </section>
        )}

        {(packs as Pack[]).length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
              Packs clé en main
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(packs as Pack[]).map((pack, i) => (
                <PackCard key={pack.id} pack={pack} priority={i < 2} />
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  // ─── Mode catalogue normal ────────────────────────────────────────────────
  // Initial fetch côté serveur pour SEO + premier paint, puis CatalogueGrid
  // prend le relais en client-side pour les navigations entre filtres.
  const { equipements, packs, sousCategories } = await getCatalogueData({})

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <JsonLdBreadcrumb items={[
        { name: 'Accueil', href: '/' },
        { name: 'Catalogue', href: '/catalogue' },
      ]} />
      <CatalogueGrid
        initialEquipements={equipements}
        initialPacks={packs}
        initialSousCategories={sousCategories}
      />
    </div>
  )
}
