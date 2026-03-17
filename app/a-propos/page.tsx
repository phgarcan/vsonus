import type { Metadata } from 'next'
import Link from 'next/link'
import { Sliders, Zap, Shield, Users, CheckCircle2, Quote } from 'lucide-react'

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
      <section className="bg-vsonus-dark border-b border-gray-800 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
            <Link href="/" className="hover:text-vsonus-red transition-colors">Accueil</Link>
            <span className="text-gray-700">/</span>
            <span className="text-vsonus-red">À propos</span>
          </nav>

          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-widest text-white">
            À propos
          </h1>
        </div>
      </section>

      {/* ── HISTOIRE ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Colonne texte */}
          <div>
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

            {/* Citation mise en avant */}
            <blockquote className="border-l-2 border-vsonus-red pl-6 mb-8">
              <Quote className="w-5 h-5 text-vsonus-red mb-2" strokeWidth={1.5} />
              <p className="text-white font-bold text-lg leading-snug italic">
                &ldquo;Le monde de l&apos;événementiel méritait plus de simplicité, sans jamais
                sacrifier la qualité.&rdquo;
              </p>
            </blockquote>

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

            <blockquote className="border-l-2 border-gray-700 pl-6 mb-8">
              <p className="text-gray-400 italic text-sm">
                &ldquo;Parce qu&apos;un événement réussi, c&apos;est d&apos;abord une histoire de
                confiance.&rdquo;
              </p>
            </blockquote>
          </div>

          {/* Colonne description équipements */}
          <div className="bg-vsonus-dark border border-gray-800 p-8 self-start">
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
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4 text-center">
            L&apos;équipe
          </p>
          <h2 className="text-4xl font-black uppercase tracking-widest text-white text-center mb-12">
            Qui sommes-nous
          </h2>

          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-6 max-w-xs w-full">
              {/* Photo placeholder */}
              <div className="w-40 h-40 bg-vsonus-black border border-gray-700 flex items-center justify-center">
                <Users className="w-16 h-16 text-gray-700" strokeWidth={1} />
              </div>

              <div className="text-center">
                <p className="text-white font-black uppercase tracking-widest text-lg">
                  Paul Villommet
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <p className="text-vsonus-red text-xs font-bold uppercase tracking-widest">
                    Gestion et création d&apos;événements
                  </p>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">
                    Installation · Configuration · Dépannage technique
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
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
        </div>
      </section>

      {/* ── VALEURS ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4 text-center">
            Nos valeurs
          </p>
          <h2 className="text-4xl font-black uppercase tracking-widest text-white text-center mb-12">
            Ce qui nous guide
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-800">
            {VALEURS.map(({ Icon, label, desc }) => (
              <div key={label} className="bg-vsonus-black p-8 flex flex-col gap-4">
                <Icon className="w-8 h-8 text-vsonus-red" strokeWidth={1.5} />
                <span className="text-sm font-black uppercase tracking-widest text-white">
                  {label}
                </span>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA DEVIS ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-4">
            On vous fait ça au plus juste.
          </h2>
          <p className="text-gray-400 mb-10">
            Demandez votre devis personnalisé.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-vsonus-red text-white font-bold uppercase tracking-widest px-12 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
          >
            Demander un devis
          </Link>
        </div>
      </section>
    </main>
  )
}
