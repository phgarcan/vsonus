import Link from 'next/link'

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

export function Footer() {
  return (
    <footer className="bg-vsonus-dark border-t-2 border-vsonus-red">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Col 1 — Logo + description */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vsonus.svg" alt="V-Sonus" className="h-12 w-auto" />
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">
            Location de matériel événementiel professionnel en Suisse Romande.
          </p>
          <p className="mt-2 text-xs text-gray-600 leading-relaxed">
            Sonorisation · Éclairage · Scènes · Mapping
          </p>
        </div>

        {/* Col 2 — Navigation */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Navigation</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-white transition-colors duration-200">Accueil</Link></li>
            <li><Link href="/prestations" className="hover:text-white transition-colors duration-200">Packs</Link></li>
            <li><Link href="/gestion-evenementielle" className="hover:text-white transition-colors duration-200">Événementiel</Link></li>
            <li><Link href="/catalogue" className="hover:text-white transition-colors duration-200">Catalogue</Link></li>
            <li><Link href="/galerie" className="hover:text-white transition-colors duration-200">Réalisations</Link></li>
            <li><Link href="/a-propos" className="hover:text-white transition-colors duration-200">À propos</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link></li>
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
              <a href="tel:+41796512114" className="hover:text-white transition-colors duration-200">
                +41 79 651 21 14
              </a>
            </li>
            <li>
              <a href="mailto:info@vsonus.ch" className="hover:text-white transition-colors duration-200">
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

      {/* Barre du bas — légal */}
      <div className="border-t border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} V-Sonus. Tous droits réservés.</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/conditions-generales" className="hover:text-gray-400 transition-colors duration-200">
              Conditions générales
            </Link>
            <span className="text-gray-800">·</span>
            <Link href="/politique-de-confidentialite" className="hover:text-gray-400 transition-colors duration-200">
              Politique de confidentialité
            </Link>
            <span className="text-gray-800">·</span>
            <Link href="/mentions-legales" className="hover:text-gray-400 transition-colors duration-200">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
