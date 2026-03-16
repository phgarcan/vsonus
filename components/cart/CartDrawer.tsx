'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { getImageUrl } from '@/lib/directus'
import type { Equipement } from '@/lib/directus'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

// Frais annexes codés en dur pour l'affichage temps réel dans le tiroir.
// Les valeurs réelles viennent de Directus au moment du checkout.
const FRAIS_TRANSPORT = { label: 'Transport – Fourgon', prix: 200 }
const FRAIS_MONTAGE   = { label: 'Montage / Démontage', prix: 400 }

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter()
  const drawerRef = useRef<HTMLDivElement>(null)

  const {
    cart,
    startDate,
    endDate,
    setDates,
    removeFromCart,
    updateQuantite,
    clearCart,
    getNbJours,
    getSousTotal,
    requiresTechnicien,
    requiresTransport,
  } = useStore()

  const nbJours    = getNbJours()
  const sousTotal  = getSousTotal()
  const needsTech  = requiresTechnicien()
  const needsTrans = requiresTransport()

  const fraisAnnexes =
    (needsTrans ? FRAIS_TRANSPORT.prix : 0) +
    (needsTech  ? FRAIS_MONTAGE.prix   : 0)

  const totalHT = sousTotal + fraisAnnexes

  // Fermeture sur clic en dehors du tiroir
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  // Bloquer le scroll du body quand le tiroir est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Fermeture sur touche Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Panneau tiroir */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ma sélection"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-vsonus-dark border-l-2 border-vsonus-red z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* En-tête du tiroir */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-black uppercase tracking-widest text-white">
            Ma sélection
            {cart.length > 0 && (
              <span className="ml-2 text-sm text-vsonus-red">({cart.reduce((a, i) => a + i.quantite, 0)} article{cart.reduce((a, i) => a + i.quantite, 0) > 1 ? 's' : ''})</span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="square" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

          {/* État vide */}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl text-gray-700 mb-4">♪</div>
              <p className="text-gray-500 text-sm">Votre sélection est vide.</p>
              <button onClick={onClose} className="mt-4 text-vsonus-red text-sm hover:underline">
                Parcourir le catalogue →
              </button>
            </div>
          ) : (
            <>
              {/* Liste articles */}
              <ul className="space-y-3">
                {cart.map((item) => {
                  const prix = item.type === 'equipement'
                    ? item.item.prix_journalier * nbJours
                    : item.item.prix_base
                  const imgUrl = item.type === 'equipement'
                    ? getImageUrl((item.item as Equipement).image, { width: '80', height: '80', fit: 'cover' })
                    : null

                  return (
                    <li key={`${item.type}-${item.item.id}`} className="flex gap-3 border-b border-gray-800 pb-3">
                      {/* Miniature */}
                      <div className="relative w-16 h-16 flex-shrink-0 bg-black border border-gray-800 overflow-hidden">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={item.item.nom} fill className="object-contain p-1" sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700 text-xl">♪</div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.item.nom}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.type === 'equipement' ? item.item.prix_journalier : item.item.prix_base} CHF
                          {item.type === 'equipement' && nbJours > 1 ? ` × ${nbJours}j` : ''}
                        </p>

                        {/* Contrôle quantité */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantite(item.item.id, item.type, item.quantite - 1)}
                            className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center hover:bg-vsonus-red text-sm font-bold transition-colors"
                          >−</button>
                          <span className="text-sm text-white w-4 text-center">{item.quantite}</span>
                          <button
                            onClick={() => updateQuantite(item.item.id, item.type, item.quantite + 1)}
                            className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center hover:bg-vsonus-red text-sm font-bold transition-colors"
                          >+</button>
                          <button
                            onClick={() => removeFromCart(item.item.id, item.type)}
                            className="ml-auto text-gray-700 hover:text-vsonus-red transition-colors text-xs"
                          >Supprimer</button>
                        </div>
                      </div>

                      {/* Sous-total ligne */}
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm font-bold text-white">{(prix * item.quantite).toFixed(2)}</span>
                        <span className="block text-xs text-gray-600">CHF</span>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* Dates de location */}
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
                      min={today}
                      onChange={(e) => setDates(e.target.value, endDate ?? e.target.value)}
                      className="w-full bg-vsonus-black border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-vsonus-red transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Fin</label>
                    <input
                      type="date"
                      value={endDate ?? ''}
                      min={startDate ?? today}
                      onChange={(e) => setDates(startDate ?? e.target.value, e.target.value)}
                      className="w-full bg-vsonus-black border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-vsonus-red transition-colors"
                    />
                  </div>
                </div>
                {startDate && endDate && (
                  <p className="text-xs text-gray-500">
                    Durée : <span className="text-white font-bold">{nbJours} jour{nbJours > 1 ? 's' : ''}</span>
                  </p>
                )}
              </div>

              {/* Frais annexes obligatoires */}
              {(needsTech || needsTrans) && (
                <div className="border border-vsonus-red p-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-vsonus-red">Frais obligatoires</p>
                  {needsTrans && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{FRAIS_TRANSPORT.label}</span>
                      <span className="text-white font-semibold">{FRAIS_TRANSPORT.prix} CHF</span>
                    </div>
                  )}
                  {needsTech && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{FRAIS_MONTAGE.label}</span>
                      <span className="text-white font-semibold">{FRAIS_MONTAGE.prix} CHF</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 pt-1">Les montants exacts seront confirmés dans votre devis.</p>
                </div>
              )}

              {/* Total */}
              <div className="space-y-1 border-t border-gray-800 pt-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Sous-total matériel</span>
                  <span>{sousTotal.toFixed(2)} CHF</span>
                </div>
                {fraisAnnexes > 0 && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Frais annexes (estimatif)</span>
                    <span>{fraisAnnexes.toFixed(2)} CHF</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-white text-lg pt-2 border-t border-gray-800 mt-1">
                  <span>TOTAL HT</span>
                  <span className="text-vsonus-red">{totalHT.toFixed(2)} CHF</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pied du tiroir — actions */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-800 space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!startDate || !endDate}
              onClick={() => { onClose(); router.push('/checkout') }}
            >
              Valider la pré-réservation →
            </Button>
            {(!startDate || !endDate) && (
              <p className="text-xs text-center text-gray-600">Sélectionnez vos dates pour continuer.</p>
            )}
            <button
              onClick={() => clearCart()}
              className="w-full text-xs text-gray-600 hover:text-vsonus-red transition-colors py-1"
            >
              Vider la sélection
            </button>
          </div>
        )}
      </div>
    </>
  )
}
