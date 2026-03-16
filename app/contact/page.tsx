import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact – V-Sonus',
  description: 'Contactez l\'équipe V-Sonus pour toute demande de location de matériel son, lumière et scène en Suisse Romande.',
}

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">

      {/* En-tête */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-2">Contactez-nous</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white leading-tight">
          Parlons de votre<br /><span className="text-vsonus-red">événement</span>
        </h1>
        <div className="mt-4 h-0.5 w-20 bg-vsonus-red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Colonne gauche : formulaire */}
        <div>
          <ContactForm />
        </div>

        {/* Colonne droite : infos + carte */}
        <div className="space-y-8">

          {/* Informations de contact */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Nos coordonnées</h2>

            <a
              href="tel:+41000000000"
              className="flex items-start gap-4 p-4 bg-vsonus-dark border border-gray-800 hover:border-vsonus-red transition-colors group"
            >
              <div className="w-10 h-10 bg-vsonus-black border border-vsonus-red flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-vsonus-red" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Téléphone</p>
                <p className="text-white font-bold group-hover:text-vsonus-red transition-colors">+41 (0) 00 000 00 00</p>
              </div>
            </a>

            <a
              href="mailto:info@vsonus.ch"
              className="flex items-start gap-4 p-4 bg-vsonus-dark border border-gray-800 hover:border-vsonus-red transition-colors group"
            >
              <div className="w-10 h-10 bg-vsonus-black border border-vsonus-red flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-vsonus-red" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-white font-bold group-hover:text-vsonus-red transition-colors">info@vsonus.ch</p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-4 bg-vsonus-dark border border-gray-800">
              <div className="w-10 h-10 bg-vsonus-black border border-vsonus-red flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-vsonus-red" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Adresse</p>
                <p className="text-white font-bold">Suisse Romande</p>
                <p className="text-gray-400 text-sm">Genève & environs</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-vsonus-dark border border-gray-800">
              <div className="w-10 h-10 bg-vsonus-black border border-vsonus-red flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-vsonus-red" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Disponibilité</p>
                <p className="text-white font-bold">Lun – Ven : 9h – 18h</p>
                <p className="text-gray-400 text-sm">Urgences 7j/7 pour les événements en cours</p>
              </div>
            </div>
          </div>

          {/* Carte Google Maps */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-4">Zone d'intervention</h2>
            <div className="relative overflow-hidden border border-gray-800 h-72">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d175484.77774764!2d6.019392!3d46.227638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478c65b60b010085%3A0x31e4c8cfe2c02202!2sGen%C3%A8ve%2C%20Suisse!5e0!3m2!1sfr!2sch!4v1700000000000!5m2!1sfr!2sch"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Zone d'intervention V-Sonus – Genève, Suisse Romande"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Intervention dans toute la Suisse Romande. Livraison et montage sur site.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
