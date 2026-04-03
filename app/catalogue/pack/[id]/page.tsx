import { readItem, readItems } from '@directus/sdk'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { getServerDirectus, getImageUrl } from '@/lib/directus'
import type { Pack } from '@/lib/directus'
import { AddToCartPackSection } from './AddToCartPackSection'

export const revalidate = 300

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CAT_LABEL: Record<string, string> = {
  sonorisation: 'Sonorisation',
  eclairage:    'Éclairage',
  scenes:       'Scènes & Structures',
  mapping:      'Mapping & Vidéo',
  dj:           'DJ',
  concerts:     'Concerts',
}

/** Parse the "• item" list from the description stored in Directus */
function parseMateriel(description: string | undefined): { intro: string; items: string[] } {
  if (!description) return { intro: '', items: [] }
  const lines = description.split('\n')
  const items = lines.filter((l) => l.startsWith('• ')).map((l) => l.slice(2))
  const intro = lines.filter((l) => !l.startsWith('• ') && l.trim()).join('\n')
  return { intro, items }
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const pack = await getServerDirectus().request(
      readItem('packs', id, { fields: ['nom', 'description', 'categorie'] })
    ) as Pack
    const catLabel = CAT_LABEL[pack.categorie ?? ''] ?? pack.categorie ?? ''
    return {
      title: `${pack.nom} – V-Sonus`,
      description: `${catLabel} — ${pack.description?.replace(/\n/g, ' ').slice(0, 140) ?? `Location pack ${pack.nom} en Suisse Romande.`}`,
    }
  } catch {
    return { title: 'Pack – V-Sonus' }
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = getServerDirectus()

  let pack: Pack
  try {
    pack = await client.request(
      readItem('packs', id, {
        fields: ['id', 'nom', 'categorie', 'prix_base', 'prix_livraison', 'prix_fourgon', 'mode_livraison', 'image_principale', 'description'],
      })
    ) as Pack
  } catch {
    notFound()
  }

  // Suggestions : autres packs de la même catégorie
  const suggestions = await client.request(
    readItems('packs', {
      ...(pack.categorie ? { filter: { categorie: { _eq: pack.categorie } } } : {}),
      limit: 4,
      fields: ['id', 'nom', 'prix_base', 'prix_livraison', 'prix_fourgon', 'mode_livraison', 'image_principale', 'categorie', 'sort'],
      sort: ['sort'],
    })
  ).catch(() => [] as Pack[])

  const filteredSuggestions = (suggestions as Pack[]).filter((s) => s.id !== pack.id).slice(0, 3)

  const imageUrl = getImageUrl(pack.image_principale, { width: '900', fit: 'contain' })
  const catLabel = CAT_LABEL[pack.categorie ?? ''] ?? pack.categorie ?? ''
  const { intro, items: materiel } = parseMateriel(pack.description)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-600 mb-8 uppercase tracking-widest flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
        {pack.categorie && (
          <>
            <span>/</span>
            <Link href={`/catalogue?categorie=${pack.categorie}`} className="hover:text-white transition-colors">
              {catLabel}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-400">{pack.nom}</span>
      </nav>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* Image */}
        <div className="relative w-full aspect-[3/2] bg-white border-2 border-vsonus-red overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={pack.nom}
              fill
              className="object-contain p-4"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700 text-6xl">★</div>
          )}
          <span className="absolute top-4 left-4 bg-vsonus-red text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
            Pack
          </span>
        </div>

        {/* Infos */}
        <div className="space-y-6">

          {/* En-tête */}
          <div>
            {pack.categorie && (
              <p className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-2">
                {catLabel}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wide text-white leading-tight">
              {pack.nom}
            </h1>
          </div>

          {/* Prix */}
          <div className="border-t border-b border-gray-800 py-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-vsonus-red">{pack.prix_base.toFixed(2)}</span>
            <span className="text-gray-500 text-sm uppercase tracking-widest">CHF / événement</span>
          </div>

          {/* Intro description (adapté pour + capacité) */}
          {intro && (
            <div className="space-y-1">
              {intro.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-gray-400 leading-relaxed">{line}</p>
              ))}
            </div>
          )}

          {/* Liste matériel */}
          {materiel.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-vsonus-red">
                Matériel inclus
              </h2>
              <ul className="space-y-2">
                {materiel.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-vsonus-red flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-sm text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="border-t border-gray-800 pt-6">
            <AddToCartPackSection pack={pack} />
            <p className="text-xs text-gray-600 mt-3 text-center">
              Livraison + installation par nos techniciens incluses dans chaque pack.
            </p>
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
              const sImg = getImageUrl(s.image_principale, { width: '300', fit: 'contain' })
              return (
                <Link
                  key={s.id}
                  href={`/catalogue/pack/${s.id}`}
                  className="bg-vsonus-dark border border-vsonus-red hover:shadow-glow-red transition-shadow duration-200 flex flex-col group"
                >
                  <div className="relative h-36 bg-white overflow-hidden">
                    {sImg ? (
                      <Image src={sImg} alt={s.nom} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700 text-3xl">★</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-vsonus-red font-bold uppercase tracking-wider">Pack</p>
                    <p className="text-sm font-bold text-white mt-0.5 line-clamp-2 group-hover:text-vsonus-red transition-colors">{s.nom}</p>
                    <p className="text-vsonus-red font-black text-sm mt-2">{s.prix_base.toFixed(2)} CHF</p>
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
