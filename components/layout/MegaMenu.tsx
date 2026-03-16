'use client'

import Link from 'next/link'

const categories = [
  {
    label: 'Sonorisation',
    slug: 'sonorisation',
    items: ['Enceintes L-Acoustics', 'Subwoofers', 'Microphones', 'Mixettes', 'Câblage'],
  },
  {
    label: 'Éclairage',
    slug: 'eclairage',
    items: ['Moving Heads', 'Barres LED', 'Stroboscopes', 'Hazer / Machine à brouillard', 'Contrôleurs DMX'],
  },
  {
    label: 'Scènes & Structures',
    slug: 'scenes',
    items: ['Scènes modulaires', 'Praticables', 'Palans & Élingues', 'Truss aluminium', 'Barrières de sécurité'],
  },
  {
    label: 'Mapping & Vidéo',
    slug: 'mapping',
    items: ['Vidéoprojecteurs', 'Écrans LED', 'Médias serveurs', 'Câblage HDMI/SDI', 'Logiciels mapping'],
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
        {categories.map((cat) => (
          <div key={cat.slug}>
            <Link
              href={`/catalogue?categorie=${cat.slug}`}
              onClick={onClose}
              className="block text-vsonus-red font-bold uppercase tracking-widest text-sm mb-3 border-b border-vsonus-red pb-2 hover:text-white transition-colors"
            >
              {cat.label}
            </Link>
            <ul className="space-y-1">
              {cat.items.map((item) => (
                <li key={item}>
                  <Link
                    href={`/catalogue?categorie=${cat.slug}&q=${encodeURIComponent(item)}`}
                    onClick={onClose}
                    className="block text-gray-400 text-sm hover:text-white transition-colors py-0.5"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
