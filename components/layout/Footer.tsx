import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-vsonus-dark border-t-2 border-vsonus-red mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Image
            src="/logo-vsonus.png"
            alt="V-Sonus"
            width={120}
            height={40}
            className="h-9 w-auto object-contain"
          />
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            Location de matériel événementiel professionnel en Suisse Romande.<br />
            Sonorisation · Éclairage · Scènes · Mapping
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Navigation</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/catalogue" className="hover:text-white transition-colors">Catalogue</a></li>
            <li><a href="/galerie" className="hover:text-white transition-colors">Galerie</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="/checkout" className="hover:text-white transition-colors">Mon projet</a></li>
            <li><a href="/conditions-generales" className="hover:text-white transition-colors">Conditions générales</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Suisse Romande</li>
            <li><a href="mailto:info@v-sonus.ch" className="hover:text-white transition-colors">info@v-sonus.ch</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Légal</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/conditions-generales" className="hover:text-white transition-colors">Conditions générales</a></li>
            <li><a href="/politique-de-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
            <li><a href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 px-6 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} V-Sonus. Tous droits réservés.
      </div>
    </footer>
  )
}
