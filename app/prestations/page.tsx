import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PRESTATIONS } from './data'

export const metadata: Metadata = {
  title: 'Nos prestations – V-Sonus',
  description:
    'Sonorisation L-Acoustics, éclairage, DJ, concerts, scènes et mapping. Découvrez toutes les prestations événementielles V-Sonus.',
}

export default function PrestationsPage() {
  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="bg-vsonus-dark border-b border-gray-800 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
            <Link href="/" className="hover:text-vsonus-red transition-colors">
              Accueil
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-vsonus-red">Prestations</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
            Ce que nous faisons
          </p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-widest text-white">
            Nos prestations
          </h1>
          <p className="mt-4 text-gray-400 max-w-xl">
            Des solutions complètes pour chaque aspect de votre événement : son, lumière, scène et
            projection.
          </p>
        </div>
      </section>

      {/* ── GRILLE ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-800">
            {PRESTATIONS.map(({ slug, titre, sousTitre, intro, Icon }) => (
              <Link
                key={slug}
                href={`/prestations/${slug}`}
                className="group bg-vsonus-black p-8 flex flex-col gap-5 hover:bg-vsonus-dark transition-colors duration-200"
              >
                {/* Icone */}
                <div className="w-12 h-12 border border-gray-800 group-hover:border-vsonus-red flex items-center justify-center transition-colors duration-200">
                  <Icon
                    className="w-6 h-6 text-vsonus-red"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Contenu */}
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                    {sousTitre}
                  </p>
                  <h2 className="text-lg font-black uppercase tracking-widest text-white group-hover:text-vsonus-red transition-colors duration-200">
                    {titre}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{intro}</p>
                </div>

                {/* CTA */}
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-vsonus-red">
                  Découvrir
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAS ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-vsonus-dark border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4">
            Un projet en tête ?
          </h2>
          <p className="text-gray-400 mb-8">
            Contactez-nous pour un devis personnalisé ou explorez directement nos packs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogue"
              className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-10 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
            >
              Voir le catalogue
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white font-bold uppercase tracking-widest px-10 py-4 hover:border-vsonus-red hover:text-vsonus-red transition-colors duration-200"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
