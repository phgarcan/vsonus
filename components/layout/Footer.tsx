import Link from 'next/link'
import { CookieSettingsButton } from '@/components/ui/CookieSettingsButton'

function IconInstagram() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" />
      <circle cx="12" cy="12" r="5" />
      <rect x="16.5" y="5.5" width="1" height="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

const linkCls = 'underline decoration-gray-600 hover:text-white hover:decoration-vsonus-red transition-colors duration-200'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/packs', label: 'Packs' },
  { href: '/gestion-evenementielle', label: 'Événementiel' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
  { href: '/mon-compte', label: 'Mon compte' },
]

const LEGAL_LINKS = [
  { href: '/conditions-generales', label: 'Conditions générales' },
  { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
  { href: '/mentions-legales', label: 'Mentions légales' },
]

export function Footer() {
  return (
    <footer className="bg-vsonus-dark border-t-2 border-vsonus-red" role="contentinfo">

      {/* ── Desktop (md+) : grille 4 colonnes ─────────────────────────── */}
      <div className="hidden md:grid max-w-7xl mx-auto px-6 py-14 grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Col 1 — Logo */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vsonus.svg" alt="V-Sonus" className="h-12 w-auto" />
          <p className="mt-4 text-sm text-gray-300 leading-relaxed">
            Location de matériel événementiel professionnel en Suisse Romande.
          </p>
          <p className="mt-2 text-xs text-gray-600">
            Sonorisation · Éclairage · Scènes · Mapping
          </p>
        </div>

        {/* Col 2 — Navigation */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Navigation</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={linkCls}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Contact */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="leading-relaxed">
              Rue des Bosquets 17<br />
              1800 Vevey, Suisse
            </li>
            <li>
              <a href="tel:+41796512114" className={linkCls}>
                +41 79 651 21 14
              </a>
            </li>
            <li>
              <a href="mailto:info@vsonus.ch" className={linkCls}>
                info@vsonus.ch
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4 — Réseaux sociaux */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Nous suivre</h3>
          <div className="flex flex-col gap-3">
            <a
              href="https://www.instagram.com/vsoonus/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivez-nous sur Instagram"
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-all duration-200 group"
            >
              <span className="w-9 h-9 border border-gray-700 flex items-center justify-center group-hover:border-vsonus-red group-hover:text-vsonus-red transition-all duration-200 flex-shrink-0">
                <IconInstagram />
              </span>
              Instagram
            </a>
            <a
              href="https://www.facebook.com/VSonus.Event/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivez-nous sur Facebook"
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-all duration-200 group"
            >
              <span className="w-9 h-9 border border-gray-700 flex items-center justify-center group-hover:border-vsonus-red group-hover:text-vsonus-red transition-all duration-200 flex-shrink-0">
                <IconFacebook />
              </span>
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* ── Mobile (<md) : une seule colonne ──────────────────────────── */}
      <div className="md:hidden px-6 py-10 space-y-8">

        {/* Logo + description */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vsonus.svg" alt="V-Sonus" className="h-10 w-auto" />
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            Location de matériel événementiel professionnel en Suisse Romande.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={linkCls}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-3">Contact</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p className="leading-relaxed">
              Rue des Bosquets 17<br />
              1800 Vevey, Suisse
            </p>
            <p>
              <a href="tel:+41796512114" className={`${linkCls} text-white font-bold`}>
                +41 79 651 21 14
              </a>
            </p>
            <p>
              <a href="mailto:info@vsonus.ch" className={`${linkCls} text-white font-bold`}>
                info@vsonus.ch
              </a>
            </p>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-3">Nous suivre</h3>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/vsoonus/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivez-nous sur Instagram"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
            >
              <span className="w-9 h-9 border border-gray-700 flex items-center justify-center group-hover:border-vsonus-red group-hover:text-vsonus-red transition-all duration-200">
                <IconInstagram />
              </span>
              Instagram
            </a>
            <a
              href="https://www.facebook.com/VSonus.Event/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivez-nous sur Facebook"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
            >
              <span className="w-9 h-9 border border-gray-700 flex items-center justify-center group-hover:border-vsonus-red group-hover:text-vsonus-red transition-all duration-200">
                <IconFacebook />
              </span>
              Facebook
            </a>
          </div>
        </div>

        {/* Légal */}
        <div className="border-t border-gray-800 pt-6">
          <ul className="space-y-2">
            {LEGAL_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-gray-500 underline decoration-gray-700 hover:text-gray-300 hover:decoration-vsonus-red transition-colors duration-200">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton className="text-sm text-gray-500 underline decoration-gray-700 hover:text-gray-300 hover:decoration-vsonus-red transition-colors duration-200" />
            </li>
          </ul>
          <p className="mt-4 text-xs text-gray-600">
            © {new Date().getFullYear()} V-Sonus. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* ── Barre du bas — légal (desktop seulement) ──────────────────── */}
      <div className="hidden md:block border-t border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} V-Sonus. Tous droits réservés.</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {LEGAL_LINKS.map(({ href, label }, i) => (
              <span key={href} className="flex items-center gap-4">
                {i > 0 && <span className="text-gray-800">·</span>}
                <Link href={href} className="underline decoration-gray-700 hover:text-gray-400 hover:decoration-vsonus-red transition-colors duration-200">
                  {label}
                </Link>
              </span>
            ))}
            <span className="flex items-center gap-4">
              <span className="text-gray-800">·</span>
              <CookieSettingsButton className="underline decoration-gray-700 hover:text-gray-400 hover:decoration-vsonus-red transition-colors duration-200" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
