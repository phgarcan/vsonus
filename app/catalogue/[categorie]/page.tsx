import { readItems } from '@directus/sdk'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Music, Users } from 'lucide-react'
import { getServerDirectus, getImageUrl, CAT_LABELS, SOUS_CAT_LABELS, getEquipementUrl, getPackUrl } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'
import { isPromoActive, getPackCapacite, getPackPrixEffectif } from '@/lib/directus'
import { AddToCartButton } from '@/components/catalogue/AddToCartButton'
import { CategoryFilterBar } from '@/components/catalogue/CategoryFilterBar'
import { SubCategoryBar } from '@/components/catalogue/SubCategoryBar'
import { JsonLdBreadcrumb } from '@/components/seo/JsonLdBreadcrumb'

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

  // Cas 1 : catégorie valide → listing
  if (VALID_CATEGORIES.includes(categorie)) {
    const client = getServerDirectus()

    const equipFilter: Record<string, unknown> = { categorie: { _contains: categorie } }
    const packFilter: Record<string, unknown> = { categorie: { _eq: categorie } }

    const [equipements, packs] = await Promise.all([
      client.request(
        readItems('equipements', {
          filter: equipFilter,
          limit: 100,
          fields: ['id', 'slug', 'nom', 'prix_journalier', 'stock_total', 'technicien_obligatoire', 'transport_obligatoire', 'image', 'categorie', 'sous_categorie', 'marque', 'description', 'prix_livraison', 'sort'],
          sort: ['sort'],
        })
      ).catch(() => [] as Equipement[]),
      client.request(
        readItems('packs', {
          filter: packFilter,
          limit: 50,
          fields: ['id', 'slug', 'nom', 'categorie', 'sous_categorie', 'prix_base', 'prix_livraison', 'prix_fourgon', 'mode_livraison', 'image_principale', 'description', 'sort', 'promo_pourcentage', 'promo_label', 'promo_date_fin', 'capacite', 'marque'],
          sort: ['sort'],
        })
      ).catch(() => [] as Pack[]),
    ])

    // Extraire les sous-catégories distinctes
    const sousCats = [...new Set(
      (equipements as Equipement[]).map((eq) => eq.sous_categorie).filter(Boolean) as string[]
    )].sort()

    const catLabel = CAT_LABELS[categorie] ?? categorie

    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <JsonLdBreadcrumb items={[
          { name: 'Accueil', href: '/' },
          { name: 'Catalogue', href: '/catalogue' },
          { name: catLabel, href: `/catalogue/${categorie}` },
        ]} />
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-600 mb-8 uppercase tracking-widest">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
          <span>/</span>
          <span className="text-gray-400">{catLabel}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider md:tracking-widest text-white mb-2 break-words">
          Location {catLabel}
        </h1>
        <p className="text-gray-300 mb-8">
          Matériel professionnel · Suisse Romande
        </p>

        {/* Filtres par catégorie */}
        <CategoryFilterBar activeCategory={categorie} />
        <SubCategoryBar categorie={categorie} sousCategories={sousCats} />

        {/* Packs */}
        {(packs as Pack[]).length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
              Packs clé en main
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(packs as Pack[]).map((pack) => {
                const imageUrl = getImageUrl(pack.image_principale, { width: '400', fit: 'contain' })
                return (
                  <article key={pack.id} className="bg-vsonus-dark border-2 border-vsonus-red flex flex-col hover:shadow-glow-red hover:scale-[1.02] transition-all duration-300 group">
                    <Link href={getPackUrl(pack)} className="block">
                      <div className="relative w-full aspect-[4/3] bg-white overflow-hidden">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={pack.nom} fill className="object-contain group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">★</div>
                        )}
                        <span className="absolute top-2 left-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">Pack</span>
                        {isPromoActive(pack) && (
                          <span className="absolute top-2 right-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider animate-pulse">{pack.promo_label || 'PROMO'}</span>
                        )}
                      </div>
                      <div className="p-4 pb-2 flex-1">
                        <h3 className="font-bold text-white text-sm leading-tight group-hover:text-vsonus-red transition-colors">{pack.nom}</h3>
                        {getPackCapacite(pack) && (
                          <p className="text-xs text-gray-300 mt-1 font-medium flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />{getPackCapacite(pack)}
                          </p>
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
              })}
            </div>
          </section>
        )}

        {/* Équipements */}
        <section id="materiel-unitaire">
          <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
            Matériel unitaire
          </h2>
          {(equipements as Equipement[]).length === 0 ? (
            <p className="text-gray-500 py-12 text-center">Aucun matériel trouvé pour cette catégorie.</p>
          ) : (
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
          )}
        </section>
      </div>
    )
  }

  // Cas 2 : pas une catégorie → tenter redirection ancien slug produit
  const client = getServerDirectus()
  const eqResults = await client.request(
    readItems('equipements', {
      filter: { slug: { _eq: categorie } },
      limit: 1,
      fields: ['slug', 'categorie', 'sous_categorie'],
    })
  ).catch(() => [])
  const eq = (eqResults as Equipement[])?.[0]
  if (eq) {
    redirect(getEquipementUrl(eq))
  }

  notFound()
}
