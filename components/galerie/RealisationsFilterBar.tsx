'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { label: 'Tous', slug: undefined },
  { label: 'Sonorisation', slug: 'sonorisation' },
  { label: 'Éclairage', slug: 'eclairage' },
  { label: 'Scène', slug: 'scene' },
  { label: 'DJ', slug: 'dj' },
  { label: 'Concert', slug: 'concert' },
  { label: 'Mapping', slug: 'mapping' },
  { label: 'Festival', slug: 'festival' },
]

export function RealisationsFilterBar() {
  // Lit le query string côté client pour réagir immédiatement à la navigation
  const searchParams = useSearchParams()
  const active = searchParams.get('categorie') ?? undefined

  return (
    <div className="flex flex-wrap gap-2 mb-12">
      {CATEGORIES.map((cat) => {
        const isActive = cat.slug === active || (!cat.slug && !active)
        return (
          <Link
            key={cat.label}
            href={cat.slug ? `/realisations?categorie=${cat.slug}` : '/realisations'}
            scroll={false}
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
