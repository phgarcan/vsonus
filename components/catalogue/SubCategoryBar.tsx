import Link from 'next/link'
import { SOUS_CAT_LABELS } from '@/lib/directus'

interface SubCategoryBarProps {
  categorie: string
  activeSousCategorie?: string
  sousCategories: string[]
}

export function SubCategoryBar({ categorie, activeSousCategorie, sousCategories }: SubCategoryBarProps) {
  if (sousCategories.length === 0) return null

  return (
    <div className="relative border-t border-white/10 pt-2 mt-1 mb-8 md:mb-10">
      <span className="hidden md:block w-full text-xs text-gray-500 uppercase tracking-widest mb-2">
        Sous-catégories
      </span>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible">
        <Link
          href={`/catalogue/${categorie}`}
          className={`flex-shrink-0 px-3 py-1 md:py-1.5 text-xs font-semibold tracking-wide border whitespace-nowrap transition-colors ${
            !activeSousCategorie
              ? 'border-vsonus-red text-vsonus-red bg-vsonus-red/10'
              : 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
          }`}
        >
          Tout voir
        </Link>

        {sousCategories.map((sc) => (
          <Link
            key={sc}
            href={`/catalogue/${categorie}/${sc}`}
            className={`flex-shrink-0 px-3 py-1 md:py-1.5 text-xs font-semibold tracking-wide border whitespace-nowrap transition-colors ${
              sc === activeSousCategorie
                ? 'border-vsonus-red text-vsonus-red bg-vsonus-red/10'
                : 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
            }`}
          >
            {SOUS_CAT_LABELS[sc] ?? sc}
          </Link>
        ))}
      </div>
      {/* Dégradé de fondu mobile */}
      <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-r from-transparent to-black pointer-events-none md:hidden" />
    </div>
  )
}
