'use server'

import { getServerDirectus } from '@/lib/directus'
import { updateItem } from '@directus/sdk'
import { sendEmail, emailLayout } from '@/lib/email'

const CLIENT_ROLE_ID = '3a7b1e18-e5c6-4e31-8992-862377d0b98b'
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dev.vsonus.ch'

interface CreateAccountInput {
  email: string
  nom: string
  reservationId: string
}

export async function createAccountPostCheckout(
  input: CreateAccountInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { email, nom, reservationId } = input

  if (!email || !nom) {
    return { success: false, error: 'Données manquantes.' }
  }

  try {
    // Check if user already exists
    const existingRes = await fetch(
      `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}` } }
    )

    if (existingRes.ok) {
      const existing = await existingRes.json()
      if (existing.data?.length > 0) {
        return { success: false, error: 'Un compte existe déjà pour cette adresse email.' }
      }
    }

    // Create user
    const tempPassword = crypto.randomUUID().slice(0, 16) + 'A1!'
    const nameParts = nom.split(' ')
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const createRes = await fetch(`${DIRECTUS_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}`,
      },
      body: JSON.stringify({
        email,
        password: tempPassword,
        first_name: firstName,
        last_name: lastName,
        role: CLIENT_ROLE_ID,
      }),
    })

    if (!createRes.ok) {
      console.error('[account] Failed to create user:', await createRes.text())
      return { success: false, error: 'Erreur lors de la création du compte.' }
    }

    const created = await createRes.json()
    const userId = created.data.id

    // Link reservation to user
    if (reservationId) {
      const client = getServerDirectus()
      await client.request(updateItem('reservations', reservationId, { user: userId }))
    }

    // Send welcome email
    sendEmail({
      to: email,
      subject: 'V-Sonus — Votre espace client est prêt',
      html: emailLayout('Bienvenue sur V-Sonus', `
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
          Votre espace client
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
          Bonjour <strong style="color:#fff;">${firstName}</strong>,<br>
          Un espace client a été créé pour vous suite à votre réservation.
          Vous pourrez y suivre vos réservations et gérer votre profil.
        </p>
        <p style="margin:0 0 24px;">
          <a href="${SITE_URL}/mon-compte/definir-mot-de-passe"
             style="display:inline-block;background:#EC1C24;color:#fff;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 24px;text-decoration:none;">
            Définir mon mot de passe →
          </a>
        </p>
        <p style="font-size:12px;color:#666;">
          Connectez-vous ensuite sur <a href="${SITE_URL}/mon-compte/connexion" style="color:#EC1C24;">${SITE_URL.replace('https://', '')}/mon-compte</a>
        </p>
      `),
    }).catch((err: unknown) => console.error('[email] Welcome email error:', err))

    return { success: true }
  } catch (err) {
    console.error('[account] Error:', err)
    return { success: false, error: 'Erreur lors de la création du compte.' }
  }
}
