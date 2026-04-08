import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { readItem, readItems } from '@directus/sdk'
import { getSession } from '@/lib/auth'
import { getServerDirectus } from '@/lib/directus'
import { formatDateEU } from '@/lib/utils'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { ClipboardCheck, FileText, CheckCircle2, PartyPopper, CircleDot } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STEPS = [
  { key: 'en_attente_validation', label: 'Demande reçue', Icon: ClipboardCheck },
  { key: 'devis', label: 'Devis en cours', Icon: FileText },
  { key: 'confirme', label: 'Confirmée', Icon: CheckCircle2 },
  { key: 'en_cours', label: 'En cours', Icon: PartyPopper },
  { key: 'termine', label: 'Terminée', Icon: CircleDot },
]

const STATUS_MESSAGES: Record<string, string> = {
  en_attente_validation: "Notre équipe examine votre demande. Nous vous contacterons sous 24h.",
  confirme: "Votre réservation est confirmée ! Nous préparons votre matériel.",
  en_cours: "Votre événement est en cours. Besoin d'aide ? Appelez-nous au +41 79 651 21 14.",
  termine: "Merci pour votre confiance ! N'hésitez pas à nous recommander.",
  annule: "Cette réservation a été annulée.",
}

function getStepIndex(statut: string): number {
  const map: Record<string, number> = {
    en_attente_validation: 0,
    devis: 1,
    confirme: 2,
    en_cours: 3,
    termine: 4,
    annule: -1,
  }
  return map[statut] ?? 0
}

interface Reservation {
  id: string
  statut: string
  user: string | null
  nom_client: string
  email_client: string
  tel_client: string
  adresse_evenement: string
  date_debut: string
  date_fin: string
  total_ht: number
  notes: string | null
  date_created: string
  est_entreprise: boolean
  nom_entreprise: string | null
  numero_ide: string | null
}

interface Ligne {
  id: string
  label: string
  quantite: number
  prix_unitaire: number
  prix_total: number
  type: string
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/mon-compte/connexion')

  const { id } = await params

  // Fetch via server token (bypass des permissions client) puis vérification
  // d'ownership côté Next.js : la réservation doit appartenir au user connecté
  // (par lien direct OU par email — pour les anciennes réservations sans lien).
  let reservation: Reservation | null = null
  let lignes: Ligne[] = []

  try {
    const client = getServerDirectus()
    const res = (await client.request(
      readItem('reservations', id, {
        fields: [
          'id', 'statut', 'user', 'nom_client', 'email_client', 'tel_client',
          'adresse_evenement', 'date_debut', 'date_fin', 'total_ht', 'notes',
          'date_created', 'est_entreprise', 'nom_entreprise', 'numero_ide',
        ],
      })
    )) as Reservation | null

    // Vérification ownership stricte
    if (res && (res.user === session.id || res.email_client === session.email)) {
      reservation = res
      const lignesResult = await client.request(
        readItems('reservation_lignes', {
          filter: { reservation_id: { _eq: id } } as Record<string, unknown>,
          sort: ['id'],
          limit: 100,
        })
      )
      lignes = (lignesResult as Ligne[]) ?? []
    }
  } catch (err) {
    console.error('[reservation-detail] Erreur:', err)
  }

  if (!reservation) notFound()

  const activeStep = getStepIndex(reservation.statut)
  const isAnnule = reservation.statut === 'annule'

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <AnimateOnScroll>
        <Link
          href="/mon-compte"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-vsonus-red transition-colors mb-6 inline-block"
        >
          ← Retour à mes réservations
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white">
            Réservation
          </h1>
          <span className="text-xs text-gray-600">#{id.slice(0, 8)}</span>
        </div>
      </AnimateOnScroll>

      {/* Progress bar */}
      {!isAnnule && (
        <AnimateOnScroll delay={100}>
          <div className="bg-vsonus-dark border border-gray-800 p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between relative">
              {/* Connection line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-vsonus-red transition-all duration-500"
                style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
              />

              {STEPS.map((step, i) => {
                const isActive = i === activeStep
                const isDone = i < activeStep
                const Icon = step.Icon
                return (
                  <div key={step.key} className="relative flex flex-col items-center z-10" style={{ width: `${100 / STEPS.length}%` }}>
                    <div
                      className={`w-10 h-10 flex items-center justify-center border-2 transition-all ${
                        isDone
                          ? 'bg-vsonus-red border-vsonus-red text-white'
                          : isActive
                          ? 'bg-vsonus-black border-vsonus-red text-vsonus-red animate-glow-pulse'
                          : 'bg-vsonus-dark border-gray-700 text-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <span
                      className={`text-xs mt-2 text-center font-bold uppercase tracking-wider ${
                        isDone || isActive ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </AnimateOnScroll>
      )}

      {/* Status message */}
      <AnimateOnScroll delay={150}>
        <div className={`border-l-4 ${isAnnule ? 'border-red-800' : 'border-vsonus-red'} bg-vsonus-dark px-6 py-4 mb-8`}>
          <p className="text-gray-300 text-sm">
            {STATUS_MESSAGES[reservation.statut] ?? ''}
          </p>
        </div>
      </AnimateOnScroll>

      {/* Material recap */}
      <AnimateOnScroll delay={200}>
        <div className="mb-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-vsonus-red mb-4">
            Matériel réservé
          </h2>
          <div className="bg-vsonus-dark border border-gray-800">
            {lignes.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-800 last:border-b-0">
                <div>
                  <span className="text-white text-sm font-bold">{l.label}</span>
                  <span className="text-gray-600 text-xs ml-2">× {l.quantite}</span>
                </div>
                <span className="text-white font-bold text-sm">{l.prix_total.toFixed(2)} CHF</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-4 border-t-2 border-vsonus-red">
              <span className="text-white font-black uppercase tracking-widest text-sm">Total HT</span>
              <span className="text-vsonus-red font-black text-lg">{reservation.total_ht.toFixed(2)} CHF</span>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Dates & info */}
      <AnimateOnScroll delay={250}>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-vsonus-dark border border-gray-800 p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-vsonus-red mb-3">Dates de location</h3>
            <p className="text-white font-bold">{formatDateEU(reservation.date_debut)} → {formatDateEU(reservation.date_fin)}</p>
            <p className="text-gray-500 text-xs mt-1">
              Demande effectuée le {formatDateEU(reservation.date_created)}
            </p>
          </div>
          <div className="bg-vsonus-dark border border-gray-800 p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-vsonus-red mb-3">Informations client</h3>
            {reservation.est_entreprise && reservation.nom_entreprise && (
              <div className="mb-2">
                <p className="text-white font-bold text-sm">{reservation.nom_entreprise}</p>
                {reservation.numero_ide && (
                  <p className="text-gray-500 text-xs">IDE : {reservation.numero_ide}</p>
                )}
              </div>
            )}
            <p className="text-white font-bold text-sm">{reservation.nom_client}</p>
            <p className="text-gray-400 text-xs mt-1">{reservation.email_client}</p>
            <p className="text-gray-400 text-xs">{reservation.tel_client}</p>
            <p className="text-gray-500 text-xs mt-2">{reservation.adresse_evenement}</p>
          </div>
        </div>
      </AnimateOnScroll>

      {reservation.notes && (
        <AnimateOnScroll delay={300}>
          <div className="bg-vsonus-dark border border-gray-800 p-5 mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-vsonus-red mb-3">Notes</h3>
            <p className="text-gray-400 text-sm whitespace-pre-line">{reservation.notes}</p>
          </div>
        </AnimateOnScroll>
      )}
    </div>
  )
}
