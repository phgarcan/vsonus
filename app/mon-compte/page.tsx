import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { formatDateEU } from '@/lib/utils'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { LogoutButton } from '@/components/portal/LogoutButton'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''
const SERVER_TOKEN = process.env.DIRECTUS_SERVER_TOKEN ?? ''

export const metadata: Metadata = {
  title: 'Mon compte',
  robots: { index: false, follow: false },
}

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

  // Récupération des réservations via REST direct + server token (bypass des
  // permissions Directus restrictives sur le rôle client). On fait DEUX fetch
  // séparés (user et email) puis on merge — évite les soucis de syntaxe _or
  // qui peuvent varier selon les versions Directus / encodages d'URL.
  let reservations: Reservation[] = []
  let debugError: string | null = null
  const fields = 'id,statut,date_debut,date_fin,total_ht,date_created,nom_client,user,email_client'
  const headers = { Authorization: `Bearer ${SERVER_TOKEN}` }

  try {
    if (!SERVER_TOKEN) {
      debugError = 'DIRECTUS_SERVER_TOKEN non défini côté serveur'
    } else {
      // Fetch 1 : par user.id (lien direct sur la réservation)
      const urlByUser = `${DIRECTUS_URL}/items/reservations?fields=${fields}&filter[user][_eq]=${encodeURIComponent(session.id)}&sort=-date_created&limit=50`
      const resByUser = await fetch(urlByUser, { headers, cache: 'no-store' })

      // Fetch 2 : par email (fallback pour anciennes réservations sans lien user)
      const urlByEmail = `${DIRECTUS_URL}/items/reservations?fields=${fields}&filter[email_client][_eq]=${encodeURIComponent(session.email)}&sort=-date_created&limit=50`
      const resByEmail = await fetch(urlByEmail, { headers, cache: 'no-store' })

      const errors: string[] = []
      const merged = new Map<string, Reservation>()

      if (resByUser.ok) {
        const json = await resByUser.json()
        for (const r of (json.data ?? []) as Reservation[]) merged.set(r.id, r)
      } else {
        const body = await resByUser.text().catch(() => '')
        errors.push(`fetch by user → ${resByUser.status} ${body.slice(0, 200)}`)
      }

      if (resByEmail.ok) {
        const json = await resByEmail.json()
        for (const r of (json.data ?? []) as Reservation[]) merged.set(r.id, r)
      } else {
        const body = await resByEmail.text().catch(() => '')
        errors.push(`fetch by email → ${resByEmail.status} ${body.slice(0, 200)}`)
      }

      // Tri descendant par date_created
      reservations = Array.from(merged.values()).sort((a, b) =>
        (b.date_created ?? '').localeCompare(a.date_created ?? '')
      )

      if (errors.length > 0 && reservations.length === 0) {
        debugError = errors.join(' | ')
      }
    }
  } catch (err) {
    debugError = err instanceof Error ? err.message : String(err)
    console.error('[mon-compte] Erreur récupération réservations:', err)
  }

  if (debugError) {
    console.error('[mon-compte] Debug:', debugError)
  }

  const prenom = session.first_name || ''

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <AnimateOnScroll>
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-vsonus-red mb-2">Espace client</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white">
              {prenom ? `Salut ${prenom}` : 'Bienvenue'}
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
            {debugError && (
              <div className="bg-red-950/40 border border-red-900 p-4 mb-6 text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Erreur (debug)</p>
                <pre className="text-xs text-red-300 whitespace-pre-wrap break-all">{debugError}</pre>
                <p className="text-[10px] text-gray-500 mt-2">User ID: {session.id} · Email: {session.email}</p>
              </div>
            )}
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
                        {formatDateEU(r.date_debut)} → {formatDateEU(r.date_fin)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-vsonus-red font-black text-lg">{r.total_ht.toFixed(2)} CHF</p>
                      <p className="text-xs text-gray-600">
                        Demande du {formatDateEU(r.date_created)}
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
