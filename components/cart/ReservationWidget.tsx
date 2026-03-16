'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import type { TarifAnnexe } from '@/lib/directus'

interface ReservationWidgetProps {
  /** Tarifs annexes pré-chargés côté serveur et transmis au widget client */
  tarifsAnnexes: TarifAnnexe[]
}

export function ReservationWidget({ tarifsAnnexes }: ReservationWidgetProps) {
  const router = useRouter()
  const {
    cart,
    startDate,
    endDate,
    setDates,
    removeFromCart,
    updateQuantite,
    getNbJours,
    getSousTotal,
    requiresTechnicien,
    requiresTransport,
  } = useStore()

  const nbJours = getNbJours()
  const sousTotal = getSousTotal()
  const needsTech = requiresTechnicien()
  const needsTransport = requiresTransport()

  // Tarifs annexes applicables selon les règles métier
  const fraisTransport = tarifsAnnexes.find((t) => t.type === 'transport')
  const fraisMontage = tarifsAnnexes.find((t) => t.type === 'montage')

  const totalFraisAnnexes =
    (needsTransport && fraisTransport ? fraisTransport.prix : 0) +
    (needsTech && fraisMontage ? fraisMontage.prix : 0)

  const totalHT = sousTotal + totalFraisAnnexes

  return (
    <aside className="w-full bg-vsonus-dark border border-gray-800 p-6 space-y-6">
      <h2 className="text-lg font-black uppercase tracking-widest text-white border-b-2 border-vsonus-red pb-3">
        Mon projet
      </h2>

      {/* Sélecteur de dates */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red">
          Dates de location
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Début</label>
            <input
              type="date"
              value={startDate ?? ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDates(e.target.value, endDate ?? e.target.value)}
              className="w-full bg-vsonus-black border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-vsonus-red"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Fin</label>
            <input
              type="date"
              value={endDate ?? ''}
              min={startDate ?? new Date().toISOString().split('T')[0]}
              onChange={(e) => setDates(startDate ?? e.target.value, e.target.value)}
              className="w-full bg-vsonus-black border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-vsonus-red"
            />
          </div>
        </div>
        {startDate && endDate && (
          <p className="text-xs text-gray-400">
            Durée : <span className="text-white font-bold">{nbJours} jour{nbJours > 1 ? 's' : ''}</span>
          </p>
        )}
      </div>

      {/* Liste du panier */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red">
          Matériel sélectionné
        </h3>

        {cart.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Aucun article ajouté.</p>
        ) : (
          <ul className="space-y-2">
            {cart.map((item) => {
              const prix =
                item.type === 'equipement'
                  ? item.item.prix_journalier * nbJours
                  : item.item.prix_base
              return (
                <li
                  key={`${item.type}-${item.item.id}`}
                  className="flex items-center justify-between gap-3 border-b border-gray-800 pb-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.item.nom}</p>
                    <p className="text-xs text-gray-500">
                      {prix.toFixed(2)} CHF × {item.quantite}
                      {item.type === 'equipement' && nbJours > 1 && (
                        <span className="ml-1">({nbJours}j)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQuantite(item.item.id, item.type, item.quantite - 1)}
                      className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center hover:bg-vsonus-red text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="text-sm text-white w-4 text-center">{item.quantite}</span>
                    <button
                      onClick={() => updateQuantite(item.item.id, item.type, item.quantite + 1)}
                      className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center hover:bg-vsonus-red text-sm font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.item.id, item.type)}
                      className="w-6 h-6 text-gray-600 hover:text-vsonus-red transition-colors ml-1"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Frais annexes dynamiques */}
      {(needsTransport || needsTech) && (
        <div className="space-y-2 border border-vsonus-red p-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red">
            Frais obligatoires
          </h3>
          {needsTransport && fraisTransport && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{fraisTransport.label}</span>
              <span className="text-white font-semibold">{fraisTransport.prix.toFixed(2)} CHF</span>
            </div>
          )}
          {needsTech && fraisMontage && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{fraisMontage.label}</span>
              <span className="text-white font-semibold">{fraisMontage.prix.toFixed(2)} CHF</span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Le matériel sélectionné requiert une livraison et/ou installation par un technicien V-Sonus.
          </p>
        </div>
      )}

      {/* Sous-total */}
      {cart.length > 0 && (
        <div className="space-y-1 border-t border-gray-800 pt-3">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Sous-total matériel</span>
            <span>{sousTotal.toFixed(2)} CHF</span>
          </div>
          {totalFraisAnnexes > 0 && (
            <div className="flex justify-between text-sm text-gray-400">
              <span>Frais annexes</span>
              <span>{totalFraisAnnexes.toFixed(2)} CHF</span>
            </div>
          )}
          <div className="flex justify-between font-black text-white text-base pt-1 border-t border-gray-800 mt-1">
            <span>TOTAL HT</span>
            <span className="text-vsonus-red">{totalHT.toFixed(2)} CHF</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={cart.length === 0 || !startDate || !endDate}
        onClick={() => router.push('/checkout')}
      >
        Demander un devis
      </Button>

      {(!startDate || !endDate) && cart.length > 0 && (
        <p className="text-xs text-center text-gray-500">Veuillez sélectionner vos dates pour continuer.</p>
      )}
    </aside>
  )
}
