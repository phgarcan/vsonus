'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { CgvModal } from '@/components/ui/CgvModal'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'
import { CompanySearch } from '@/components/ui/CompanySearch'
import { soumettreReservation } from '@/app/actions/reservation'
import { MapPin } from 'lucide-react'
import { getCoefficientLabel, FALLBACK_TRANSPORT_PRIX, FALLBACK_MONTAGE_PRIX } from '@/lib/pricing'
import { formatSwissPhone, formatDateEU } from '@/lib/utils'
import { equipementHasLivraisonOption } from '@/lib/directus'
import type { TarifAnnexe, Pack, Equipement } from '@/lib/directus'
import { getPackPrixEffectif } from '@/lib/directus'

import type { ParsedAddress } from '@/lib/address'

export interface InitialFormData {
  prenom: string
  nom: string
  email: string
  tel: string
  address: ParsedAddress
}

interface CheckoutFormProps {
  tarifsAnnexes: TarifAnnexe[]
  initialData?: InitialFormData | null
}

const inputCls = 'w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-vsonus-red transition-colors placeholder-gray-600'
const labelCls = 'block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1'

export function CheckoutForm({ tarifsAnnexes, initialData }: CheckoutFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const {
    cart,
    startDate,
    endDate,
    getNbJours,
    getSousTotalBrut,
    getSousTotal,
    getCoefficient,
    getFraisLivraison,
    getFraisDetail,
    requiresTechnicien,
    requiresTransport,
    clearCart,
    livraisonChoix,
  } = useStore()

  const nbJours       = getNbJours()
  const sousTotalBrut = getSousTotalBrut()
  const sousTotal     = getSousTotal()
  const coefficient   = getCoefficient()
  const besoinTech    = requiresTechnicien()
  const besoinTransport = requiresTransport()
  const fraisLivraison = getFraisLivraison()
  const fraisDetail = getFraisDetail()

  const isSurDemande = coefficient === null && !!startDate && !!endDate

  const fraisTransport = tarifsAnnexes.find((t) => t.type === 'transport')
  const fraisMontage   = tarifsAnnexes.find((t) => t.type === 'montage')

  const fraisAnnexesEquip =
    (besoinTransport ? (fraisTransport?.prix ?? FALLBACK_TRANSPORT_PRIX) : 0) +
    (besoinTech ? (fraisMontage?.prix ?? FALLBACK_MONTAGE_PRIX) : 0)

  const totalHT = sousTotal + fraisLivraison + fraisAnnexesEquip

  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [cgvOpen, setCgvOpen] = useState(false)
  const [billingSame, setBillingSame] = useState(true)
  const [createAccount, setCreateAccount] = useState(false)
  const [isEntreprise, setIsEntreprise] = useState(false)
  const [entreprise, setEntreprise] = useState({ nom_entreprise: '', numero_ide: '' })

  const [honeypot, setHoneypot] = useState('')

  const [form, setForm] = useState({
    prenom: initialData?.prenom ?? '',
    nom: initialData?.nom ?? '',
    email: initialData?.email ?? '',
    tel: initialData?.tel ?? '',
    rue: initialData?.address?.rue ?? '',
    npa: initialData?.address?.npa ?? '',
    ville: initialData?.address?.ville ?? '',
    pays: initialData?.address?.pays ?? 'Suisse',
    notes: '',
  })

  // L'utilisateur est connecté si on a reçu initialData (pré-remplissage serveur)
  const isConnecte = !!initialData

  const [billing, setBilling] = useState({
    billing_rue: '',
    billing_npa: '',
    billing_ville: '',
    billing_pays: 'Suisse',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleBillingChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await soumettreReservation({
        clientData: billingSame ? form : { ...form, ...billing },
        cartItems: cart,
        startDate: startDate!,
        endDate: endDate!,
        nbJours,
        totalHT,
        besoinMontage: besoinTech,
        besoinLivraison: besoinTransport,
        createAccount,
        est_entreprise: isEntreprise,
        nom_entreprise: isEntreprise ? entreprise.nom_entreprise : undefined,
        numero_ide: isEntreprise ? entreprise.numero_ide : undefined,
        honeypot,
        livraisonChoix,
      })

      if (result.success) {
        clearCart()
        const params = new URLSearchParams({ id: result.id })
        if (createAccount) {
          params.set('account', '1')
        } else {
          params.set('email', form.email)
          params.set('prenom', form.prenom)
          params.set('nom', form.nom)
        }
        router.push(`/confirmation?${params.toString()}`)
      } else {
        setError(result.error)
      }
    })
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Votre liste est vide.</p>
        <a href="/catalogue" className="mt-4 inline-block text-vsonus-red underline hover:no-underline">
          Retourner au catalogue
        </a>
      </div>
    )
  }

  const npaPattern = '[0-9]{4}'
  const npaTitle   = 'Code postal suisse (4 chiffres)'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* Formulaire client */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">

        {/* Honeypot anti-bot — invisible pour les humains */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {/* ── Coordonnées ──────────────────────────────────────────────── */}
        <h2 className="text-xl font-black uppercase tracking-widest text-white border-b-2 border-vsonus-red pb-3">
          Vos coordonnées
        </h2>

        {/* Bandeau pré-remplissage si connecté */}
        {isConnecte && (
          <div className="bg-vsonus-dark border-l-2 border-vsonus-red px-4 py-3 text-xs text-gray-400">
            Connecté en tant que <span className="text-white font-bold">{initialData!.email}</span> — vos
            coordonnées ont été pré-remplies depuis votre profil.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Prénom <span className="text-vsonus-red">*</span></label>
            <input
              type="text" name="prenom" value={form.prenom} onChange={handleChange}
              required className={inputCls} autoComplete="given-name"
            />
          </div>
          <div>
            <label className={labelCls}>Nom <span className="text-vsonus-red">*</span></label>
            <input
              type="text" name="nom" value={form.nom} onChange={handleChange}
              required className={inputCls} autoComplete="family-name"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Adresse e-mail <span className="text-vsonus-red">*</span></label>
          <input
            type="email" name="email" value={form.email} onChange={handleChange}
            required className={inputCls} autoComplete="email"
          />
        </div>

        <div>
          <label className={labelCls}>Téléphone <span className="text-vsonus-red">*</span></label>
          <input
            type="tel" name="tel" value={form.tel}
            onChange={(e) => setForm((prev) => ({ ...prev, tel: formatSwissPhone(e.target.value) }))}
            required placeholder="+41 79 XXX XX XX"
            className={inputCls} autoComplete="tel"
          />
        </div>

        {/* ── Entreprise (facultatif) ─────────────────────────────────── */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none mb-4">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={isEntreprise}
                onChange={(e) => setIsEntreprise(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-700 peer-checked:bg-vsonus-red transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-gray-400">
              Je réserve pour une entreprise
            </span>
          </label>

          {isEntreprise && (
            <div className="space-y-4 border-l-2 border-vsonus-red pl-4 mb-4">
              <div>
                <label className={labelCls}>Nom de l&apos;entreprise</label>
                <CompanySearch
                  value={entreprise.nom_entreprise}
                  onChange={(v) => setEntreprise((prev) => ({ ...prev, nom_entreprise: v }))}
                  onSelect={(c) => {
                    setEntreprise({ nom_entreprise: c.name, numero_ide: c.uid ?? '' })
                    if (c.rue) setForm((prev) => ({ ...prev, rue: c.rue!, npa: c.npa ?? prev.npa, ville: c.ville ?? prev.ville }))
                  }}
                />
              </div>
              <div>
                <label className={labelCls}>N° IDE / TVA</label>
                <input
                  type="text"
                  value={entreprise.numero_ide}
                  onChange={(e) => setEntreprise((prev) => ({ ...prev, numero_ide: e.target.value }))}
                  placeholder="CHE-XXX.XXX.XXX"
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Adresse de l'événement ──────────────────────────────────── */}
        <div className="pt-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-white border-b border-gray-800 pb-2 mb-4">
            Adresse de l&apos;événement
          </h3>

          {/* Rue — avec autocomplétion Google Places */}
          <div className="mb-4">
            <label className={labelCls}>Rue et numéro <span className="text-vsonus-red">*</span></label>
            <AddressAutocomplete
              value={form.rue}
              onChange={(v) => setForm((prev) => ({ ...prev, rue: v }))}
              onPlaceSelect={({ rue, npa, ville, pays }) =>
                setForm((prev) => ({ ...prev, rue, npa, ville, pays }))
              }
            />
          </div>

          {/* NPA + Ville sur la même ligne */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className={labelCls}>NPA <span className="text-vsonus-red">*</span></label>
              <input
                type="text" name="npa" value={form.npa} onChange={handleChange}
                required pattern={npaPattern} title={npaTitle}
                placeholder={form.pays === 'France' ? '75001' : '1800'}
                inputMode="numeric"
                className={inputCls}
                autoComplete="postal-code"
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Ville <span className="text-vsonus-red">*</span></label>
              <input
                type="text" name="ville" value={form.ville} onChange={handleChange}
                required placeholder="Vevey"
                className={inputCls} autoComplete="address-level2"
              />
            </div>
          </div>

          {/* Pays — fixe Suisse */}
          <div>
            <label className={labelCls}>Pays</label>
            <input type="text" value="Suisse" readOnly className={inputCls + ' cursor-default text-gray-500'} />
          </div>
        </div>

        {/* ── Adresse de facturation ──────────────────────────────────── */}
        <div className="pt-2">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              Adresse de facturation
            </h3>
          </div>

          {/* Toggle même adresse */}
          <label className="flex items-center gap-3 cursor-pointer mb-4 select-none">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={billingSame}
                onChange={(e) => setBillingSame(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-700 peer-checked:bg-vsonus-red transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-gray-400">
              Identique à l&apos;adresse de l&apos;événement
            </span>
          </label>

          {/* Champs facturation — visibles seulement si différente */}
          {!billingSame && (
            <div className="space-y-4 border-l-2 border-vsonus-red pl-4">
              <div>
                <label className={labelCls}>Rue et numéro <span className="text-vsonus-red">*</span></label>
                <AddressAutocomplete
                  value={billing.billing_rue}
                  onChange={(v) => setBilling((prev) => ({ ...prev, billing_rue: v }))}
                  onPlaceSelect={({ rue, npa, ville, pays }) =>
                    setBilling({ billing_rue: rue, billing_npa: npa, billing_ville: ville, billing_pays: pays })
                  }
                  countries={['ch', 'fr']}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>NPA <span className="text-vsonus-red">*</span></label>
                  <input
                    type="text" name="billing_npa" value={billing.billing_npa} onChange={handleBillingChange}
                    required={!billingSame}
                    pattern={billing.billing_pays === 'France' ? '[0-9]{5}' : '[0-9]{4}'}
                    title={billing.billing_pays === 'France' ? 'Code postal français (5 chiffres)' : 'Code postal suisse (4 chiffres)'}
                    placeholder={billing.billing_pays === 'France' ? '75001' : '1800'}
                    inputMode="numeric" className={inputCls} autoComplete="billing postal-code"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Ville <span className="text-vsonus-red">*</span></label>
                  <input
                    type="text" name="billing_ville" value={billing.billing_ville} onChange={handleBillingChange}
                    required={!billingSame} placeholder="Lausanne"
                    className={inputCls} autoComplete="billing address-level2"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Pays <span className="text-vsonus-red">*</span></label>
                <select
                  name="billing_pays" value={billing.billing_pays} onChange={handleBillingChange}
                  className={inputCls + ' cursor-pointer'}
                >
                  <option value="Suisse">Suisse</option>
                  <option value="France">France</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes / Informations complémentaires</label>
          <textarea
            name="notes" value={form.notes} onChange={handleChange} rows={4}
            className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-vsonus-red resize-none transition-colors"
          />
        </div>

        {/* Mentions légales + CGV */}
        <div className="space-y-3 border border-gray-800 p-4 bg-vsonus-dark/50">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-yellow-500 font-semibold">Annulation gratuite</span> jusqu&apos;à 5 jours avant la date de l&apos;événement.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Le locataire doit être <span className="text-white font-semibold">majeur (18 ans révolus)</span>.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox" required checked={cgvAccepted}
              onChange={(e) => setCgvAccepted(e.target.checked)}
              className="mt-0.5 accent-vsonus-red flex-shrink-0"
            />
            <span className="text-xs text-gray-400 leading-relaxed">
              Je confirme avoir lu et accepté les{' '}
              <button type="button" onClick={() => setCgvOpen(true)} className="text-vsonus-red underline hover:no-underline">
                conditions générales
              </button>{' '}
              de location. <span className="text-vsonus-red">*</span>
            </span>
          </label>
          <CgvModal open={cgvOpen} onClose={() => setCgvOpen(false)} onAccept={() => setCgvAccepted(true)} />
        </div>

        {/* Espace client */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={createAccount}
              onChange={(e) => setCreateAccount(e.target.checked)}
              className="mt-0.5 accent-vsonus-red flex-shrink-0"
            />
            <span className="text-sm text-gray-300">
              Je souhaite créer un espace client V-Sonus
            </span>
          </label>
          {createAccount && (
            <div className="bg-vsonus-dark border-l-2 border-vsonus-red px-4 py-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                En créant votre espace client, vous pourrez :
              </p>
              <ul className="mt-2 space-y-1 text-xs text-gray-500">
                <li>• Suivre le statut de vos réservations en temps réel</li>
                <li>• Retrouver l&apos;historique de vos locations</li>
                <li>• Accéder à vos documents (devis, factures)</li>
                <li>• Faciliter vos prochaines réservations</li>
              </ul>
            </div>
          )}
        </div>

        {error && (
          <div className="border border-vsonus-red bg-vsonus-red/10 text-vsonus-red text-sm px-4 py-3">
            {error}
          </div>
        )}

        {isSurDemande && (
          <div className="border border-yellow-600/50 bg-yellow-600/10 text-yellow-400 text-sm px-4 py-3 leading-relaxed">
            Pour une location de plus de 5 jours, veuillez{' '}
            <Link href="/contact" className="underline hover:text-yellow-300">nous contacter</Link>{' '}
            pour obtenir un tarif personnalisé.
          </div>
        )}

        <Button
          type="submit" variant="primary" size="lg" fullWidth
          disabled={isPending || !startDate || !endDate || !cgvAccepted || isSurDemande}
        >
          {isPending ? 'Envoi en cours…' : 'Confirmer la demande de devis'}
        </Button>
      </form>

      {/* ── Récapitulatif ─────────────────────────────────────────────── */}
      <aside className="lg:col-span-2 bg-vsonus-dark border border-gray-800 p-6 space-y-4 h-fit">
        <h2 className="text-xl font-black uppercase tracking-widest text-white border-b-2 border-vsonus-red pb-3">
          Récapitulatif
        </h2>

        {startDate && endDate && (
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-white">{formatDateEU(startDate)}</span>
            {' → '}
            <span className="font-semibold text-white">{formatDateEU(endDate)}</span>
            <span className="ml-2 text-xs">
              ({nbJours} jour{nbJours > 1 ? 's' : ''}
              {coefficient !== null && coefficient !== 1 && (
                <span className="text-vsonus-red font-bold"> {getCoefficientLabel(nbJours)}</span>
              )}
              )
            </span>
          </div>
        )}

        <ul className="space-y-2 divide-y divide-gray-800">
          {cart.map((item) => {
            const prixUnitaire = item.type === 'equipement' ? item.item.prix_journalier : getPackPrixEffectif(item.item as Pack)
            const isPack = item.type === 'pack'
            const pack = isPack ? (item.item as Pack) : null
            const modeLivraison = pack?.mode_livraison ?? 'obligatoire'
            const choix = pack ? (livraisonChoix[pack.id] ?? 'retrait') : null

            return (
              <li key={`${item.type}-${item.item.id}`} className="pt-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {item.item.nom}
                    <span className="text-gray-600 ml-1">×{item.quantite}</span>
                  </span>
                  <span className="text-white font-semibold">
                    {(prixUnitaire * item.quantite).toFixed(2)}{' '}
                    <span className="text-gray-600 text-xs">CHF/j</span>
                  </span>
                </div>
                {isPack && pack && modeLivraison === 'obligatoire' && (
                  <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                    {(pack.prix_livraison ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Livraison / Installation (1×)</span>
                        <span>{pack.prix_livraison} CHF</span>
                      </div>
                    )}
                    {(pack.prix_fourgon ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Location fourgon (1×)</span>
                        <span>{pack.prix_fourgon} CHF</span>
                      </div>
                    )}
                  </div>
                )}
                {isPack && pack && modeLivraison === 'optionnel' && choix === 'livraison' && (
                  <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                    {(pack.prix_livraison ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Livraison / Installation (1×)</span>
                        <span>{pack.prix_livraison} CHF</span>
                      </div>
                    )}
                    {(pack.prix_fourgon ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Location fourgon (1×)</span>
                        <span>{pack.prix_fourgon} CHF</span>
                      </div>
                    )}
                  </div>
                )}
                {isPack && pack && modeLivraison === 'optionnel' && choix === 'retrait' && (
                  <p className="mt-1 text-xs text-gray-600">Retrait sur place</p>
                )}
                {/* Affichage choix livraison équipements éclairage */}
                {!isPack && equipementHasLivraisonOption(item.item as Equipement) && (() => {
                  const eqChoix = livraisonChoix[`equip-${item.item.id}`] ?? 'retrait'
                  return eqChoix === 'livraison' ? (
                    <div className="mt-1 text-xs text-gray-500 flex justify-between">
                      <span>Livraison (1×)</span>
                      <span className="text-gray-400">{(item.item as Equipement).prix_livraison} CHF</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-600">Retrait sur place</p>
                  )
                })()}
              </li>
            )
          })}
        </ul>

        {/* Détail calcul avec coefficient */}
        <div className="border-t border-gray-800 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Location matériel (1 j)</span>
            <span>{sousTotalBrut.toFixed(2)} CHF</span>
          </div>
          {coefficient !== null && coefficient !== 1 && (
            <div className="flex justify-between text-gray-300">
              <span>
                Coefficient {nbJours}j{' '}
                <span className="text-vsonus-red font-bold">{getCoefficientLabel(nbJours)}</span>
              </span>
              <span className="text-white font-semibold">{sousTotal.toFixed(2)} CHF</span>
            </div>
          )}
          {fraisDetail.livraison > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Livraison et installation (1×)</span>
              <span className="text-white">{fraisDetail.livraison.toFixed(2)} CHF</span>
            </div>
          )}
          {fraisDetail.fourgon > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Location fourgon et essence (1×)</span>
              <span className="text-white">{fraisDetail.fourgon.toFixed(2)} CHF</span>
            </div>
          )}
          {fraisAnnexesEquip > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Frais annexes équipements</span>
              <span className="text-white">{fraisAnnexesEquip.toFixed(2)} CHF</span>
            </div>
          )}
        </div>

        {/* Indication retrait sur place pour matériel unitaire */}
        {cart.some((i) => i.type === 'equipement' && !(i.item as Equipement).transport_obligatoire) && (
          <div className="flex items-center gap-2 border border-gray-800 bg-vsonus-dark p-3">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-400">Le matériel unitaire est à retirer sur place.</p>
          </div>
        )}

        <div className="border-t-2 border-vsonus-red pt-3 flex justify-between font-black text-white text-lg">
          <span>TOTAL HT</span>
          <span className="text-vsonus-red">{totalHT.toFixed(2)} CHF</span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Cette demande de devis ne constitue pas une réservation ferme. Un technicien V-Sonus vous contactera pour confirmer la disponibilité et établir un devis officiel.
        </p>
      </aside>
    </div>
  )
}
