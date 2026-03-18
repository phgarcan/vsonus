import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { ContactForm } from './ContactForm'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'Contact – Devis Gratuit',
  description: "Contactez V-Sonus pour un devis gratuit : location sono, éclairage et scènes en Suisse Romande. Réponse sous 24h.",
  openGraph: {
    title: 'Contact | V-Sonus – Devis Gratuit',
    description: 'Demandez un devis gratuit pour la location de matériel événementiel en Suisse Romande.',
    url: 'https://vsonus.ch/contact',
  },
  alternates: { canonical: 'https://vsonus.ch/contact' },
}

const INFOS = [
  {
    Icon: MapPin,
    label: 'Adresse',
    primary: 'Rue des Bosquets 17',
    secondary: '1800 Vevey, Suisse',
    href: 'https://maps.google.com/?q=Rue+des+Bosquets+17,+1800+Vevey',
  },
  {
    Icon: Phone,
    label: 'Téléphone',
    primary: '+41 79 651 21 14',
    secondary: null,
    href: 'tel:+41796512114',
  },
  {
    Icon: Mail,
    label: 'Email',
    primary: 'info@vsonus.ch',
    secondary: null,
    href: 'mailto:info@vsonus.ch',
  },
  {
    Icon: Clock,
    label: 'Horaires',
    primary: 'Lundi – Vendredi, 9h – 18h',
    secondary: null,
    href: null,
  },
]

export default function ContactPage() {
  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-end min-h-[45vh] overflow-hidden border-b-2 border-vsonus-red">
        <Image
          src="/images/instagram/DSC01679.jpg"
          alt="V-Sonus – Contact"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-14 pt-32 w-full">
          <AnimateOnScroll>
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span className="text-gray-600">/</span>
              <span className="text-vsonus-red">Contact</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
              Parlons de votre projet
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-widest text-white leading-tight">
              Contact
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl leading-relaxed">
              Notre équipe est à votre disposition pour répondre à vos questions et vous accompagner dans votre projet.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CONTENU PRINCIPAL ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-vsonus-black">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">

          {/* Colonne gauche — Formulaire */}
          <div>
            <AnimateOnScroll>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                Formulaire
              </p>
              <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-8">
                Parlons de votre<br />
                <span className="text-vsonus-red">événement</span>
              </h2>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <Suspense>
                <ContactForm />
              </Suspense>
            </AnimateOnScroll>
          </div>

          {/* Colonne droite — Infos + carte */}
          <div className="flex flex-col gap-10">

            {/* Coordonnées */}
            <AnimateOnScroll delay={100}>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-6">
                  Nos coordonnées
                </p>
                <div className="flex flex-col gap-3">
                  {INFOS.map(({ Icon, label, primary, secondary, href }) => {
                    const inner = (
                      <>
                        <div className="w-10 h-10 bg-vsonus-black border border-vsonus-red flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-vsonus-red" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                          <p className="text-white font-bold text-sm group-hover:text-vsonus-red transition-colors">
                            {primary}
                          </p>
                          {secondary && (
                            <p className="text-gray-500 text-xs">{secondary}</p>
                          )}
                        </div>
                      </>
                    )

                    return href ? (
                      <a
                        key={label}
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="group flex items-start gap-4 p-4 bg-vsonus-dark border border-gray-800 hover:border-vsonus-red transition-colors duration-300"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div key={label} className="flex items-start gap-4 p-4 bg-vsonus-dark border border-gray-800">
                        {inner}
                      </div>
                    )
                  })}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Carte Google Maps — Vevey */}
            <AnimateOnScroll delay={200}>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-4">
                  Localisation
                </p>
                <div className="relative overflow-hidden border border-gray-800 hover:border-vsonus-red transition-colors duration-300 h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2757.9!2d6.8434!3d46.4621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478e9f6a9f3d8a0d%3A0x1!2sRue%20des%20Bosquets%2017%2C%201800%20Vevey!5e0!3m2!1sfr!2sch!4v1700000000000!5m2!1sfr!2sch"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="V-Sonus — Rue des Bosquets 17, 1800 Vevey"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Intervention dans toute la Suisse Romande · Livraison et montage sur site.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </main>
  )
}
