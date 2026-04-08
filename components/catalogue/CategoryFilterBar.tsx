'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

interface Props {
  /** Catégorie active. En mode contrôlé (onCategorieClick fourni), c'est la
   *  source de vérité. En mode lien (Link), fallback sur usePathname. */
  activeCategory?: string
  /** Si fourni, le composant devient contrôlé : utilise des <a> avec onClick
   *  qui appellent ce callback (pas de navigation Next.js). */
  onCategorieClick?: (slug: string | null) => void
}

export function CategoryFilterBar({ activeCategory, onCategorieClick }: Props) {
  const isControlled = !!onCategorieClick

  // En mode contrôlé : la prop est la source de vérité.
  // En mode lien : on lit aussi l'URL pour réagir aux navigations Next.js.
  const pathname = usePathname()
  const segments = pathname.split('/')
  const urlCategory = segments[1] === 'catalogue' && segments[2] ? segments[2] : undefined
  const resolved = isControlled ? activeCategory : (activeCategory ?? urlCategory)

  // Auto-scroll vers le filtre actif (visibilité de l'état système — Nielsen)
  const activeRef = useRef<HTMLAnchorElement | null>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [resolved])

  return (
    <div className="relative mb-6 md:mb-10">
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible"
        role="group"
        aria-label="Filtrer par catégorie"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = tab.slug === (resolved ?? null)
          const className = `flex-shrink-0 px-4 py-2 md:py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
            isActive
              ? 'bg-vsonus-red text-white'
              : 'bg-vsonus-dark border border-gray-700 text-gray-400 hover:text-white hover:border-vsonus-red'
          }`

          // Mode contrôlé : <a> avec onClick (pas de navigation Next.js)
          if (isControlled) {
            return (
              <a
                key={tab.href}
                href={tab.href}
                ref={isActive ? activeRef : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  onCategorieClick!(tab.slug)
                }}
                className={className}
              >
                {tab.label}
              </a>
            )
          }

          // Mode lien : <Link> Next.js classique
          return (
            <Link
              key={tab.href}
              href={tab.href}
              ref={isActive ? activeRef : undefined}
              className={className}
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
