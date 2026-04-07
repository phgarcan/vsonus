'use server'

import { cookies } from 'next/headers'
import { getServerDirectus } from '@/lib/directus'
import { updateItem } from '@directus/sdk'
import { sendEmail, emailLayout } from '@/lib/email'
import { getAccessToken } from '@/lib/auth'

const CLIENT_ROLE_ID = '3a7b1e18-e5c6-4e31-8992-862377d0b98b'
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vsonus.ch'

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

    // Générer un token pour le lien de définition du mot de passe (72h)
    const resetToken = crypto.randomUUID()
    const resetExpires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

    await fetch(`${DIRECTUS_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}`,
      },
      body: JSON.stringify({
        reset_token: resetToken,
        reset_token_expires: resetExpires,
      }),
    })

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
          <a href="${SITE_URL}/mon-compte/definir-mot-de-passe?token=${resetToken}"
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

// ---------------------------------------------------------------------------
// Suppression de compte (nLPD)
// ---------------------------------------------------------------------------

export async function deleteAccount(
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  const token = await getAccessToken()
  if (!token) return { success: false, error: 'Non connecté.' }

  try {
    // 1. Récupérer l'utilisateur courant
    const meRes = await fetch(`${DIRECTUS_URL}/users/me?fields=id,email,first_name,last_name`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!meRes.ok) return { success: false, error: 'Session expirée.' }
    const { data: me } = await meRes.json()

    // 2. Vérifier le mot de passe via /auth/login
    const authRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: me.email, password }),
    })
    if (!authRes.ok) {
      return { success: false, error: 'Mot de passe incorrect.' }
    }

    const serverToken = process.env.DIRECTUS_SERVER_TOKEN!

    // 3. Anonymiser les réservations liées
    const reservationsRes = await fetch(
      `${DIRECTUS_URL}/items/reservations?filter[user][_eq]=${me.id}&fields=id&limit=200`,
      { headers: { Authorization: `Bearer ${serverToken}` } }
    )
    if (reservationsRes.ok) {
      const reservations = await reservationsRes.json()
      for (const r of reservations.data ?? []) {
        await fetch(`${DIRECTUS_URL}/items/reservations/${r.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serverToken}`,
          },
          body: JSON.stringify({
            nom_client: 'Compte supprimé',
            email_client: 'supprime@anonyme.local',
            tel_client: '—',
            adresse_evenement: '—',
            user: null,
            nom_entreprise: null,
            numero_ide: null,
            notes: null,
          }),
        })
      }
    }

    // 4. Supprimer l'utilisateur
    const deleteRes = await fetch(`${DIRECTUS_URL}/users/${me.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${serverToken}` },
    })
    if (!deleteRes.ok) {
      console.error('[deleteAccount] Failed to delete user:', await deleteRes.text())
      return { success: false, error: 'Erreur lors de la suppression.' }
    }

    // 5. Notification admin de la suppression (non-bloquant)
    const displayName = [me.first_name, me.last_name].filter(Boolean).join(' ') || 'Utilisateur'
    sendEmail({
      to: 'info@vsonus.ch',
      subject: `V-Sonus — Compte supprimé : ${me.email}`,
      html: emailLayout('Suppression de compte', `
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
          Compte client supprimé
        </h2>
        <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">
          L'utilisateur <strong style="color:#fff;">${displayName}</strong> (<strong style="color:#fff;">${me.email}</strong>) a supprimé son compte.<br>
          Ses réservations ont été anonymisées conformément à la nLPD.
        </p>
        <p style="font-size:12px;color:#666;">
          Date de suppression : ${new Date().toLocaleString('fr-CH', { timeZone: 'Europe/Zurich' })}
        </p>
      `),
    }).catch((err: unknown) => console.error('[email] Erreur notification admin suppression:', err))

    // 6. Supprimer les cookies de session
    const cookieStore = await cookies()
    cookieStore.delete('vsonus_access_token')
    cookieStore.delete('vsonus_refresh_token')

    return { success: true }
  } catch (err) {
    console.error('[deleteAccount] Error:', err)
    return { success: false, error: 'Erreur serveur.' }
  }
}
