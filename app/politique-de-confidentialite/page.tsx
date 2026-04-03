import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et traitement des données personnelles – V-Sonus, conforme à la nLPD (RS 235.1).',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://vsonus.ch/politique-de-confidentialite' },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-xs text-gray-600 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-gray-400">Politique de confidentialité</span>
      </nav>

      <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
        Politique de confidentialité
      </h1>
      <div className="w-12 h-1 bg-vsonus-red mb-10" />

      <div className="space-y-8 text-sm text-gray-400 leading-relaxed">

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">1. Responsable du traitement</h2>
          <p>
            V-Sonus – Paul Villommet<br />
            Rue des Bosquets 17, 1800 Vevey, Suisse<br />
            E-mail : <a href="mailto:info@vsonus.ch" className="text-vsonus-red hover:underline">info@vsonus.ch</a><br />
            Tél. : +41 79 651 21 14
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">2. Base légale</h2>
          <p>
            Le traitement des données personnelles est régi par la{' '}
            <span className="text-white font-semibold">nouvelle Loi fédérale sur la protection des données (nLPD, RS 235.1)</span>,
            en vigueur depuis le 1er septembre 2023. Ces dispositions s&apos;appliquent à l&apos;ensemble
            des traitements effectués par V-Sonus.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">3. Données collectées</h2>
          <p>
            Dans le cadre des formulaires de contact et de demande de devis/réservation, nous collectons :
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-400">
            <li>Nom et prénom</li>
            <li>Adresse e-mail</li>
            <li>Numéro de téléphone</li>
            <li>Adresse du lieu de l&apos;événement</li>
            <li>Informations complémentaires librement saisies (notes, besoins spécifiques)</li>
          </ul>
          <p className="mt-3">
            Aucune donnée sensible au sens de l&apos;art. 5 let. c nLPD n&apos;est collectée.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">4. Finalités du traitement</h2>
          <p>Les données sont collectées et traitées exclusivement pour :</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-400">
            <li>Traitement et réponse aux demandes de devis</li>
            <li>Gestion et confirmation des réservations de matériel</li>
            <li>Communication relative à la prestation contractuelle</li>
            <li>Respect des obligations légales et comptables</li>
          </ul>
          <p className="mt-3">
            Les données ne sont jamais revendues à des tiers ni utilisées à des fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">5. Hébergement et transfert à l&apos;étranger</h2>
          <p>
            Le site et les données sont hébergés en Suisse par{' '}
            <span className="text-white font-semibold">Infomaniak Network SA</span>,
            Rue Eugène-Marziano 25, 1227 Les Acacias, Genève — prestataire certifié ISO 27001,
            soumis au droit suisse. Aucun transfert de données personnelles vers un pays étranger
            n&apos;est effectué.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">6. Durée de conservation</h2>
          <p>
            Les données sont conservées pour la durée de la relation contractuelle, puis archivées
            pendant <span className="text-white font-semibold">10 ans</span> conformément aux
            obligations légales suisses (CO art. 958f et nLPD). Elles sont ensuite supprimées de
            manière sécurisée.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">7. Vos droits (nLPD)</h2>
          <p>Conformément à la nLPD, vous disposez des droits suivants :</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-400">
            <li><span className="text-white">Droit d&apos;accès</span> — connaître les données vous concernant</li>
            <li><span className="text-white">Droit de rectification</span> — corriger des données inexactes</li>
            <li><span className="text-white">Droit à l&apos;effacement</span> — demander la suppression de vos données</li>
            <li><span className="text-white">Droit à la portabilité</span> — recevoir vos données dans un format courant</li>
            <li><span className="text-white">Droit d&apos;opposition</span> — s&apos;opposer à certains traitements</li>
          </ul>
          <p className="mt-3">
            Pour exercer l&apos;un de ces droits, envoyez votre demande par e-mail à{' '}
            <a href="mailto:info@vsonus.ch" className="text-vsonus-red hover:underline">info@vsonus.ch</a>.
            Nous répondrons dans un délai de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">8. Cookies</h2>
          <p className="mb-3">
            Ce site utilise des cookies répartis en quatre catégories. Vous pouvez gérer vos préférences
            à tout moment via le lien «&nbsp;Gérer mes cookies&nbsp;» en pied de page.
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <span className="text-white font-semibold">Nécessaires</span> (toujours actifs) — Session,
              panier, préférences de consentement. Indispensables au fonctionnement du site.
            </li>
            <li>
              <span className="text-white font-semibold">Fonctionnels</span> — Assistant virtuel Max
              (chatbot). Permettent d&apos;interagir avec notre assistant en ligne.
            </li>
            <li>
              <span className="text-white font-semibold">Analytiques</span> — Google Analytics, Hotjar.
              Nous aident à comprendre comment vous utilisez le site afin d&apos;améliorer votre expérience.
            </li>
            <li>
              <span className="text-white font-semibold">Marketing</span> — Google Ads. Permettent de
              mesurer l&apos;efficacité de nos campagnes publicitaires.
            </li>
          </ul>
          <p className="mt-3">
            Le consentement est stocké dans un cookie 1<sup>ère</sup> partie (<span className="text-white font-semibold">vsonus_consent</span>)
            pour une durée de 12 mois.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">9. Autorité de surveillance</h2>
          <p>
            En cas de litige relatif au traitement de vos données personnelles, vous pouvez vous
            adresser au{' '}
            <span className="text-white font-semibold">Préposé fédéral à la protection des données et à la transparence (PFPDT)</span>,
            Feldeggweg 1, 3003 Berne — <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" className="text-vsonus-red hover:underline">www.edoeb.admin.ch</a>.
          </p>
        </section>

        <p className="text-xs text-gray-600 pt-4 border-t border-gray-800">
          Document mis à jour en 2025 — conforme à la nLPD (RS 235.1), en vigueur depuis le 1er septembre 2023.
        </p>
      </div>
    </main>
  )
}
