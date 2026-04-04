'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = [
  { label: 'Tous',          slug: undefined },
  { label: 'Sonorisation',  slug: 'sonorisation' },
  { label: 'Éclairage',     slug: 'eclairage' },
  { label: 'DJ',            slug: 'dj' },
  { label: 'Scènes',        slug: 'scenes' },
  { label: 'Mapping',       slug: 'mapping' },
  { label: 'Concerts',      slug: 'concerts' },
  { label: 'Câblage',       slug: 'cablage' },
  { label: 'Levage',        slug: 'levage' },
  { label: 'Accessoires',   slug: 'accessoires' },
  { label: 'Nettoyage',     slug: 'nettoyage' },
]

export function CatalogueFilters() {
  const searchParams = useSearchParams()
  const categorie = searchParams.get('categorie') ?? undefined

  return (
    <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filtrer par catégorie">
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
  )
}
