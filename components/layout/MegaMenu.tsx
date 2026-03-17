'use client'

import Link from 'next/link'

const COLUMNS = [
  {
    heading: 'Sonorisation',
    items: [
      { label: 'Enceintes L-Acoustics',   href: '/catalogue?categorie=sonorisation#materiel-unitaire' },
      { label: 'Subwoofers & Retours',     href: '/catalogue?categorie=sonorisation#materiel-unitaire' },
      { label: 'Consoles de mixage',       href: '/catalogue?categorie=sonorisation#materiel-unitaire' },
      { label: 'Équipement DJ (Pioneer)',  href: '/catalogue?categorie=dj#materiel-unitaire' },
    ],
  },
  {
    heading: 'Éclairage',
    items: [
      { label: 'Lyres (Moving Heads)',      href: '/catalogue?categorie=eclairage#materiel-unitaire' },
      { label: 'Projecteurs & Barres LED',  href: '/catalogue?categorie=eclairage#materiel-unitaire' },
      { label: 'Effets (Strob, UV)',        href: '/catalogue?categorie=eclairage#materiel-unitaire' },
    ],
  },
  {
    heading: 'Scènes & Structures',
    items: [
      { label: 'Praticables & Podiums',    href: '/catalogue?categorie=scenes#materiel-unitaire' },
      { label: 'Structure Alu (Truss)',     href: '/catalogue?categorie=scenes#materiel-unitaire' },
      { label: 'Levage (Palans & Pieds)',   href: '/catalogue?categorie=scenes#materiel-unitaire' },
    ],
  },
  {
    heading: 'Vidéo & Mapping',
    items: [
      { label: 'Vidéoprojecteurs',         href: '/catalogue?categorie=mapping#materiel-unitaire' },
      { label: 'Câblage & Accessoires',    href: '/catalogue?categorie=mapping#materiel-unitaire' },
    ],
  },
]

interface MegaMenuProps {
  onClose: () => void
}

export function MegaMenu({ onClose }: MegaMenuProps) {
  return (
    <div
      className="absolute top-full left-0 w-full bg-vsonus-dark border-t-2 border-vsonus-red z-40"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <Link
              href={`/catalogue?categorie=${col.heading.toLowerCase().replace(/\s.*/, '')}#materiel-unitaire`}
              onClick={onClose}
              className="block text-vsonus-red font-bold uppercase tracking-widest text-xs mb-4 border-b border-vsonus-red pb-2 hover:text-white transition-colors"
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
        ))}
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
