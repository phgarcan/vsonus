'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'

const CATEGORIES = [
  { label: 'Tous',          slug: undefined },
  { label: 'Sonorisation',  slug: 'sonorisation' },
  { label: 'Éclairage',     slug: 'eclairage' },
  { label: 'DJ',            slug: 'dj' },
  { label: 'Scènes & Structures', slug: 'scenes' },
  { label: 'Mapping / Laser', slug: 'mapping' },
  { label: 'Concerts',      slug: 'concerts' },
  { label: 'Câblage',       slug: 'cablage' },
  { label: 'Levage',        slug: 'levage' },
  { label: 'Accessoires',   slug: 'accessoires' },
  { label: 'Nettoyage',     slug: 'nettoyage' },
]

const SOUS_CAT_LABELS: Record<string, string> = {
  enceintes: 'Enceintes',
  regie: 'Régie & Mixage',
  micro: 'Micro & DI',
  lyres: 'Lyres (Moving Head)',
  projecteurs: 'Projecteurs & Barres LED',
  'cablage-dmx': 'Câblage DMX',
  'barre-tout-en-un': 'Barre tout-en-un',
  videoprojecteurs: 'Vidéoprojecteurs',
  structures: 'Structures alu (Truss)',
  praticables: 'Praticables',
  levage: 'Levage',
  'pavillons-tables': 'Pavillons & Tables',
  autolaveuse: 'Autolaveuse',
}

export function CatalogueFilters() {
  const searchParams = useSearchParams()
  const categorie = searchParams.get('categorie') ?? undefined
  const sousCategorie = searchParams.get('sous_categorie') ?? undefined

  return (
    <div className="mb-10 space-y-3">
      {/* Filtres catégorie principale */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        {CATEGORIES.map((cat) => {
          const isActive = cat.slug === categorie || (!cat.slug && !categorie)
          return (
            <Link
              key={cat.label}
              href={cat.slug ? `/catalogue?categorie=${cat.slug}` : '/catalogue'}
              className={[
                'px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all duration-150',
                isActive
                  ? 'bg-vsonus-red border-vsonus-red text-white'
                  : 'bg-transparent border-gray-700 text-gray-400 hover:border-vsonus-red hover:text-white',
              ].join(' ')}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>

      {/* Tag sous-catégorie active */}
      {sousCategorie && categorie && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Filtre :</span>
          <Link
            href={`/catalogue?categorie=${categorie}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-vsonus-dark border border-vsonus-red text-white text-xs font-bold uppercase tracking-widest hover:bg-vsonus-red transition-colors"
          >
            {SOUS_CAT_LABELS[sousCategorie] ?? sousCategorie}
            <X className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  )
}
