import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site V-Sonus, location de matériel événementiel en Suisse Romande.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://vsonus.ch/mentions-legales' },
}

export default function MentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-xs text-gray-600 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-gray-400">Mentions légales</span>
      </nav>

      <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
        Mentions légales
      </h1>
      <div className="w-12 h-1 bg-vsonus-red mb-10" />

      <div className="space-y-8 text-sm text-gray-400 leading-relaxed">

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Éditeur du site</h2>
          <p>
            <span className="text-white font-semibold">V-Sonus – Paul Villommet</span><br />
            Entreprise individuelle<br />
            Rue des Bosquets 17<br />
            1800 Vevey, Suisse<br />
            Téléphone : <a href="tel:+41796512114" className="hover:text-white transition-colors">+41 79 651 21 14</a><br />
            E-mail : <a href="mailto:info@vsonus.ch" className="text-vsonus-red hover:underline">info@vsonus.ch</a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Responsable de la publication</h2>
          <p>Paul Villommet</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Hébergement</h2>
          <p>
            <span className="text-white font-semibold">Infomaniak Network SA</span><br />
            Rue Eugène-Marziano 25<br />
            1227 Les Acacias, Genève, Suisse<br />
            <a href="https://www.infomaniak.com" target="_blank" rel="noopener noreferrer" className="text-vsonus-red hover:underline">www.infomaniak.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, images, vidéos, logos, graphismes)
            sont la propriété exclusive de V-Sonus – Paul Villommet, sauf mention contraire.
            Toute reproduction, diffusion ou utilisation, même partielle, sans autorisation préalable
            écrite est strictement interdite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Limitation de responsabilité</h2>
          <p>
            V-Sonus s&apos;efforce de maintenir les informations publiées sur ce site aussi exactes et
            à jour que possible. Toutefois, V-Sonus ne saurait être tenu responsable des erreurs,
            omissions ou indisponibilités du service, ni des dommages directs ou indirects résultant
            de l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y accéder.
          </p>
          <p className="mt-3">
            Les informations tarifaires et la disponibilité du matériel présentées sur ce site sont
            données à titre indicatif et ne constituent pas une offre ferme. Elles sont confirmées
            dans le devis officiel transmis après réception de la demande.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Droit applicable</h2>
          <p>
            Le présent site est soumis au droit suisse. Tout litige sera de la compétence exclusive
            des tribunaux du canton de Vaud (Suisse).
          </p>
        </section>

        <p className="text-xs text-gray-600 pt-4 border-t border-gray-800">
          Document mis à jour en 2025.
        </p>
      </div>
    </main>
  )
}
