'use server'

import { createItem } from '@directus/sdk'
import { getServerDirectus } from '@/lib/directus'
import type { CartItem } from '@/lib/store'

// ---------------------------------------------------------------------------
// Types des données entrantes
// ---------------------------------------------------------------------------

export interface ClientData {
  nom: string
  email: string
  tel: string
  adresse_evenement: string
  notes?: string
}

export interface ReservationInput {
  clientData: ClientData
  cartItems: CartItem[]
  startDate: string
  endDate: string
  nbJours: number
  totalHT: number
  besoinMontage: boolean
  besoinLivraison: boolean
}

export type ReservationResult =
  | { success: true; id: string }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Server Action principale
// ---------------------------------------------------------------------------

export async function soumettreReservation(
  input: ReservationInput
): Promise<ReservationResult> {
  const { clientData, cartItems, startDate, endDate, nbJours, totalHT, besoinMontage, besoinLivraison } = input

  // Validation minimale côté serveur
  if (!clientData.nom || !clientData.email || !clientData.tel || !clientData.adresse_evenement) {
    return { success: false, error: 'Tous les champs obligatoires doivent être remplis.' }
  }
  if (!startDate || !endDate) {
    return { success: false, error: 'Les dates de location sont obligatoires.' }
  }
  if (cartItems.length === 0) {
    return { success: false, error: 'La sélection est vide.' }
  }

  try {
    const client = getServerDirectus()

    // 1. Créer la réservation parente
    const reservation = await client.request(
      createItem('reservations', {
        statut: 'en_attente_validation',
        nom_client: clientData.nom,
        email_client: clientData.email,
        tel_client: clientData.tel,
        adresse_evenement: clientData.adresse_evenement,
        notes: clientData.notes ?? '',
        date_debut: startDate,
        date_fin: endDate,
        total_ht: totalHT,
        besoin_montage: besoinMontage,
        besoin_livraison: besoinLivraison,
      })
    )

    const reservationId = (reservation as { id: string }).id

    // 2. Créer les lignes de réservation
    const lignesPromises = cartItems.map((item) => {
      const prix =
        item.type === 'equipement'
          ? item.item.prix_journalier * nbJours
          : item.item.prix_base

      return client.request(
        createItem('reservation_lignes', {
          reservation_id: reservationId,
          type: item.type,
          reference_id: item.item.id,
          label: item.item.nom,
          quantite: item.quantite,
          prix_unitaire: item.type === 'equipement' ? item.item.prix_journalier : item.item.prix_base,
          prix_total: prix * item.quantite,
        })
      )
    })

    await Promise.all(lignesPromises)

    return { success: true, id: reservationId }
  } catch (err) {
    console.error('[soumettreReservation] Erreur:', err)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la soumission. Veuillez réessayer.',
    }
  }
}
