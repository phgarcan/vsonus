import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSession, getAccessToken, logout } from '@/lib/auth'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { LogoutButton } from '@/components/portal/LogoutButton'

export const metadata: Metadata = {
  title: 'Mon compte',
  robots: { index: false, follow: false },
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  en_attente_validation: { label: 'En attente', color: 'bg-orange-600' },
  confirme: { label: 'Confirmée', color: 'bg-green-600' },
  en_cours: { label: 'En cours', color: 'bg-blue-600' },
  termine: { label: 'Terminée', color: 'bg-gray-600' },
  annule: { label: 'Annulée', color: 'bg-red-800' },
}

interface Reservation {
  id: string
  statut: string
  date_debut: string
  date_fin: string
  total_ht: number
  date_created: string
  nom_client: string
}

export default async function MonComptePage() {
  const session = await getSession()
  if (!session) redirect('/mon-compte/connexion')

  const token = await getAccessToken()
  let reservations: Reservation[] = []

  if (token) {
    const res = await fetch(
      `${DIRECTUS_URL}/items/reservations?fields=id,statut,date_debut,date_fin,total_ht,date_created,nom_client&sort=-date_created&limit=50`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    )
    if (res.ok) {
      const json = await res.json()
      reservations = json.data ?? []
    }
  }

  const prenom = session.first_name || session.email.split('@')[0]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <AnimateOnScroll>
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-2">Espace client</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white">
              Bonjour {prenom}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/mon-compte/profil"
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white border border-gray-700 px-4 py-2 transition-colors"
            >
              Profil
            </Link>
            <LogoutButton />
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll delay={100}>
        <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
          Mes réservations
        </h2>
      </AnimateOnScroll>

      {reservations.length === 0 ? (
        <AnimateOnScroll delay={200}>
          <div className="bg-vsonus-dark border border-gray-800 p-10 text-center">
            <p className="text-gray-400 mb-6">Vous n&apos;avez pas encore de réservation.</p>
            <Link
              href="/catalogue"
              className="inline-block bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:bg-red-700 transition-colors"
            >
              Parcourir le catalogue
            </Link>
          </div>
        </AnimateOnScroll>
      ) : (
        <div className="space-y-4">
          {reservations.map((r, i) => {
            const status = STATUS_LABELS[r.statut] ?? { label: r.statut, color: 'bg-gray-600' }
            return (
              <AnimateOnScroll key={r.id} delay={150 + i * 50}>
                <Link
                  href={`/mon-compte/reservations/${r.id}`}
                  className="block bg-vsonus-dark border border-gray-800 hover:border-vsonus-red transition-colors p-5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`${status.color} text-white text-xs font-bold uppercase px-2 py-0.5`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-600">#{r.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-white font-bold text-sm group-hover:text-vsonus-red transition-colors">
                        {r.date_debut} → {r.date_fin}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-vsonus-red font-black text-lg">{r.total_ht.toFixed(2)} CHF</p>
                      <p className="text-xs text-gray-600">
                        Demande du {new Date(r.date_created).toLocaleDateString('fr-CH')}
                      </p>
                    </div>
                  </div>
                </Link>
              </AnimateOnScroll>
            )
          })}
        </div>
      )}
    </div>
  )
}
