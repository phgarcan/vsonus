import Link from 'next/link'

const FILTER_TABS = [
  { slug: null, label: 'Tous', href: '/catalogue' },
  { slug: 'sonorisation', label: 'Sonorisation', href: '/catalogue/sonorisation' },
  { slug: 'eclairage', label: 'Éclairage', href: '/catalogue/eclairage' },
  { slug: 'dj', label: 'DJ', href: '/catalogue/dj' },
  { slug: 'scenes', label: 'Scènes & Structures', href: '/catalogue/scenes' },
  { slug: 'mapping', label: 'Mapping / Laser', href: '/catalogue/mapping' },
  { slug: 'concerts', label: 'Concerts', href: '/catalogue/concerts' },
  { slug: 'cablage', label: 'Câblage', href: '/catalogue/cablage' },
  { slug: 'accessoires', label: 'Accessoires', href: '/catalogue/accessoires' },
  { slug: 'nettoyage', label: 'Nettoyage', href: '/catalogue/nettoyage' },
]

export function CategoryFilterBar({ activeCategory }: { activeCategory?: string }) {
  return (
    <div className="relative mb-6 md:mb-10">
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible"
        role="group"
        aria-label="Filtrer par catégorie"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = tab.slug === (activeCategory ?? null)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-shrink-0 px-4 py-2 md:py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-vsonus-red text-white'
                  : 'bg-vsonus-dark border border-gray-700 text-gray-400 hover:text-white hover:border-vsonus-red'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      {/* Dégradé de fondu mobile (affordance scroll) */}
      <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-r from-transparent to-black pointer-events-none md:hidden" />
    </div>
  )
}
