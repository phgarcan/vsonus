'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { CgvModal } from '@/components/ui/CgvModal'
import { soumettreReservation } from '@/app/actions/reservation'
import { getCoefficientLabel } from '@/lib/pricing'
import type { TarifAnnexe } from '@/lib/directus'

interface CheckoutFormProps {
  tarifsAnnexes: TarifAnnexe[]
}

export function CheckoutForm({ tarifsAnnexes }: CheckoutFormProps) {
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
    requiresTechnicien,
    requiresTransport,
    clearCart,
  } = useStore()

  const nbJours       = getNbJours()
  const sousTotalBrut = getSousTotalBrut()
  const sousTotal     = getSousTotal()      // brut × coefficient
  const coefficient   = getCoefficient()
  const besoinTech    = requiresTechnicien()
  const besoinTransport = requiresTransport()

  const isSurDemande = coefficient === null && !!startDate && !!endDate

  const fraisTransport = tarifsAnnexes.find((t) => t.type === 'transport')
  const fraisMontage   = tarifsAnnexes.find((t) => t.type === 'montage')

  const totalFraisAnnexes =
    (besoinTransport && fraisTransport ? fraisTransport.prix : 0) +
    (besoinTech && fraisMontage ? fraisMontage.prix : 0)

  const totalHT = sousTotal + totalFraisAnnexes

  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [cgvOpen, setCgvOpen] = useState(false)

  const [form, setForm] = useState({
    nom: '',
    email: '',
    tel: '',
    adresse_evenement: '',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await soumettreReservation({
        clientData: form,
        cartItems: cart,
        startDate: startDate!,
        endDate: endDate!,
        nbJours,
        totalHT,
        besoinMontage: besoinTech,
        besoinLivraison: besoinTransport,
      })

      if (result.success) {
        clearCart()
        router.push(`/confirmation?id=${result.id}`)
      } else {
        setError(result.error)
      }
    })
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Votre projet est vide.</p>
        <a href="/catalogue" className="mt-4 inline-block text-vsonus-red underline hover:no-underline">
          Retourner au catalogue
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* Formulaire client */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
        <h2 className="text-xl font-black uppercase tracking-widest text-white border-b-2 border-vsonus-red pb-3">
          Vos coordonnées
        </h2>

        {[
          { name: 'nom', label: 'Nom complet', type: 'text', required: true },
          { name: 'email', label: 'Adresse e-mail', type: 'email', required: true },
          { name: 'tel', label: 'Téléphone', type: 'tel', required: true },
          { name: 'adresse_evenement', label: "Adresse de l'événement", type: 'text', required: true },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              {field.label} {field.required && <span className="text-vsonus-red">*</span>}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              required={field.required}
              className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-vsonus-red transition-colors"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            Notes / Informations complémentaires
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-vsonus-red resize-none transition-colors"
          />
        </div>

        {/* Mentions légales */}
        <div className="space-y-3 border border-gray-800 p-4 bg-vsonus-dark/50">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-yellow-500 font-semibold">Annulation gratuite</span> jusqu&apos;à 5 jours avant la date de l&apos;événement.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Le locataire doit être <span className="text-white font-semibold">majeur (18 ans révolus)</span>.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={cgvAccepted}
              onChange={(e) => setCgvAccepted(e.target.checked)}
              className="mt-0.5 accent-vsonus-red flex-shrink-0"
            />
            <span className="text-xs text-gray-400 leading-relaxed">
              Je confirme avoir lu et accepté les{' '}
              <button
                type="button"
                onClick={() => setCgvOpen(true)}
                className="text-vsonus-red underline hover:no-underline"
              >
                conditions générales
              </button>{' '}
              de location. <span className="text-vsonus-red">*</span>
            </span>
          </label>

          <CgvModal
            open={cgvOpen}
            onClose={() => setCgvOpen(false)}
            onAccept={() => setCgvAccepted(true)}
          />
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
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isPending || !startDate || !endDate || !cgvAccepted || isSurDemande}
        >
          {isPending ? 'Envoi en cours…' : 'Confirmer la demande de devis'}
        </Button>
      </form>

      {/* Récapitulatif */}
      <aside className="lg:col-span-2 bg-vsonus-dark border border-gray-800 p-6 space-y-4 h-fit">
        <h2 className="text-xl font-black uppercase tracking-widest text-white border-b-2 border-vsonus-red pb-3">
          Récapitulatif
        </h2>

        {startDate && endDate && (
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-white">{startDate}</span>
            {' → '}
            <span className="font-semibold text-white">{endDate}</span>
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
            const prixUnitaire = item.type === 'equipement' ? item.item.prix_journalier : item.item.prix_base
            return (
              <li key={`${item.type}-${item.item.id}`} className="flex justify-between pt-2 text-sm">
                <span className="text-gray-300">
                  {item.item.nom}
                  <span className="text-gray-600 ml-1">×{item.quantite}</span>
                </span>
                <span className="text-white font-semibold">{(prixUnitaire * item.quantite).toFixed(2)} <span className="text-gray-600 text-xs">CHF/j</span></span>
              </li>
            )
          })}
        </ul>

        {/* Détail du calcul avec coefficient */}
        <div className="border-t border-gray-800 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Sous-total (1 j)</span>
            <span>{sousTotalBrut.toFixed(2)} CHF</span>
          </div>
          {coefficient !== null && coefficient !== 1 && (
            <div className="flex justify-between text-gray-400">
              <span>
                Coefficient {nbJours}j{' '}
                <span className="text-vsonus-red font-bold">{getCoefficientLabel(nbJours)}</span>
              </span>
              <span className="text-white font-semibold">{sousTotal.toFixed(2)} CHF</span>
            </div>
          )}
          {besoinTransport && fraisTransport && (
            <div className="flex justify-between text-gray-400">
              <span>{fraisTransport.label}</span>
              <span className="text-white">{fraisTransport.prix.toFixed(2)} CHF</span>
            </div>
          )}
          {besoinTech && fraisMontage && (
            <div className="flex justify-between text-gray-400">
              <span>{fraisMontage.label}</span>
              <span className="text-white">{fraisMontage.prix.toFixed(2)} CHF</span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-vsonus-red pt-3 flex justify-between font-black text-white text-lg">
          <span>TOTAL HT</span>
          <span className="text-vsonus-red">{totalHT.toFixed(2)} CHF</span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Cette demande de devis ne constitue pas une réservation ferme. Un technicien V-Sonus vous contactera pour confirmer la disponibilité et établir un devis officiel.
        </p>
      </aside>
    </div>
  )
}
