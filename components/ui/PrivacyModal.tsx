'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface PrivacyModalProps {
  open: boolean
  onClose: () => void
}

export function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const modal = (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Modal — plein écran mobile, centré desktop */}
      <div
        className="relative w-full h-full md:max-w-3xl md:max-h-[85vh] md:h-auto bg-vsonus-dark border-t-2 border-vsonus-red md:border md:border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — toujours visible */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-800 bg-vsonus-dark">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Politique de confidentialité
          </h2>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-2 py-1"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Fermer</span>
          </button>
        </div>

        {/* Body — seul élément scrollable. min-h-0 indispensable pour que overflow-y-auto fonctionne dans un flex. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 md:px-6 py-5 space-y-6 text-sm text-gray-400 leading-relaxed">
          <p className="text-xs text-gray-600">V-Sonus – Paul Villommet · Rue des Bosquets 17, 1800 Vevey, Suisse</p>

          <section>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">1. Responsable du traitement</h3>
            <p>
              V-Sonus – Paul Villommet<br />
              Rue des Bosquets 17, 1800 Vevey, Suisse<br />
              E-mail : <a href="mailto:info@vsonus.ch" className="text-vsonus-red hover:underline">info@vsonus.ch</a><br />
              Tél. : +41 79 651 21 14
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">2. Base légale</h3>
            <p>
              Le traitement des données personnelles est régi par la{' '}
              <span className="text-white font-semibold">nouvelle Loi fédérale sur la protection des données (nLPD, RS 235.1)</span>,
              en vigueur depuis le 1er septembre 2023. Ces dispositions s&apos;appliquent à l&apos;ensemble
              des traitements effectués par V-Sonus.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">3. Données collectées</h3>
            <p>Dans le cadre des formulaires de contact et de demande de devis/réservation, nous collectons :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Nom et prénom</li>
              <li>Adresse e-mail</li>
              <li>Numéro de téléphone</li>
              <li>Adresse du lieu de l&apos;événement</li>
              <li>Informations complémentaires librement saisies (notes, besoins spécifiques)</li>
            </ul>
            <p className="mt-3">Aucune donnée sensible au sens de l&apos;art. 5 let. c nLPD n&apos;est collectée.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">4. Finalités du traitement</h3>
            <p>Les données sont collectées et traitées exclusivement pour :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Traitement et réponse aux demandes de devis</li>
              <li>Gestion et confirmation des réservations de matériel</li>
              <li>Communication relative à la prestation contractuelle</li>
              <li>Respect des obligations légales et comptables</li>
            </ul>
            <p className="mt-3">Les données ne sont jamais revendues à des tiers ni utilisées à des fins publicitaires.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">5. Hébergement et transfert à l&apos;étranger</h3>
            <p>
              Le site et les données sont hébergés en Suisse par{' '}
              <span className="text-white font-semibold">Infomaniak Network SA</span>,
              Rue Eugène-Marziano 25, 1227 Les Acacias, Genève — prestataire certifié ISO 27001,
              soumis au droit suisse. Aucun transfert de données personnelles vers un pays étranger
              n&apos;est effectué.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">6. Durée de conservation</h3>
            <p>
              Les données sont conservées pour la durée de la relation contractuelle, puis archivées
              pendant <span className="text-white font-semibold">10 ans</span> conformément aux
              obligations légales suisses (CO art. 958f et nLPD). Elles sont ensuite supprimées de
              manière sécurisée.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">7. Vos droits (nLPD)</h3>
            <p>Conformément à la nLPD, vous disposez des droits suivants :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
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
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">8. Cookies</h3>
            <p className="mb-2">
              Ce site utilise des cookies répartis en quatre catégories. Vous pouvez gérer vos préférences
              à tout moment via le lien «&nbsp;Gérer mes cookies&nbsp;» en pied de page.
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li><span className="text-white font-semibold">Nécessaires</span> (toujours actifs) — Session, panier, consentement.</li>
              <li><span className="text-white font-semibold">Fonctionnels</span> — Assistant virtuel Max (chatbot).</li>
              <li><span className="text-white font-semibold">Analytiques</span> — Google Analytics, Hotjar.</li>
              <li><span className="text-white font-semibold">Marketing</span> — Google Ads.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">9. Autorité de surveillance</h3>
            <p>
              En cas de litige relatif au traitement de vos données personnelles, vous pouvez vous
              adresser au{' '}
              <span className="text-white font-semibold">Préposé fédéral à la protection des données et à la transparence (PFPDT)</span>,
              Feldeggweg 1, 3003 Berne —{' '}
              <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" className="text-vsonus-red hover:underline">www.edoeb.admin.ch</a>.
            </p>
          </section>

          <p className="text-xs text-gray-600 border-t border-gray-800 pt-4">
            Document mis à jour en 2025 — conforme à la nLPD (RS 235.1), en vigueur depuis le 1er septembre 2023.
          </p>
        </div>

        {/* Footer — toujours visible */}
        <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 border-t border-gray-800 bg-vsonus-dark">
          <button
            onClick={onClose}
            className="w-full border border-gray-700 text-gray-400 font-bold uppercase tracking-widest text-xs py-3 hover:border-white hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}
