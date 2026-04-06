'use client'

import Link from 'next/link'
import { getImageUrl } from '@/lib/directus'
import type { MenuImages } from './Header'

const COLUMNS = [
  {
    heading: 'Sonorisation',
    slug: 'sonorisation',
    href: '/catalogue/sonorisation',
    items: [
      { label: 'Enceintes L-Acoustics et RCF', href: '/catalogue/sonorisation/enceintes' },
      { label: 'Régie, table de mixage, contrôleur DJ', href: '/catalogue/sonorisation/regie' },
      { label: 'Micro, DI', href: '/catalogue/sonorisation/micro' },
      { label: 'Câblage / Accessoires', href: '/catalogue/cablage' },
    ],
  },
  {
    heading: 'Éclairage',
    slug: 'eclairage',
    href: '/catalogue/eclairage',
    items: [
      { label: 'Lyres (Moving Head) LED IP65', href: '/catalogue/eclairage/lyres' },
      { label: 'Projecteur & Barre LED / UV IP65', href: '/catalogue/eclairage/projecteurs' },
      { label: 'Barre tout-en-un', href: '/catalogue/eclairage/barre-tout-en-un' },
      { label: 'Câblage DMX', href: '/catalogue/eclairage/cablage-dmx' },
    ],
  },
  {
    heading: 'Mapping / Laser',
    slug: 'mapping',
    href: '/catalogue/mapping',
    items: [
      { label: 'Vidéoprojecteurs', href: '/catalogue/mapping/videoprojecteurs' },
      { label: 'Câblage & Accessoires', href: '/catalogue/mapping/cablage-accessoires' },
      { label: 'Laser', href: '/catalogue/mapping/laser' },
    ],
  },
  {
    heading: 'Scènes & Structures',
    slug: 'scenes',
    href: '/catalogue/scenes',
    items: [
      { label: 'Structures alu (Truss)', href: '/catalogue/scenes/structures' },
      { label: 'Praticables', href: '/catalogue/scenes/praticables' },
      { label: 'Levage (Pieds et Palan)', href: '/catalogue/scenes/levage' },
      { label: 'Pavillons pliable & Tables', href: '/catalogue/scenes/pavillons-tables' },
    ],
  },
  {
    heading: 'Nettoyage',
    slug: 'nettoyage',
    href: '/catalogue/nettoyage',
    items: [
      { label: 'Autolaveuse & Machine à laver les verres', href: '/catalogue/nettoyage/autolaveuse' },
    ],
  },
]

interface MegaMenuProps {
  onClose: () => void
  menuImages?: MenuImages
}

export function MegaMenu({ onClose, menuImages = {} }: MegaMenuProps) {
  return (
    <div
      className="absolute top-full left-0 w-full bg-vsonus-dark border-t-2 border-vsonus-red z-40"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-5 gap-8">
        {COLUMNS.map((col) => {
          const imgUrl = getImageUrl(menuImages[col.slug] ?? null, { width: '80', height: '80', fit: 'cover', quality: '80' })
          return (
            <div key={col.heading} className="flex flex-col gap-2">
              {imgUrl && (
                <Link href={col.href} onClick={onClose} className="block overflow-hidden group/img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={col.heading}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover group-hover/img:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>
              )}
              <Link
                href={col.href}
                onClick={onClose}
                className="block text-vsonus-red font-bold uppercase tracking-widest text-xs mb-2 border-b border-vsonus-red pb-2 hover:text-white transition-colors"
              >
                {col.heading}
              </Link>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block text-gray-300 text-sm hover:text-white hover:underline transition-colors py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Barre du bas */}
      <div className="border-t border-vsonus-red/40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <Link
            href="/catalogue"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-vsonus-red hover:text-white transition-colors"
          >
            Voir tout le catalogue
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="square" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
