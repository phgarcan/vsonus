import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { readItems } from '@directus/sdk'
import { CheckCircle2 } from 'lucide-react'
import { PRESTATIONS, SERVICES_COMMUNS } from '../data'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { getServerDirectus, getImageUrl } from '@/lib/directus'
import type { Pack } from '@/lib/directus'
import { AddToCartButton } from '@/components/catalogue/AddToCartButton'

export const revalidate = 300

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

// Icon decoration animée selon le type de prestation
function AnimatedAccent({ animation }: { animation: string | null }) {
  if (!animation) {
    return <div className="w-16 h-0.5 bg-vsonus-red mb-6" />
  }
  if (animation === 'wave') {
    // Onde sonore — barres qui pulsent
    return (
      <div className="flex items-end gap-1 mb-6">
        {[3, 5, 8, 5, 3, 7, 4, 6, 3].map((h, i) => (
          <div
            key={i}
            className="w-1 bg-vsonus-red animate-wave"
            style={{ height: `${h * 4}px`, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    )
  }
  if (animation === 'glow-pulse') {
    return <div className="w-16 h-0.5 bg-vsonus-red animate-glow-pulse mb-6" />
  }
  if (animation === 'spin-slow') {
    return (
      <div className="mb-6">
        <div className="w-8 h-8 border-2 border-vsonus-red animate-spin-slow inline-block" style={{ borderRadius: '0' }} />
      </div>
    )
  }
  if (animation === 'gradient-x') {
    return (
      <div
        className="w-32 h-0.5 mb-6 animate-gradient-x"
        style={{
          backgroundImage: 'linear-gradient(90deg, #EC1C24, #ff6b6b, #EC1C24)',
          backgroundSize: '200% 100%',
        }}
      />
    )
  }
  return <div className="w-16 h-0.5 bg-vsonus-red mb-6" />
}

export default async function PrestationDetailPage({ params }: Props) {
  const { slug } = await params
  const prestation = PRESTATIONS.find((p) => p.slug === slug)
  if (!prestation) notFound()

  const { titre, sousTitre, intro, descriptionComplete, categorieSlug, Icon, packsLabel, image, animation } =
    prestation

  // Fetch packs Directus pour cette catégorie
  const client = getServerDirectus()
  const packs: Pack[] = await client
    .request(
      readItems('packs', {
        filter: { categorie: { _eq: categorieSlug } },
        limit: 10,
        fields: ['id', 'nom', 'categorie', 'prix_base', 'image_principale', 'description'],
      })
    )
    .catch(() => [] as Pack[])

  return (
    <main>
      {/* ── HERO PLEINE LARGEUR ───────────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-end min-h-[55vh] overflow-hidden border-b-2 border-vsonus-red">
        {/* Image de fond */}
        <Image
          src={image}
          alt={titre}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-14 pt-32 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-vsonus-red transition-colors">Accueil</Link>
            <span className="text-gray-700">/</span>
            <Link href="/prestations" className="hover:text-vsonus-red transition-colors">Packs</Link>
            <span className="text-gray-700">/</span>
            <span className="text-vsonus-red">{titre}</span>
          </nav>

          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-3">
              {sousTitre}
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 border border-vsonus-red flex items-center justify-center flex-shrink-0 ${animation === 'glow-pulse' ? 'animate-glow-pulse' : ''}`}>
                <Icon className={`w-7 h-7 text-vsonus-red ${animation === 'spin-slow' ? 'animate-spin-slow' : ''}`} strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white leading-tight">
                {titre}
              </h1>
            </div>
            <AnimatedAccent animation={animation} />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── DESCRIPTION ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Texte principal */}
          <AnimateOnScroll>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white leading-tight mb-6">
              {intro}
            </h2>
            <p className="text-gray-400 leading-relaxed">{descriptionComplete}</p>
          </AnimateOnScroll>

          {/* Services communs */}
          <div className="flex flex-col gap-px bg-gray-800">
            {SERVICES_COMMUNS.map(({ label, desc }, i) => (
              <AnimateOnScroll key={label} delay={i * 100}>
                <div className="bg-vsonus-black p-6 flex gap-4">
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
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOS PACKS DIRECTUS ───────────────────────────────────────────────── */}
      {packs.length > 0 && (
        <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                {packsLabel}
              </p>
              <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-12">
                Nos packs disponibles
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packs.map((pack, i) => {
                const imgUrl = getImageUrl(pack.image_principale, { width: '600', height: '400', fit: 'cover', quality: '85' })
                return (
                  <AnimateOnScroll key={pack.id} delay={i * 100}>
                    <article className="bg-vsonus-black border border-gray-800 flex flex-col hover:border-vsonus-red transition-colors duration-300 group">
                      <Link href={`/catalogue/pack/${pack.id}`} className="block">
                        {/* Image */}
                        <div className="relative w-full h-44 bg-vsonus-dark overflow-hidden">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={pack.nom}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">★</div>
                          )}
                          <span className="absolute top-3 left-3 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                            Pack
                          </span>
                        </div>

                        <div className="p-5 pb-3">
                          <h3 className="font-bold text-white text-sm leading-tight group-hover:text-vsonus-red transition-colors">
                            {pack.nom}
                          </h3>
                          {pack.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                              {pack.description}
                            </p>
                          )}
                          <div className="mt-3">
                            <span className="text-vsonus-red font-black text-lg">
                              {pack.prix_base.toFixed(2)}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">CHF / événement</span>
                          </div>
                        </div>
                      </Link>
                      <div className="px-5 pb-5">
                        <AddToCartButton type="pack" item={pack} />
                      </div>
                    </article>
                  </AnimateOnScroll>
                )
              })}
            </div>

            <AnimateOnScroll delay={100}>
              <div className="mt-10 text-center">
                <Link
                  href={`/catalogue?categorie=${categorieSlug}`}
                  className="inline-flex items-center gap-2 border-2 border-gray-700 text-gray-400 font-bold uppercase tracking-widest px-8 py-3 hover:border-vsonus-red hover:text-white transition-colors duration-200"
                >
                  Voir tout le matériel {titre.toLowerCase()}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* ── CTA DEVIS ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Besoin d&apos;un pack personnalisé ?
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-4">
              Contactez-nous
            </h2>
            <p className="text-gray-400 mb-10">
              Nous construisons des offres sur-mesure adaptées à la taille et aux besoins de votre
              événement.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact?sujet=devis"
                className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-10 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
              >
                Demander un devis
              </Link>
              <Link
                href={`/catalogue?categorie=${categorieSlug}`}
                className="border-2 border-white text-white font-bold uppercase tracking-widest px-10 py-4 hover:border-vsonus-red hover:text-vsonus-red transition-colors duration-200"
              >
                Voir le catalogue
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  )
}
