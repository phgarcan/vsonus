'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SOUS_CAT_LABELS } from '@/lib/directus'

interface SubCategoryBarProps {
  categorie: string
  activeSousCategorie?: string
  sousCategories: string[]
}

export function SubCategoryBar({ categorie, activeSousCategorie, sousCategories }: SubCategoryBarProps) {
  // Détermine la sous-catégorie active depuis l'URL pour réagir immédiatement à la navigation client
  const pathname = usePathname()
  const segments = pathname.split('/')
  // /catalogue/eclairage → undefined, /catalogue/eclairage/lyres → 'lyres'
  const urlSousCategorie = segments[1] === 'catalogue' && segments[2] === categorie && segments[3]
    ? segments[3]
    : undefined
  const resolved = activeSousCategorie ?? urlSousCategorie

  // Auto-scroll vers le filtre actif (visibilité de l'état système — Nielsen)
  const activeRef = useRef<HTMLAnchorElement | null>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [resolved])

  if (sousCategories.length === 0) return null

  return (
    <div className="relative border-t border-white/10 pt-2 mt-1 mb-8 md:mb-10">
      <span className="hidden md:block w-full text-xs text-gray-500 uppercase tracking-widest mb-2">
        Sous-catégories
      </span>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible">
        <Link
          href={`/catalogue/${categorie}`}
          ref={!resolved ? activeRef : undefined}
          className={`flex-shrink-0 px-3 py-1 md:py-1.5 text-xs font-semibold tracking-wide border whitespace-nowrap transition-colors ${
            !resolved
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
            ref={sc === resolved ? activeRef : undefined}
            className={`flex-shrink-0 px-3 py-1 md:py-1.5 text-xs font-semibold tracking-wide border whitespace-nowrap transition-colors ${
              sc === resolved
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
