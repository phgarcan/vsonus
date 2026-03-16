import Link from 'next/link'
import { Sliders, Lightbulb, Music2, MonitorPlay, Mic2, Projector, Star, Zap, Shield, Users } from 'lucide-react'

// ─── Données statiques ────────────────────────────────────────────────────────

const PACKS = [
  { label: 'Sonorisation L-Acoustics', href: '/catalogue?categorie=sonorisation', Icon: Sliders },
  { label: 'Éclairage',                href: '/catalogue?categorie=eclairage',    Icon: Lightbulb },
  { label: 'DJ',                       href: '/catalogue?categorie=dj',           Icon: Music2 },
  { label: 'Scènes',                   href: '/catalogue?categorie=scenes',       Icon: MonitorPlay },
  { label: 'Concerts',                 href: '/catalogue?categorie=concerts',     Icon: Mic2 },
  { label: 'Mapping',                  href: '/catalogue?categorie=mapping',      Icon: Projector },
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[600px] text-center px-6 py-28 overflow-hidden bg-vsonus-black border-b-2 border-vsonus-red">
        {/* Vidéo de fond */}
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay sombre */}
        <div aria-hidden className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
            Des solutions clé en main pour tous
          </p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest text-white leading-tight">
            Vos événements
            <br />
            <span className="text-vsonus-red">réussis</span> et sans stress
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Sonorisation, éclairage, scène, mapping. Chaque pack sur-mesure permet une gestion en
            toute simplicité. Réservez en ligne ou demandez un devis personnalisé.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
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
        </div>
      </section>

      {/* ── 2. NOS PACKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black uppercase tracking-widest text-white">Nos packs</h2>
            <p className="mt-3 text-gray-400">
              Louez nos équipements de qualité pour un événement réussi.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-800">
            {PACKS.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center justify-center gap-4 bg-vsonus-black p-10 text-center hover:bg-vsonus-dark transition-colors duration-200"
              >
                <Icon
                  className="w-10 h-10 text-vsonus-red group-hover:scale-110 transition-transform duration-200"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-bold uppercase tracking-widest text-white group-hover:text-vsonus-red transition-colors duration-200">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. POURQUOI NOUS CHOISIR ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Texte gauche */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Pourquoi nous choisir
              </p>
              <h2 className="text-4xl font-black uppercase tracking-widest text-white leading-tight mb-6">
                L&apos;expertise
                <br />au service de votre événement
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Avec des années d&apos;expertise dans l&apos;événementiel, notre équipe vous
                accompagne pour créer des événements uniques. Un service personnalisé, des
                équipements de pointe et une réactivité exemplaire vous garantissent le succès de
                vos projets.
              </p>
              <Link
                href="/a-propos"
                className="mt-8 inline-block border-2 border-vsonus-red text-vsonus-red font-bold uppercase tracking-widest px-8 py-3 hover:bg-vsonus-red hover:text-white transition-colors duration-200"
              >
                En savoir plus
              </Link>
            </div>

            {/* Grille valeurs */}
            <div className="grid grid-cols-2 gap-px bg-gray-800">
              {VALEURS.map(({ label, desc, Icon }) => (
                <div key={label} className="bg-vsonus-black p-6 flex flex-col gap-3">
                  <Icon className="w-7 h-7 text-vsonus-red" strokeWidth={1.5} />
                  <span className="text-sm font-bold uppercase tracking-widest text-white">
                    {label}
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-dark border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Témoignages
            </p>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-gray-800">
            {TEMOIGNAGES.map(({ name, context, text }) => (
              <div key={name} className="bg-vsonus-black p-8 flex flex-col gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-vsonus-red text-vsonus-red" />
                  ))}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="text-white font-bold text-sm uppercase tracking-widest">{name}</p>
                  {context && (
                    <p className="text-vsonus-red text-xs uppercase tracking-widest mt-0.5">
                      {context}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
