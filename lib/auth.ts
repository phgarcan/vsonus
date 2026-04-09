'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sendEmail, emailLayout } from '@/lib/email'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055'

export interface SessionUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  location: string | null
}


// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login(email: string, password: string): Promise<{ success: true } | { success: false; error: string }> {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '')
    console.error('[AUTH] Login error:', res.status, errorBody)
    return { success: false, error: 'Email ou mot de passe incorrect.' }
  }

  const { data } = await res.json()
  const cookieStore = await cookies()

  cookieStore.set('vsonus_access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: data.expires / 1000, // Directus returns ms
  })

  cookieStore.set('vsonus_refresh_token', data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { success: true }
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('vsonus_refresh_token')?.value

  if (refreshToken) {
    await fetch(`${DIRECTUS_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {})
  }

  cookieStore.delete('vsonus_access_token')
  cookieStore.delete('vsonus_refresh_token')
  redirect('/mon-compte/connexion')
}

// ---------------------------------------------------------------------------
// Get session (with auto-refresh)
// ---------------------------------------------------------------------------

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  let token = cookieStore.get('vsonus_access_token')?.value

  if (!token) {
    // Try refresh
    const refreshToken = cookieStore.get('vsonus_refresh_token')?.value
    if (!refreshToken) return null

    const res = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken, mode: 'json' }),
    })

    if (!res.ok) return null

    const { data } = await res.json()
    token = data.access_token

    cookieStore.set('vsonus_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.expires / 1000,
    })

    cookieStore.set('vsonus_refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  // Étape 1 : récupérer ce que le user token permet de lire sur /users/me.
  // C'est aussi notre validation d'auth — si ça fail, l'utilisateur n'est
  // pas authentifié.
  const meRes = await fetch(
    `${DIRECTUS_URL}/users/me?fields=id,first_name,last_name,email,phone,location`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  )
  if (!meRes.ok) return null

  const meJson = await meRes.json()
  const meData = meJson?.data
  if (!meData?.id) return null

  // À ce stade on a déjà un user valide. On retourne d'office cette donnée
  // pour ne JAMAIS casser l'auth — quitte à enrichir ensuite si possible.
  const baseUser: SessionUser = {
    id: meData.id,
    first_name: meData.first_name ?? null,
    last_name: meData.last_name ?? null,
    email: meData.email,
    phone: meData.phone ?? null,
    location: meData.location ?? null,
  }

  // Étape 2 (best-effort) : enrichir via le server token si certains champs
  // sont restreints en read pour le rôle Client. On ne fait l'enrichissement
  // que si au moins un champ profil est manquant — sinon ça ne sert à rien.
  const needsEnrich =
    baseUser.first_name === null ||
    baseUser.last_name === null ||
    baseUser.phone === null ||
    baseUser.location === null

  if (!needsEnrich) return baseUser

  const serverToken = process.env.DIRECTUS_SERVER_TOKEN
  if (!serverToken) return baseUser // pas de token serveur → on garde la base

  try {
    const fullRes = await fetch(
      `${DIRECTUS_URL}/users/${baseUser.id}?fields=id,first_name,last_name,email,phone,location`,
      { headers: { Authorization: `Bearer ${serverToken}` }, cache: 'no-store' }
    )
    if (fullRes.ok) {
      const { data } = await fullRes.json()
      if (data) {
        return {
          id: data.id,
          first_name: data.first_name ?? baseUser.first_name,
          last_name: data.last_name ?? baseUser.last_name,
          email: data.email ?? baseUser.email,
          phone: data.phone ?? baseUser.phone,
          location: data.location ?? baseUser.location,
        }
      }
    } else {
      const errBody = await fullRes.text().catch(() => '')
      console.error('[getSession] Enrich failed (non-fatal):', fullRes.status, errBody)
    }
  } catch (err) {
    console.error('[getSession] Enrich error (non-fatal):', err)
  }

  // En cas d'échec de l'enrichissement, on retourne la donnée de base —
  // l'utilisateur reste connecté.
  return baseUser
}

// ---------------------------------------------------------------------------
// Get access token (for API calls)
// ---------------------------------------------------------------------------

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('vsonus_access_token')?.value ?? null
}

// ---------------------------------------------------------------------------
// Password reset request
// ---------------------------------------------------------------------------

export async function requestPasswordReset(email: string): Promise<{ success: true }> {
  await fetch(`${DIRECTUS_URL}/auth/password/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, reset_url: 'https://vsonus.ch/mon-compte/reset-password' }),
  }).catch(() => {})

  // Always return success to avoid email enumeration
  return { success: true }
}

// ---------------------------------------------------------------------------
// Update profile
// ---------------------------------------------------------------------------

export async function updateProfile(data: { first_name?: string; last_name?: string; phone?: string; location?: string }): Promise<{ success: boolean; error?: string }> {
  // Validation de session : on doit être connecté pour modifier son propre profil
  const session = await getSession()
  if (!session?.id) return { success: false, error: 'Non connecté.' }

  const serverToken = process.env.DIRECTUS_SERVER_TOKEN
  if (!serverToken) {
    console.error('[updateProfile] DIRECTUS_SERVER_TOKEN manquant')
    return { success: false, error: 'Configuration serveur invalide.' }
  }

  // Récupérer les données actuelles avant modification (pour la notif admin)
  const currentRes = await fetch(`${DIRECTUS_URL}/users/${session.id}?fields=id,email,first_name,last_name,phone,location`, {
    headers: { Authorization: `Bearer ${serverToken}` },
  })
  const currentData = currentRes.ok ? (await currentRes.json()).data : null

  // Update via le server token (le rôle Client n'a pas la permission UPDATE
  // sur directus_users — fix sans devoir modifier les permissions Directus).
  // Sécurité : on cible session.id donc l'utilisateur ne peut modifier que
  // son propre profil.
  const res = await fetch(`${DIRECTUS_URL}/users/${session.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serverToken}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    console.error('[updateProfile] Failed:', res.status, errBody)
    return { success: false, error: `Erreur Directus (${res.status})` }
  }

  // Notification admin des changements (non-bloquant)
  if (currentData) {
    const changes: string[] = []
    if (data.first_name !== undefined && data.first_name !== (currentData.first_name ?? ''))
      changes.push(`Prénom : ${currentData.first_name || '(vide)'} → ${data.first_name || '(vide)'}`)
    if (data.last_name !== undefined && data.last_name !== (currentData.last_name ?? ''))
      changes.push(`Nom : ${currentData.last_name || '(vide)'} → ${data.last_name || '(vide)'}`)
    if (data.phone !== undefined && data.phone !== (currentData.phone ?? ''))
      changes.push(`Tél : ${currentData.phone || '(vide)'} → ${data.phone || '(vide)'}`)
    if (data.location !== undefined && data.location !== (currentData.location ?? ''))
      changes.push(`Adresse : ${currentData.location || '(vide)'} → ${data.location || '(vide)'}`)

    if (changes.length > 0) {
      sendEmail({
        to: 'info@vsonus.ch',
        subject: `V-Sonus — Profil modifié : ${currentData.email}`,
        html: emailLayout('Modification de profil', `
          <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
            Profil client modifié
          </h2>
          <p style="margin:0 0 16px;font-size:14px;color:#aaa;">
            Le client <strong style="color:#fff;">${currentData.email}</strong> a mis à jour son profil :
          </p>
          ${changes.map(c => `<p style="margin:4px 0;font-size:13px;color:#ccc;">• ${c}</p>`).join('')}
        `),
      }).catch((err: unknown) => console.error('[email] Erreur notification admin profil:', err))
    }
  }

  return { success: true }
}

// ---------------------------------------------------------------------------
// Change password
// ---------------------------------------------------------------------------

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  // Validation de session
  const session = await getSession()
  if (!session?.email || !session?.id) return { success: false, error: 'Session invalide.' }

  const serverToken = process.env.DIRECTUS_SERVER_TOKEN
  if (!serverToken) {
    console.error('[changePassword] DIRECTUS_SERVER_TOKEN manquant')
    return { success: false, error: 'Configuration serveur invalide.' }
  }

  // Vérifier le mot de passe actuel en tentant un login Directus
  const verifyRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: session.email, password: currentPassword }),
  })

  if (!verifyRes.ok) return { success: false, error: 'Mot de passe actuel incorrect.' }

  // Mot de passe vérifié — appliquer le changement via le server token
  // (le rôle Client n'a pas la permission UPDATE sur directus_users).
  const res = await fetch(`${DIRECTUS_URL}/users/${session.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serverToken}`,
    },
    body: JSON.stringify({ password: newPassword }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    console.error('[changePassword] Failed:', res.status, errBody)
    return { success: false, error: `Erreur Directus (${res.status})` }
  }
  return { success: true }
}
