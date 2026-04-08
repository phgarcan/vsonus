import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { readItems } from '@directus/sdk'
import { Headphones, Truck, Volume2, Lightbulb, MonitorPlay, UserCheck, Star, Heart, Building2, Music, Users } from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { getServerDirectus, getImageUrl } from '@/lib/directus'
import type { Realisation } from '@/lib/directus'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Gestion Événementielle Suisse Romande',
  description:
    'V-Sonus gère tous les aspects techniques de votre événement : conseil, sono L-Acoustics, éclairage, scène, coordination.',
  openGraph: {
    title: 'Gestion Événementielle Suisse Romande | V-Sonus',
    description: 'De l\'idée à la réalisation : conseil, sonorisation, éclairage, scène et coordination technique.',
    url: 'https://vsonus.ch/gestion-evenementielle',
  },
  alternates: { canonical: 'https://vsonus.ch/gestion-evenementielle' },
}

// ─── Données statiques ─────────────────────────────────────────────────────────

const COMPETENCES = [
  {
    Icon: Headphones,
    label: 'Conseil technique',
    desc: "On vous aide à choisir le matériel adapté à votre événement et à votre budget, sans superflu.",
  },
  {
    Icon: Truck,
    label: 'Logistique',
    desc: "Transport, montage, démontage — une équipe expérimentée sur site, à l'heure.",
  },
  {
    Icon: Volume2,
    label: 'Sonorisation',
    desc: "Systèmes L-Acoustics pour un son professionnel de 50 à 2000 personnes.",
  },
  {
    Icon: Lightbulb,
    label: 'Éclairage',
    desc: "Mise en lumière scénique, architectural, ambiance — chaque événement a son atmosphère.",
  },
  {
    Icon: MonitorPlay,
    label: 'Scène & Structure',
    desc: "Scènes modulaires, structures line array, praticables — conformes aux normes de sécurité.",
  },
  {
    Icon: UserCheck,
    label: 'Coordination technique',
    desc: "Un interlocuteur unique du début à la fin, pour que vous n'ayez rien à gérer.",
  },
]

const PROCESSUS = [
  {
    num: '01',
    label: 'Prise de contact',
    desc: 'Décrivez votre projet — on écoute, on pose les bonnes questions, on comprend votre vision.',
  },
  {
    num: '02',
    label: 'Étude & Devis',
    desc: "On analyse vos besoins, votre lieu et votre budget, puis on propose une solution sur-mesure.",
  },
  {
    num: '03',
    label: 'Préparation',
    desc: "Le matériel est sélectionné, testé et préparé bien en avance — zéro surprise le jour J.",
  },
  {
    num: '04',
    label: 'Installation',
    desc: "Notre équipe installe et configure tout sur site, en respectant les contraintes du lieu et du timing.",
  },
  {
    num: '05',
    label: 'Événement & Démontage',
    desc: "On reste disponibles pendant l'événement et on gère le démontage — vous profitez pleinement.",
  },
]

const TEMOIGNAGES = [
  {
    name: 'Gatien Paturel',
    context: 'Glion Music Festival',
    text: 'We hired the V Sonus team for the Glion Music Festival in August 2024. The team is highly professional, committed and friendly. The equipment is top quality. Strongly recommend.',
  },
  {
    name: 'Daniel Leuenberger',
    context: '',
    text: 'Prestation impeccable. Matériel de qualité époustouflante. Savoir-faire et fiabilité. Du lourd !',
  },
  {
    name: 'Hugo Tomé',
    context: 'Pigalle',
    text: "Vsonus est au top niveau ! Paul et son équipe sont vraiment super. J'ai bossé avec eux pour la scène Tech de Unilive et pour la quadriphonie de notre Boiler Stage à La Toumaï Evolution du Port Franc. Leur L-Acoustic sonne à merveille.",
  },
]

const TYPES_EVENEMENTS: { label: string; desc: string; Icon: typeof Heart }[] = [
  {
    label: 'Événements privés',
    desc: 'Anniversaires, mariages, soirées thématiques — on crée l\'ambiance qui vous ressemble.',
    Icon: Heart,
  },
  {
    label: 'Événements d\'entreprise',
    desc: 'Soirées corporate, séminaires, lancements produit — une prestation professionnelle et discrète.',
    Icon: Building2,
  },
  {
    label: 'Festivals & Concerts',
    desc: 'De 50 à 2000 personnes, en intérieur ou en plein air — on a l\'équipement et l\'expérience.',
    Icon: Music,
  },
  {
    label: 'Événements publics',
    desc: 'Manifestations culturelles, fêtes locales, événements associatifs — partenaire de confiance.',
    Icon: Users,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GestionEvenementielle() {
  // Fetch 4 réalisations récentes depuis Directus
  const client = getServerDirectus()
  const realisations: Realisation[] = await client
    .request(
      readItems('realisations', {
        filter: { publie: { _eq: true } },
        sort: ['-date_evenement'],
        limit: 4,
        fields: ['id', 'titre', 'description', 'categorie', 'lieu', 'image_principale', 'publie'],
      })
    )
    .catch(() => [] as Realisation[])

  return (
    <main>

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-end min-h-[65vh] overflow-hidden border-b-2 border-vsonus-red">
        <Image
          src="/images/hero-gestion-evenementielle.jpeg"
          alt="Scène DJ Circus of Sound — gestion événementielle V-Sonus"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/20" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-16 pt-32 w-full">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              V-Sonus — Votre partenaire technique
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-wider sm:tracking-widest text-white leading-tight break-words">
              Gestion<br />
              <span className="text-vsonus-red">événementielle</span>
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl leading-relaxed">
              De l&apos;idée à la réalisation, on s&apos;occupe de tout.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={350}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact?sujet=devis"
                className="inline-flex items-center justify-center gap-2 bg-vsonus-red text-white font-bold uppercase tracking-widest px-10 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
              >
                Discuter de mon projet
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/realisations"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-bold uppercase tracking-widest px-10 py-4 hover:border-vsonus-red hover:text-vsonus-red transition-colors duration-200"
              >
                Voir nos réalisations
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── 2. PROBLÈME / SOLUTION ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <AnimateOnScroll>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Le défi
              </p>
              <h2 className="text-3xl font-black uppercase tracking-widest text-white leading-tight mb-6">
                Organiser un événement,<br />c&apos;est complexe
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Choix du matériel, logistique, installation, coordination technique, gestion des
                imprévus... L&apos;aspect technique d&apos;un événement mobilise du temps et de
                l&apos;énergie que vous devriez consacrer à vos invités.
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={150}>
            <div className="border-l-4 border-vsonus-red pl-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Notre solution
              </p>
              <h3 className="text-2xl font-black uppercase tracking-widest text-white leading-tight mb-6">
                Laissez-nous gérer les aspects techniques
              </h3>
              <p className="text-gray-400 leading-relaxed">
                V-Sonus prend en charge tous les aspects techniques de votre événement — du
                matériel à la logistique en passant par l&apos;installation et la coordination.
                Vous vous concentrez sur vos invités, on gère le reste.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── 3. COMPÉTENCES ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Expertise
              </p>
              <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                Ce qu&apos;on maîtrise
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-800">
            {COMPETENCES.map(({ Icon, label, desc }, i) => (
              <AnimateOnScroll key={label} delay={i * 80}>
                <div className="bg-vsonus-black p-8 flex flex-col gap-4 hover:bg-vsonus-dark transition-colors duration-200 group h-full">
                  <div className="w-12 h-12 border border-gray-800 group-hover:border-vsonus-red flex items-center justify-center transition-colors duration-200 flex-shrink-0">
                    <Icon className="w-6 h-6 text-vsonus-red" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-vsonus-red transition-colors duration-200">
                    {label}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. PROCESSUS ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Notre méthode
              </p>
              <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                Comment ça marche
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            {/* Étapes */}
            <div className="relative">
              {/* Ligne verticale connectrice */}
              <div className="absolute left-8 top-8 bottom-8 w-px bg-gray-800 hidden md:block" />
              <div className="flex flex-col gap-0">
                {PROCESSUS.map(({ num, label, desc }, i) => (
                  <AnimateOnScroll key={num} delay={i * 100}>
                    <div className="flex gap-8 items-start py-6 border-b border-gray-800 last:border-0 relative">
                      <div className="w-16 h-16 bg-vsonus-black border-2 border-vsonus-red flex items-center justify-center flex-shrink-0 relative z-10">
                        <span className="text-vsonus-red font-black text-lg">{num}</span>
                      </div>
                      <div className="pt-3">
                        <h3 className="text-white font-black uppercase tracking-widest text-base mb-2">
                          {label}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>

            {/* Image */}
            <AnimateOnScroll delay={200} className="flex items-center self-stretch">
              <div className="relative w-full h-full min-h-[400px] overflow-hidden border border-gray-800">
                <Image
                  src="/images/packs/compressed_DSC09688.jpg"
                  alt="Installation événementielle V-Sonus"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── 5. RÉALISATIONS ──────────────────────────────────────────────────── */}
      {realisations.length > 0 && (
        <section className="py-24 px-6 bg-vsonus-black border-b border-gray-800">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                    Portfolio
                  </p>
                  <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                    Quelques réalisations
                  </h2>
                </div>
                <Link
                  href="/realisations"
                  className="flex-shrink-0 inline-flex items-center gap-2 border-2 border-vsonus-red text-vsonus-red font-bold uppercase tracking-widest px-6 py-3 hover:bg-vsonus-red hover:text-white transition-colors duration-200"
                >
                  Voir tout
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {realisations.map((real, i) => {
                const imgUrl = getImageUrl(real.image_principale, { width: '600', height: '400', fit: 'cover', quality: '85' })
                return (
                  <AnimateOnScroll key={real.id} delay={i * 80}>
                    <Link href="/realisations" className="group relative block aspect-[3/4] overflow-hidden bg-vsonus-dark border border-gray-800 hover:border-vsonus-red transition-colors duration-300">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={real.titre}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Music className="w-8 h-8 text-gray-800" strokeWidth={1} /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/30 transition-all duration-300" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="text-white font-black uppercase tracking-widest text-xs leading-tight group-hover:text-vsonus-red transition-colors duration-200">
                          {real.titre}
                        </h3>
                        {real.lieu && (
                          <p className="text-gray-500 text-xs mt-1">{real.lieu}</p>
                        )}
                      </div>
                    </Link>
                  </AnimateOnScroll>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Témoignages
              </p>
              <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                Ils nous font confiance
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {TEMOIGNAGES.map(({ name, context, text }, i) => (
              <AnimateOnScroll key={name} delay={i * 120}>
                <div className="bg-vsonus-black p-8 flex flex-col gap-4 relative overflow-hidden border border-gray-800 hover:border-vsonus-red transition-colors duration-300">
                  <span
                    aria-hidden
                    className="absolute top-2 right-4 text-[7rem] font-black leading-none text-vsonus-red opacity-10 select-none pointer-events-none"
                  >
                    &ldquo;
                  </span>
                  <div className="flex gap-1 relative z-10">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-vsonus-red text-vsonus-red" />
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1 relative z-10">
                    &ldquo;{text}&rdquo;
                  </p>
                  <div className="relative z-10">
                    <p className="text-white font-bold text-sm uppercase tracking-widest">{name}</p>
                    {context && (
                      <p className="text-vsonus-red text-xs uppercase tracking-widest mt-0.5">{context}</p>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. TYPES D'ÉVÉNEMENTS ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Pour qui
              </p>
              <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                Tous types d&apos;événements
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-800">
            {TYPES_EVENEMENTS.map(({ label, desc, Icon }, i) => (
              <AnimateOnScroll key={label} delay={i * 80}>
                <div className="bg-vsonus-black p-8 flex flex-col gap-4 h-full hover:bg-vsonus-dark transition-colors duration-200 group">
                  <div className="w-12 h-12 border border-gray-800 group-hover:border-vsonus-red flex items-center justify-center transition-colors duration-200 flex-shrink-0">
                    <Icon className="w-6 h-6 text-vsonus-red" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-vsonus-red transition-colors duration-200">
                    {label}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll delay={150}>
            <p className="text-center text-gray-500 text-sm mt-8 font-bold uppercase tracking-widest">
              Contactez-nous pour un devis personnalisé
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── 8. CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-vsonus-dark border-b-2 border-vsonus-red">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Prêt à lancer votre projet ?
            </p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-6">
              Discutons de<br />votre événement
            </h2>
            <p className="text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto">
              Dites-nous ce que vous prévoyez et on vous revient rapidement avec une proposition
              adaptée à vos besoins et votre budget.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={150}>
            <Link
              href="/contact?sujet=devis"
              className="inline-flex items-center gap-3 bg-vsonus-red text-white font-bold uppercase tracking-widest px-12 py-5 text-lg hover:shadow-glow-red-hover transition-shadow duration-200"
            >
              Discuter de mon projet
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="square" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

    </main>
  )
}
