import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { PRESTATIONS, SERVICES_COMMUNS } from '../data'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return PRESTATIONS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const prestation = PRESTATIONS.find((p) => p.slug === slug)
  if (!prestation) return {}
  return {
    title: `${prestation.titre} – V-Sonus`,
    description: `${prestation.intro} — ${prestation.descriptionComplete.slice(0, 140)}…`,
  }
}

export default async function PrestationDetailPage({ params }: Props) {
  const { slug } = await params
  const prestation = PRESTATIONS.find((p) => p.slug === slug)
  if (!prestation) notFound()

  const { titre, sousTitre, intro, descriptionComplete, categorieSlug, Icon, packsLabel } =
    prestation

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="bg-vsonus-dark border-b border-gray-800 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-vsonus-red transition-colors">
              Accueil
            </Link>
            <span className="text-gray-700">/</span>
            <Link href="/prestations" className="hover:text-vsonus-red transition-colors">
              Prestations
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-vsonus-red">{titre}</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="w-14 h-14 border border-vsonus-red flex items-center justify-center flex-shrink-0 mt-1">
              <Icon className="w-7 h-7 text-vsonus-red" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-3">
                {sousTitre}
              </p>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white leading-tight">
                {titre}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESCRIPTION ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Texte principal */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white leading-tight mb-6">
              {intro}
            </h2>
            <p className="text-gray-400 leading-relaxed">{descriptionComplete}</p>
          </div>

          {/* Services communs */}
          <div className="flex flex-col gap-px bg-gray-800">
            {SERVICES_COMMUNS.map(({ label, desc }) => (
              <div key={label} className="bg-vsonus-black p-6 flex gap-4">
                <CheckCircle2
                  className="w-5 h-5 text-vsonus-red flex-shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-white mb-1">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKS ────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-2">
              {packsLabel}
            </p>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">
              Découvrez notre gamme complète
            </h2>
          </div>
          <Link
            href={`/catalogue?categorie=${categorieSlug}`}
            className="group flex items-center gap-3 bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-4 hover:shadow-glow-red-hover transition-shadow duration-200 flex-shrink-0"
          >
            Voir le catalogue
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </section>

      {/* ── CTA DEVIS ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
            Intéressé par cette prestation ?
          </p>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-4">
            Parlons de votre projet
          </h2>
          <p className="text-gray-400 mb-10">
            Obtenez un devis personnalisé ou explorez nos autres prestations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/catalogue?categorie=${categorieSlug}`}
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
