'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Music, Truck } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { getImageUrl, getPackPrixEffectif, isPromoActive } from '@/lib/directus'
import { getCoefficientLabel } from '@/lib/pricing'
import { FALLBACK_TRANSPORT_PRIX, FALLBACK_MONTAGE_PRIX } from '@/lib/pricing'
import { equipementHasLivraisonOption } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter()

  const {
    cart,
    startDate,
    endDate,
    setDates,
    removeFromCart,
    updateQuantite,
    clearCart,
    getNbJours,
    getSousTotalBrut,
    getSousTotal,
    getCoefficient,
    getFraisLivraison,
    getFraisDetail,
    requiresTechnicien,
    requiresTransport,
    tarifsAnnexes,
    livraisonChoix,
    setLivraisonChoix,
  } = useStore()

  const nbJours      = getNbJours()
  const sousTotalBrut = getSousTotalBrut()
  const sousTotal    = getSousTotal()       // brut × coefficient
  const coefficient  = getCoefficient()    // null = 6+ jours = sur demande
  const needsTech    = requiresTechnicien()
  const needsTrans   = requiresTransport()
  const fraisLivraison = getFraisLivraison()
  const fraisDetail = getFraisDetail()
  const hasPacks = cart.some((i) => i.type === 'pack')
  // Nombre de packs avec fourgon actif (pour le message info)
  const packsWithFourgon = cart.filter((i) => {
    if (i.type !== 'pack') return false
    const p = i.item as Pack
    const mode = p.mode_livraison ?? 'obligatoire'
    if (mode === 'retrait_uniquement' || (p.prix_fourgon ?? 0) === 0) return false
    if (mode === 'obligatoire') return true
    return (livraisonChoix[p.id] ?? 'retrait') === 'livraison'
  }).length

  const tarifTransport = tarifsAnnexes.find((t) => t.type === 'transport')
  const tarifMontage   = tarifsAnnexes.find((t) => t.type === 'montage')

  const fraisAnnexesEquip =
    (needsTrans ? (tarifTransport?.prix ?? FALLBACK_TRANSPORT_PRIX) : 0) +
    (needsTech  ? (tarifMontage?.prix ?? FALLBACK_MONTAGE_PRIX)   : 0)

  const totalHT = sousTotal + fraisLivraison + fraisAnnexesEquip

  // Sur demande = 6+ jours
  const isSurDemande = coefficient === null && (startDate !== null && endDate !== null)
  const canCheckout  = !isSurDemande && !!startDate && !!endDate

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const today = new Date().toISOString().split('T')[0]

  function handleStartDate(newStart: string) {
    const newEnd = endDate && endDate >= newStart ? endDate : newStart
    setDates(newStart, newEnd)
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Panneau */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ma liste"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-vsonus-dark border-l-2 border-vsonus-red z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-black uppercase tracking-widest text-white">
            Ma liste
            {cart.length > 0 && (
              <span className="ml-2 text-sm text-vsonus-red">
                ({cart.reduce((a, i) => a + i.quantite, 0)} article{cart.reduce((a, i) => a + i.quantite, 0) > 1 ? 's' : ''})
              </span>
            )}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1" aria-label="Fermer">
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
              <Music className="w-12 h-12 text-gray-700 mb-4" strokeWidth={1} />
              <p className="text-gray-400 text-sm">Votre liste est vide.</p>
              <Link href="/catalogue" onClick={onClose} className="mt-4 text-vsonus-red text-sm hover:underline">
                Parcourir le catalogue →
              </Link>
            </div>
          ) : (
            <>
              {/* Liste articles */}
              <ul className="space-y-3">
                {cart.map((item) => {
                  const isPack = item.type === 'pack'
                  const imgId = isPack
                    ? (item.item as Pack).image_principale
                    : (item.item as Equipement).image
                  const imgUrl = imgId
                    ? getImageUrl(imgId, { width: '80', height: '80', fit: 'cover' })
                    : null
                  const prixUnitaire = isPack ? getPackPrixEffectif(item.item as Pack) : (item.item as Equipement).prix_journalier
                  const packPromoActive = isPack && isPromoActive(item.item as Pack)

                  const pack = isPack ? (item.item as Pack) : null
                  const modeLivraison = pack?.mode_livraison ?? 'obligatoire'
                  const choixLivraison = pack ? (livraisonChoix[pack.id] ?? 'retrait') : null

                  return (
                    <li key={`${item.type}-${item.item.id}`} className="border-b border-gray-800 pb-3">
                      <div className="flex gap-3">
                        {/* Miniature */}
                        <div className="relative w-16 h-16 flex-shrink-0 bg-black border border-gray-800 overflow-hidden">
                          {imgUrl ? (
                            <Image src={imgUrl} alt={item.item.nom} fill className="object-contain p-1" sizes="64px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Music className="w-5 h-5 text-gray-700" strokeWidth={1} /></div>
                          )}
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.item.nom}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {packPromoActive && (
                              <span className="line-through mr-1">{(item.item as Pack).prix_base} CHF</span>
                            )}
                            <span className={packPromoActive ? 'text-vsonus-red font-bold' : ''}>{prixUnitaire} CHF / jour</span>
                          </p>

                          {/* Quantité + supprimer */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantite(item.item.id, item.type, item.quantite - 1)}
                              className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center hover:bg-vsonus-red text-sm font-bold transition-colors"
                              aria-label="Diminuer la quantité"
                            >−</button>
                            <span className="text-sm text-white w-4 text-center">{item.quantite}</span>
                            <button
                              onClick={() => updateQuantite(item.item.id, item.type, item.quantite + 1)}
                              className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center hover:bg-vsonus-red text-sm font-bold transition-colors"
                              aria-label="Augmenter la quantité"
                            >+</button>
                            <button
                              onClick={() => removeFromCart(item.item.id, item.type)}
                              className="ml-auto text-vsonus-red hover:text-red-400 transition-colors"
                              aria-label="Supprimer"
                            ><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        {/* Prix unitaire × quantite (1 jour) */}
                        <div className="flex-shrink-0 text-right">
                          <span className="text-sm font-bold text-white">{(prixUnitaire * item.quantite).toFixed(2)}</span>
                          <span className="block text-xs text-gray-600">CHF/j</span>
                        </div>
                      </div>

                      {/* Frais livraison/fourgon pour les packs */}
                      {isPack && pack && modeLivraison === 'obligatoire' && (
                        <div className="mt-2 ml-19 space-y-0.5">
                          {(pack.prix_livraison ?? 0) > 0 && (
                            <p className="text-xs text-gray-400 flex justify-between">
                              <span><Truck className="w-3 h-3 inline mr-1" />Livraison / Installation (1×)</span>
                              <span className="text-gray-300">{pack.prix_livraison} CHF</span>
                            </p>
                          )}
                          {(pack.prix_fourgon ?? 0) > 0 && (
                            <p className="text-xs text-gray-400 flex justify-between">
                              <span>Location fourgon (1×)</span>
                              <span className="text-gray-300">{pack.prix_fourgon} CHF</span>
                            </p>
                          )}
                        </div>
                      )}

                      {isPack && pack && modeLivraison === 'optionnel' && (
                        <div className="mt-2 ml-19">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setLivraisonChoix(pack.id, 'retrait')}
                              className={`text-xs px-2 py-1 border transition-colors ${
                                choixLivraison === 'retrait'
                                  ? 'border-vsonus-red text-white bg-vsonus-red/20'
                                  : 'border-gray-700 text-gray-500 hover:border-gray-500'
                              }`}
                            >
                              Retrait sur place (0.-)
                            </button>
                            <button
                              type="button"
                              onClick={() => setLivraisonChoix(pack.id, 'livraison')}
                              className={`text-xs px-2 py-1 border transition-colors ${
                                choixLivraison === 'livraison'
                                  ? 'border-vsonus-red text-white bg-vsonus-red/20'
                                  : 'border-gray-700 text-gray-500 hover:border-gray-500'
                              }`}
                            >
                              Livraison ({pack.prix_livraison ?? 0} CHF)
                            </button>
                          </div>
                          {choixLivraison === 'livraison' && (pack.prix_fourgon ?? 0) > 0 && (
                            <p className="text-xs text-gray-400 mt-1 flex justify-between">
                              <span>Location fourgon (1×)</span>
                              <span className="text-gray-300">{pack.prix_fourgon} CHF</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Retrait/livraison pour équipements éclairage */}
                      {!isPack && equipementHasLivraisonOption(item.item as Equipement) && (
                        <div className="mt-2 ml-19">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setLivraisonChoix(`equip-${item.item.id}`, 'retrait')}
                              className={`text-xs px-2 py-1 border transition-colors ${
                                (livraisonChoix[`equip-${item.item.id}`] ?? 'retrait') === 'retrait'
                                  ? 'border-vsonus-red text-white bg-vsonus-red/20'
                                  : 'border-gray-700 text-gray-500 hover:border-gray-500'
                              }`}
                            >
                              Retrait sur place (0.-)
                            </button>
                            <button
                              type="button"
                              onClick={() => setLivraisonChoix(`equip-${item.item.id}`, 'livraison')}
                              className={`text-xs px-2 py-1 border transition-colors ${
                                (livraisonChoix[`equip-${item.item.id}`] ?? 'retrait') === 'livraison'
                                  ? 'border-vsonus-red text-white bg-vsonus-red/20'
                                  : 'border-gray-700 text-gray-500 hover:border-gray-500'
                              }`}
                            >
                              Livraison ({(item.item as Equipement).prix_livraison} CHF)
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              {/* Dates de location */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-vsonus-red">
                  Dates de location
                </h3>

                <DatePicker label="Début" value={startDate} min={today} onChange={handleStartDate} />

                {startDate && endDate && (
                  <p className="text-xs text-center text-gray-400 py-0.5">
                    ↕{' '}
                    <span className="text-white font-bold">{nbJours} jour{nbJours > 1 ? 's' : ''}</span>
                    {coefficient !== null && nbJours > 1 && (
                      <span className="text-vsonus-red font-bold ml-1">({getCoefficientLabel(nbJours)})</span>
                    )}
                    {isSurDemande && (
                      <span className="text-yellow-500 font-bold ml-1">— Sur demande</span>
                    )}
                  </p>
                )}

                <DatePicker
                  label="Fin"
                  value={endDate}
                  min={startDate ?? today}
                  onChange={(d) => setDates(startDate ?? d, d)}
                />
              </div>

              {/* Avertissement 6+ jours */}
              {isSurDemande && (
                <div className="flex gap-2 border border-yellow-600/50 bg-yellow-600/10 p-3">
                  <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="square" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="text-xs text-yellow-400 leading-relaxed">
                    Pour une location de plus de 5 jours, contactez-nous pour un tarif personnalisé.{' '}
                    <Link href="/contact" onClick={onClose} className="underline hover:text-yellow-300">Nous contacter →</Link>
                  </p>
                </div>
              )}

              {/* Avertissement L-Acoustics / levage — masqué si un pack est présent */}
              {!isSurDemande && !hasPacks && cart.some((i) => i.type === 'equipement' && (i.item as Equipement).technicien_obligatoire) && (
                <div className="flex gap-2 border border-yellow-600/50 bg-yellow-600/10 p-3">
                  <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="square" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="text-xs text-yellow-400 leading-relaxed">
                    Les enceintes L-Acoustics et le matériel de levage nécessitent obligatoirement la livraison et l&apos;installation par un technicien.
                  </p>
                </div>
              )}

              {/* Frais annexes obligatoires (équipements uniquement — pas de doublon avec frais packs) */}
              {!isSurDemande && (needsTech || needsTrans) && (
                <div className="border border-vsonus-red p-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-vsonus-red">Frais obligatoires (équipements)</p>
                  {needsTrans && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{tarifTransport?.label ?? 'Transport – Fourgon'}</span>
                      <span className="text-white font-semibold">{(tarifTransport?.prix ?? FALLBACK_TRANSPORT_PRIX)} CHF</span>
                    </div>
                  )}
                  {needsTech && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{tarifMontage?.label ?? 'Montage / Démontage'}</span>
                      <span className="text-white font-semibold">{(tarifMontage?.prix ?? FALLBACK_MONTAGE_PRIX)} CHF</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 pt-1">Les montants exacts seront confirmés dans votre devis.</p>
                </div>
              )}

              {/* Détail tarifaire */}
              {!isSurDemande && (
                <div className="space-y-1.5 border-t border-gray-800 pt-3">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Location matériel (1 j)</span>
                    <span>{sousTotalBrut.toFixed(2)} CHF</span>
                  </div>
                  {coefficient !== null && coefficient !== 1 && (
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>
                        Coefficient {nbJours} jour{nbJours > 1 ? 's' : ''}
                        <span className="text-vsonus-red font-bold ml-1">{getCoefficientLabel(nbJours)}</span>
                      </span>
                      <span className="text-white font-semibold">{sousTotal.toFixed(2)} CHF</span>
                    </div>
                  )}
                  {fraisDetail.livraison > 0 && (
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Livraison et installation (1×)</span>
                      <span>{fraisDetail.livraison.toFixed(2)} CHF</span>
                    </div>
                  )}
                  {fraisDetail.fourgon > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Location fourgon et essence (1×)</span>
                        <span>{fraisDetail.fourgon.toFixed(2)} CHF</span>
                      </div>
                      {packsWithFourgon > 1 && (
                        <p className="text-xs text-gray-400 italic">Un seul fourgon pour l&apos;ensemble de vos packs</p>
                      )}
                    </>
                  )}
                  {fraisAnnexesEquip > 0 && (
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Frais annexes équipements</span>
                      <span>{fraisAnnexesEquip.toFixed(2)} CHF</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-white text-lg pt-2 border-t border-gray-800 mt-1">
                    <span>TOTAL HT</span>
                    <span className="text-vsonus-red">{totalHT.toFixed(2)} CHF</span>
                  </div>
                </div>
              )}

              {isSurDemande && (
                <div className="border-t border-gray-800 pt-3 text-center text-sm text-yellow-500 font-semibold">
                  Tarif sur demande pour {nbJours} jours
                </div>
              )}
            </>
          )}
        </div>

        {/* Pied du tiroir */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-800 space-y-3">
            {isSurDemande ? (
              <Link
                href="/contact?sujet=devis"
                onClick={onClose}
                className="flex items-center justify-center w-full bg-yellow-600 text-white font-bold uppercase tracking-widest text-sm py-3 hover:bg-yellow-700 transition-colors"
              >
                Demander un tarif personnalisé →
              </Link>
            ) : (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canCheckout}
                onClick={() => { onClose(); router.push('/checkout') }}
              >
                Valider la pré-réservation →
              </Button>
            )}
            {!isSurDemande && !canCheckout && (
              <p className="text-xs text-center text-gray-600">Sélectionnez vos dates pour continuer.</p>
            )}
            <button
              onClick={() => clearCart()}
              className="w-full text-xs text-gray-600 hover:text-vsonus-red transition-colors py-1"
            >
              Vider la liste
            </button>
          </div>
        )}
      </div>
    </>
  )
}
