'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SOUS_CAT_LABELS } from '@/lib/directus'

interface Props {
  categorie: string
  activeSousCategorie?: string
  sousCategories: string[]
  /** Si fourni, le composant devient contrôlé : utilise des <a> avec onClick
   *  qui appellent ce callback (pas de navigation Next.js). */
  onSousCategorieClick?: (slug: string | null) => void
}

export function SubCategoryBar({
  categorie,
  activeSousCategorie,
  sousCategories,
  onSousCategorieClick,
}: Props) {
  const isControlled = !!onSousCategorieClick

  // En mode contrôlé : la prop est la source de vérité.
  // En mode lien : on lit aussi l'URL pour réagir aux navigations Next.js.
  const pathname = usePathname()
  const segments = pathname.split('/')
  const urlSousCategorie =
    segments[1] === 'catalogue' && segments[2] === categorie && segments[3]
      ? segments[3]
      : undefined
  const resolved = isControlled ? activeSousCategorie : (activeSousCategorie ?? urlSousCategorie)

  // Auto-scroll vers le filtre actif (visibilité de l'état système — Nielsen)
  const activeRef = useRef<HTMLAnchorElement | null>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [resolved])

  if (sousCategories.length === 0) return null

  const tabClassName = (active: boolean) =>
    `flex-shrink-0 px-3 py-1 md:py-1.5 text-xs font-semibold tracking-wide border whitespace-nowrap transition-colors ${
      active
        ? 'border-vsonus-red text-vsonus-red bg-vsonus-red/10'
        : 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
    }`

  const renderTab = (
    href: string,
    label: string,
    slug: string | null,
    isActive: boolean,
    key: string
  ) => {
    if (isControlled) {
      return (
        <a
          key={key}
          href={href}
          ref={isActive ? activeRef : undefined}
          onClick={(e) => {
            e.preventDefault()
            onSousCategorieClick!(slug)
          }}
          className={tabClassName(isActive)}
        >
          {label}
        </a>
      )
    }
    return (
      <Link
        key={key}
        href={href}
        ref={isActive ? activeRef : undefined}
        className={tabClassName(isActive)}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="relative border-t border-white/10 pt-2 mt-1 mb-8 md:mb-10">
      <span className="hidden md:block w-full text-xs text-gray-500 uppercase tracking-widest mb-2">
        Sous-catégories
      </span>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible">
        {renderTab(`/catalogue/${categorie}`, 'Tout voir', null, !resolved, 'all')}
        {sousCategories.map((sc) =>
          renderTab(
            `/catalogue/${categorie}/${sc}`,
            SOUS_CAT_LABELS[sc] ?? sc,
            sc,
            sc === resolved,
            sc
          )
        )}
      </div>
      {/* Dégradé de fondu mobile */}
      <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-r from-transparent to-black pointer-events-none md:hidden" />
    </div>
  )
}
