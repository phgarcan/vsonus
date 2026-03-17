import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { HeroVideo } from '@/components/home/HeroVideo'
import { Sliders, Zap, Shield, Users } from 'lucide-react'

// ─── Données statiques ────────────────────────────────────────────────────────

const PACKS = [
  { label: 'Sonorisation L-Acoustics', href: '/catalogue?categorie=sonorisation', img: '/images/packs/photo_2024-12-04-13.01.55.jpeg' },
  { label: 'Éclairage',                href: '/catalogue?categorie=eclairage',    img: '/images/packs/DSC01638.jpg' },
  { label: 'DJ',                       href: '/catalogue?categorie=dj',           img: '/images/packs/image-7.jpeg' },
  { label: 'Scènes',                   href: '/catalogue?categorie=scenes',       img: '/images/packs/compressed_DSC09688.jpg' },
  { label: 'Concerts',                 href: '/catalogue?categorie=concerts',     img: '/images/packs/compressed_DSC09742.jpg' },
  { label: 'Mapping',                  href: '/catalogue?categorie=mapping',      img: '/images/packs/mapping.jpg' },
]

const VALEURS = [
  { label: 'Sur-mesure',  desc: 'Chaque projet est unique — nous adaptons nos solutions à vos besoins.',       Icon: Sliders },
  { label: 'Innovation',  desc: 'Des équipements de dernière génération pour des résultats à la pointe.',      Icon: Zap },
  { label: 'Fiabilité',   desc: 'Matériel testé, équipe rodée, zéro surprise le jour J.',                      Icon: Shield },
  { label: 'Synergie',    desc: 'Une équipe soudée qui collabore avec vous tout au long de votre événement.', Icon: Users },
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

const INSTAGRAM = [
  { img: '/images/instagram/DSC01679.jpg' },
  { img: '/images/instagram/DSC01634.jpg' },
  { img: '/images/instagram/compressed_DSC09716.jpg' },
  { img: '/images/instagram/compressed_DSC09739.jpg' },
  { img: '/images/instagram/compressed_DSC09692.jpg' },
  { img: '/images/instagram/DSC01591.jpg' },
  { img: '/images/instagram/photo_2024-12-04-13.01.57.jpeg' },
  { img: '/images/instagram/DSC01562.jpg' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[600px] text-center px-4 sm:px-6 py-28 overflow-hidden bg-vsonus-black border-b-2 border-vsonus-red">
        {/* Vidéo de fond avec parallax */}
        <HeroVideo />

        {/* Overlay sombre */}
        <div aria-hidden className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <AnimateOnScroll delay={0}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Des solutions clé en main pour tous
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={150}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-widest text-white leading-tight">
              Vos événements
              <br />
              <span className="text-vsonus-red">réussis</span> et sans stress
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={300}>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Sonorisation, éclairage, scène, mapping. Chaque pack sur-mesure permet une gestion en
              toute simplicité. Réservez en ligne ou demandez un devis personnalisé.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={450}>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/catalogue"
                className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-10 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
              >
                Découvrir nos packs
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white font-bold uppercase tracking-widest px-10 py-4 hover:border-vsonus-red hover:text-vsonus-red transition-colors duration-200"
              >
                Demander un devis
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── 2. NOS PACKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black uppercase tracking-widest text-white">Nos packs</h2>
              <p className="mt-3 text-gray-400">
                Louez nos équipements de qualité pour un événement réussi.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PACKS.map(({ label, href, img }, i) => (
              <AnimateOnScroll key={href} delay={i * 100}>
                <Link
                  href={href}
                  className="group relative block overflow-hidden aspect-[4/3] bg-vsonus-black"
                >
                  {/* Image */}
                  <Image
                    src={img}
                    alt={label}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/55 group-hover:bg-black/30 transition-colors duration-500" />
                  {/* Label */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-0">
                    <span className="block text-sm font-black uppercase tracking-widest text-white group-hover:text-vsonus-red transition-colors duration-300 leading-tight">
                      {label}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-gray-400 group-hover:text-white transition-colors duration-300 font-bold uppercase tracking-wider">
                      Voir le catalogue
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll delay={200}>
            <div className="mt-10 text-center">
              <Link
                href="/prestations"
                className="inline-flex items-center gap-2 border-2 border-vsonus-red text-vsonus-red font-bold uppercase tracking-widest px-8 py-3 hover:bg-vsonus-red hover:text-white transition-colors duration-200"
              >
                Voir tous nos packs
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── 3. POURQUOI NOUS CHOISIR ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Texte + valeurs gauche */}
            <div>
              <AnimateOnScroll>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                  Pourquoi nous choisir
                </p>
                <h2 className="text-4xl font-black uppercase tracking-widest text-white leading-tight mb-6">
                  L&apos;expertise
                  <br />au service de votre événement
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Avec des années d&apos;expertise dans l&apos;événementiel, notre équipe vous
                  accompagne pour créer des événements uniques. Un service personnalisé, des
                  équipements de pointe et une réactivité exemplaire vous garantissent le succès de
                  vos projets.
                </p>
              </AnimateOnScroll>

              <div className="grid grid-cols-2 gap-px bg-gray-800">
                {VALEURS.map(({ label, desc, Icon }, i) => (
                  <AnimateOnScroll key={label} delay={i * 100}>
                    <div className="bg-vsonus-black p-6 flex flex-col gap-3">
                      <Icon className="w-7 h-7 text-vsonus-red" strokeWidth={1.5} />
                      <span className="text-sm font-bold uppercase tracking-widest text-white">
                        {label}
                      </span>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>

              <AnimateOnScroll delay={100}>
                <Link
                  href="/a-propos"
                  className="mt-8 inline-block border-2 border-vsonus-red text-vsonus-red font-bold uppercase tracking-widest px-8 py-3 hover:bg-vsonus-red hover:text-white transition-colors duration-200"
                >
                  En savoir plus
                </Link>
              </AnimateOnScroll>
            </div>

            {/* Image droite */}
            <AnimateOnScroll>
              <div className="relative aspect-[4/5] w-full overflow-hidden border-2 border-vsonus-red">
                <Image
                  src="/images/im2.png"
                  alt="V-Sonus en action"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── 4. TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
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
                  {/* Grand guillemet décoratif */}
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
                      <p className="text-vsonus-red text-xs uppercase tracking-widest mt-0.5">
                        {context}
                      </p>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. INSTAGRAM ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Instagram
              </p>
              <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                Nouveautés
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            {INSTAGRAM.map(({ img }, i) => (
              <AnimateOnScroll key={img} delay={i * 60}>
                <a
                  href="https://www.instagram.com/vsoonus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden bg-vsonus-dark"
                >
                  <Image
                    src={img}
                    alt={`V-Sonus événement ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                    >
                      <rect x="2" y="2" width="20" height="20" />
                      <circle cx="12" cy="12" r="5" />
                      <rect x="16.5" y="5.5" width="1" height="1" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                </a>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll delay={200}>
            <div className="mt-10 text-center">
              <a
                href="https://www.instagram.com/vsoonus/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border-2 border-gray-700 text-gray-400 font-bold uppercase tracking-widest px-8 py-3 hover:border-vsonus-red hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <rect x="2" y="2" width="20" height="20" />
                  <circle cx="12" cy="12" r="5" />
                  <rect x="16.5" y="5.5" width="1" height="1" fill="currentColor" stroke="none" />
                </svg>
                Voir plus sur Instagram
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── 6. CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-vsonus-dark border-b-2 border-vsonus-red">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Besoin d&apos;une solution sur-mesure ?
            </p>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white mb-6">
              Demander un devis
            </h2>
            <p className="text-gray-400 leading-relaxed mb-10">
              Nous élaborons des offres personnalisées adaptées à vos besoins. Remplissez notre
              formulaire pour obtenir un devis gratuit et sans engagement.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={150}>
            <Link
              href="/contact?sujet=devis"
              className="inline-flex items-center gap-2 bg-vsonus-red text-white font-bold uppercase tracking-widest px-12 py-5 text-lg hover:shadow-glow-red-hover transition-shadow duration-200"
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
