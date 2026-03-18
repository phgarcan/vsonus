import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Sliders, Zap, Shield, Users, CheckCircle2, Quote } from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { BrandCarousel } from '@/components/ui/BrandCarousel'

export const metadata: Metadata = {
  title: 'À propos de V-Sonus – Location Événementielle Vaud',
  description: 'Découvrez V-Sonus, entreprise de location de matériel événementiel basée à Vevey. Notre équipe, nos valeurs et notre engagement.',
  openGraph: {
    title: 'À propos de V-Sonus | Location Événementielle Vaud',
    description: 'Notre équipe, nos valeurs et notre engagement pour vos événements en Suisse Romande.',
    url: 'https://vsonus.ch/a-propos',
  },
  alternates: { canonical: 'https://vsonus.ch/a-propos' },
}

const VALEURS = [
  {
    Icon: Sliders,
    label: 'Sur-mesure',
    desc: "Solutions scalables pour tous types d'événements",
  },
  {
    Icon: Zap,
    label: 'Innovation',
    desc: 'Technologie audio/lighting dernier cri',
  },
  {
    Icon: Shield,
    label: 'Fiabilité',
    desc: 'Matériel testé, partenaires certifiés, délais tenus',
  },
  {
    Icon: Users,
    label: 'Synergie',
    desc: 'Un seul interlocuteur, une équipe soudée',
  },
]

const POINTS_CLES = [
  'Du matériel professionnel et polyvalent',
  'De la robustesse',
  'Un partenaire qui vous écoute avant de proposer',
]

export default function AProposPage() {
  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-end min-h-[55vh] overflow-hidden border-b-2 border-vsonus-red">
        <Image
          src="/images/expertise.jpeg"
          alt="V-Sonus – À propos"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/20" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-14 pt-32 w-full">
          <AnimateOnScroll>
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span className="text-gray-600">/</span>
              <span className="text-vsonus-red">À propos</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Qui sommes-nous
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-widest text-white leading-tight">
              À propos de<br />
              <span className="text-vsonus-red">V-Sonus</span>
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl leading-relaxed">
              L&apos;aventure événementielle, née d&apos;une passion.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── HISTOIRE ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Colonne texte */}
          <div>
            <AnimateOnScroll>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Histoire
              </p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white leading-tight mb-6">
                V-Sonus – L&apos;aventure événementielle,
                <br />née d&apos;une passion
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Après des années d&apos;organisation d&apos;événement, nous avons décidé de créer
                V-Sonus, une entreprise spécialisée dans l&apos;événementiel conçue pour répondre à
                vos besoins tout en gardant une gestion qualitative de ceux-ci.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              {/* Citation mise en avant */}
              <blockquote className="border-l-2 border-vsonus-red pl-6 mb-8">
                <Quote className="w-5 h-5 text-vsonus-red mb-2" strokeWidth={1.5} />
                <p className="text-white font-bold text-lg leading-snug italic">
                  &ldquo;Le monde de l&apos;événementiel méritait plus de simplicité, sans jamais
                  sacrifier la qualité.&rdquo;
                </p>
              </blockquote>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              {/* Points clés */}
              <ul className="flex flex-col gap-3 mb-8">
                {POINTS_CLES.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 text-vsonus-red flex-shrink-0 mt-0.5"
                      strokeWidth={1.5}
                    />
                    <span className="text-gray-300 text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>

          </div>

          {/* Colonne description équipements */}
          <AnimateOnScroll delay={150}>
            <div className="bg-vsonus-dark border border-gray-800 p-8 self-start hover:border-vsonus-red transition-colors duration-300">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Nos équipements
              </p>
              <p className="text-gray-300 leading-relaxed text-sm">
                Un système sonore de la marque{' '}
                <span className="text-white font-bold">L-Acoustics</span> utilisé dans la plupart des
                festivals dans le monde, des équipements d&apos;éclairage puissant et résistant aux
                intempéries, une scène professionnelle permettant une couverture optimale de vos
                artistes et un service de projection et mapping sur mesure vous permettent de réaliser
                vos projets et organiser un événement qualitatif à tous les niveaux.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── MARQUES PARTENAIRES ────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600 text-center mb-8">
              Nos partenaires techniques
            </p>
          </AnimateOnScroll>
          <BrandCarousel />
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4 text-center">
              L&apos;équipe
            </p>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white text-center mb-12">
              Qui sommes-nous
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll delay={150}>
            <div className="flex flex-col md:flex-row items-center gap-10 max-w-2xl mx-auto">
              {/* Photo */}
              <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden border-2 border-vsonus-red">
                <Image
                  src="/images/team/paul.jpg"
                  alt="Paul Villommet – Fondateur V-Sonus"
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>

              <div>
                <p className="text-white font-black uppercase tracking-widest text-xl">
                  Paul Villommet
                </p>
                <p className="text-vsonus-red text-xs font-bold uppercase tracking-widest mt-2">
                  Fondateur & Directeur technique
                </p>
                <div className="mt-4 flex flex-col gap-1.5">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Gestion et création d&apos;événements. Installation, configuration et dépannage technique.
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Notre mission
            </p>
            <p className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white leading-tight">
              Vous accompagner pour la création de vos événements de manière{' '}
              <span className="text-vsonus-red">simple et professionnelle.</span>
            </p>
            <p className="mt-6 text-gray-400 leading-relaxed">
              Permettre une gestion facile et précise de vos besoins tout en gardant la meilleure
              qualité et performance possible.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── VALEURS ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4 text-center">
              Nos valeurs
            </p>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white text-center mb-12">
              Ce qui nous guide
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-800">
            {VALEURS.map(({ Icon, label, desc }, i) => (
              <AnimateOnScroll key={label} delay={i * 100} className="h-full">
                <div className="bg-vsonus-black p-8 flex flex-col gap-4 h-full hover:bg-vsonus-dark transition-colors duration-300 group">
                  <Icon className="w-8 h-8 text-vsonus-red group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                  <span className="text-sm font-black uppercase tracking-widest text-white">
                    {label}
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA DEVIS ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Besoin d&apos;une solution sur-mesure ?
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-4">
              Demander un devis
            </h2>
            <p className="text-gray-400 mb-10">
              Nous élaborons des offres personnalisées adaptées à vos besoins.
              Remplissez notre formulaire pour obtenir un devis gratuit et sans engagement.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-vsonus-red text-white font-bold uppercase tracking-widest px-12 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
            >
              Demander un devis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="square" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  )
}
