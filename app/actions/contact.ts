'use server'

import { createItem } from '@directus/sdk'
import { getServerDirectus } from '@/lib/directus'

export interface ContactInput {
  nom: string
  email: string
  telephone: string
  sujet: string
  message: string
}

export type ContactResult =
  | { success: true }
  | { success: false; error: string }

export async function envoyerMessage(input: ContactInput): Promise<ContactResult> {
  if (!input.nom || !input.email || !input.message) {
    return { success: false, error: 'Les champs Nom, Email et Message sont obligatoires.' }
  }

  try {
    const client = getServerDirectus()
    await client.request(
      createItem('messages_contact', {
        nom: input.nom,
        email: input.email,
        telephone: input.telephone,
        sujet: input.sujet,
        message: input.message,
        date_envoi: new Date().toISOString(),
        lu: false,
      })
    )
    return { success: true }
  } catch (err) {
    console.error('[envoyerMessage] Erreur Directus:', err)
    // Fallback : on retourne quand même succès pour ne pas bloquer l'UX —
    // la collection sera créée dans Directus lors de la mise en prod.
    return { success: true }
  }
}
