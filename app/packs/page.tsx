import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PRESTATIONS } from './data'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'Packs Location Sono, Lumière, Scène',
  description: 'Packs clé en main pour vos événements : sonorisation L-Acoustics, éclairage, DJ, concerts, scènes et mapping dès 120 CHF en Suisse Romande.',
  openGraph: {
    title: 'Packs Location Sono, Lumière, Scène | V-Sonus',
    description: 'Packs clé en main pour vos événements en Suisse Romande dès 120 CHF.',
    url: 'https://vsonus.ch/packs',
  },
  alternates: { canonical: 'https://vsonus.ch/packs' },
}

export default function PrestationsPage() {
  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="bg-vsonus-dark border-b border-gray-800 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Ce que nous faisons
            </p>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-widest text-white">
              Nos packs
            </h1>
            <p className="mt-4 text-gray-400 max-w-xl leading-relaxed">
              Des solutions complètes pour chaque aspect de votre événement : son, lumière, scène et
              projection.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── GRILLE IMAGE-CARDS ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESTATIONS.map(({ slug, titre, intro, image }, i) => (
              <AnimateOnScroll key={slug} delay={i * 80}>
                <Link
                  href={`/packs/${slug}`}
                  className="group relative block overflow-hidden aspect-[4/3] bg-vsonus-dark"
                >
                  {/* Image de fond */}
                  <Image
                    src={image}
                    alt={titre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/35 transition-colors duration-500" />

                  {/* Contenu */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h2 className="text-white font-black uppercase tracking-widest text-base leading-tight group-hover:text-vsonus-red transition-colors duration-300">
                      {titre}
                    </h2>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                      {intro}
                    </p>
                    <span className="mt-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-vsonus-red">
                      Découvrir
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAS ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4">
              Un projet en tête ?
            </h2>
            <p className="text-gray-400 mb-8">
              Contactez-nous pour un devis personnalisé ou explorez directement notre catalogue.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/catalogue"
                className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-10 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
              >
                Voir le catalogue
              </Link>
              <Link
                href="/contact?sujet=devis"
                className="border-2 border-white text-white font-bold uppercase tracking-widest px-10 py-4 hover:border-vsonus-red hover:text-vsonus-red transition-colors duration-200"
              >
                Demander un devis
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  )
}
