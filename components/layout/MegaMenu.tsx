'use client'

import Link from 'next/link'

const COLUMNS = [
  {
    heading: 'Sonorisation',
    slug: 'sonorisation',
    items: [
      { label: 'Enceintes L-Acoustics et RCF',          href: '/catalogue?categorie=sonorisation&sous_categorie=enceintes#materiel-unitaire' },
      { label: 'Régie, table de mixage, contrôleur DJ', href: '/catalogue?categorie=sonorisation&sous_categorie=regie#materiel-unitaire' },
      { label: 'Micro, DI',                             href: '/catalogue?categorie=sonorisation&sous_categorie=micro#materiel-unitaire' },
    ],
  },
  {
    heading: 'Éclairage',
    slug: 'eclairage',
    items: [
      { label: 'Lyres (Moving Head) LED IP65',          href: '/catalogue?categorie=eclairage&sous_categorie=lyres#materiel-unitaire' },
      { label: 'Projecteur & Barre LED / UV IP65',      href: '/catalogue?categorie=eclairage&sous_categorie=projecteurs#materiel-unitaire' },
      { label: 'Câblage DMX',                           href: '/catalogue?categorie=eclairage&sous_categorie=cablage-dmx#materiel-unitaire' },
      { label: 'Barre tout-en-un',                      href: '/catalogue?categorie=eclairage&sous_categorie=barre-tout-en-un#materiel-unitaire' },
    ],
  },
  {
    heading: 'Mapping / Laser',
    slug: 'mapping',
    items: [
      { label: 'Vidéoprojecteurs',                       href: '/catalogue?categorie=mapping&sous_categorie=videoprojecteurs#materiel-unitaire' },
      { label: 'Câblage & Accessoires',                  href: '/catalogue?categorie=cablage#materiel-unitaire' },
      { label: 'Laser',                                   href: '/catalogue?categorie=laser#materiel-unitaire' },
    ],
  },
  {
    heading: 'Scènes & Structures',
    slug: 'scenes',
    items: [
      { label: 'Structures alu (Truss)',                 href: '/catalogue?categorie=scenes&sous_categorie=structures#materiel-unitaire' },
      { label: 'Praticables',                            href: '/catalogue?categorie=scenes&sous_categorie=praticables#materiel-unitaire' },
      { label: 'Levage (Pieds et Palan)',                href: '/catalogue?categorie=scenes&sous_categorie=levage#materiel-unitaire' },
      { label: 'Pavillons pliable & Tables',             href: '/catalogue?categorie=scenes&sous_categorie=pavillons-tables#materiel-unitaire' },
    ],
  },
  {
    heading: 'Nettoyage',
    slug: 'nettoyage',
    items: [
      { label: 'Autolaveuse & Machine à laver les verres', href: '/catalogue?categorie=nettoyage&sous_categorie=autolaveuse#materiel-unitaire' },
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
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-5 gap-8">
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <Link
              href={`/catalogue?categorie=${col.slug}#materiel-unitaire`}
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
