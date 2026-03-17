'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface CgvModalProps {
  open: boolean
  onClose: () => void
  onAccept?: () => void
}

export function CgvModal({ open, onClose, onAccept }: CgvModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  // Close on backdrop click
  function handleClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect()
    if (!rect) return
    const clickedInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    if (!clickedInside) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={onClose}
      className="w-full max-w-2xl max-h-[80vh] bg-vsonus-dark border border-gray-700 border-t-2 border-t-vsonus-red p-0 open:flex flex-col backdrop:bg-black/70 focus:outline-none m-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
        <h2 className="text-sm font-black uppercase tracking-widest text-white">
          Conditions générales de location
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors p-1"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-gray-400 leading-relaxed">
        <p className="text-xs text-gray-600">V-Sonus – Paul Villommet · Rue des Bosquets 17, 1800 Vevey, Suisse</p>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 1 — Définitions</h3>
          <ul className="space-y-1.5">
            <li><span className="text-white font-semibold">Bailleur :</span> V-Sonus – Paul Villommet, Rue des Bosquets 17, 1800 Vevey.</li>
            <li><span className="text-white font-semibold">Locataire :</span> toute personne physique ou morale qui loue du matériel auprès de V-Sonus.</li>
            <li><span className="text-white font-semibold">Matériel :</span> l&apos;ensemble des équipements événementiels mis à disposition par le bailleur.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 2 — Conditions à remplir</h3>
          <p>Le locataire doit être une personne physique <span className="text-white font-semibold">majeure (18 ans révolus)</span> ou une personne morale dûment représentée. Une pièce d&apos;identité valide peut être demandée. Toute réservation effectuée par un mineur est nulle.</p>
        </section>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 3 — Utilisation du matériel</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>Restituer le matériel dans l&apos;état d&apos;origine, propre et fonctionnel.</li>
            <li>Utiliser le matériel conformément à sa destination et aux instructions du bailleur.</li>
            <li>Ne pas sous-louer, prêter ou céder le matériel à un tiers sans accord écrit préalable.</li>
            <li>Signaler immédiatement toute panne, défectuosité ou dommage survenu pendant la location.</li>
            <li>Ne pas modifier, démonter ou réparer le matériel sans autorisation.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 4 — Durée et annulation</h3>
          <p>La durée débute à la remise du matériel et se termine à sa restitution complète.</p>
          <p className="mt-2"><span className="text-white font-semibold">Annulation gratuite</span> jusqu&apos;à <span className="text-white font-semibold">5 jours avant la date de l&apos;événement</span>. En deçà, le bailleur se réserve le droit de retenir tout ou partie de l&apos;acompte.</p>
          <p className="mt-2">Tout dépassement de durée sera facturé au tarif journalier en vigueur.</p>
        </section>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 5 — Prix et paiement</h3>
          <p>Le prix est établi selon le devis officiel. Le paiement intégral est dû <span className="text-white font-semibold">à la confirmation de la réservation</span>.</p>
          <p className="mt-2">Un <span className="text-white font-semibold">dépôt de garantie</span> peut être exigé (espèces ou Twint), restitué au retour du matériel en bon état.</p>
          <p className="mt-2">Tout retard entraîne des intérêts moratoires au taux légal suisse (5 % l&apos;an).</p>
        </section>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 6 — Responsabilité</h3>
          <p>Le locataire assume l&apos;entière responsabilité du matériel dès sa prise en charge. En cas de dommages, vol ou perte, il sera facturé au coût de réparation ou de remplacement.</p>
        </section>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 7 — Force majeure</h3>
          <p>Aucune partie ne saurait être tenue responsable d&apos;un manquement résultant d&apos;un cas de force majeure imprévisible et irrésistible.</p>
        </section>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 8 — Propriété</h3>
          <p>L&apos;intégralité du matériel reste la propriété exclusive de <span className="text-white font-semibold">Paul Villommet</span>. Toute tentative de vente ou mise en gage est interdite.</p>
        </section>

        <section>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Art. 9 — Données personnelles (nLPD)</h3>
          <p>Les données collectées sont traitées conformément à la nLPD (RS 235.1) et utilisées exclusivement pour la gestion contractuelle. Contact : <a href="mailto:info@vsonus.ch" className="text-vsonus-red hover:underline">info@vsonus.ch</a>.</p>
        </section>

        <p className="text-xs text-gray-600 border-t border-gray-800 pt-4">
          Droit applicable : droit suisse. Tribunaux compétents : canton de Vaud. — Document mis à jour en 2025.
        </p>
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-6 py-4 border-t border-gray-800 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-700 text-gray-400 font-bold uppercase tracking-widest text-xs py-3 hover:border-white hover:text-white transition-colors"
        >
          Fermer
        </button>
        {onAccept && (
          <button
            onClick={() => { onAccept(); onClose() }}
            className="flex-1 bg-vsonus-red text-white font-bold uppercase tracking-widest text-xs py-3 hover:bg-red-700 transition-colors"
          >
            J&apos;accepte
          </button>
        )}
      </div>
    </dialog>
  )
}
