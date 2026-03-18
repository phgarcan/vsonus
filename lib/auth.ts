'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055'

export interface SessionUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
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

  // Fetch user profile
  const res = await fetch(`${DIRECTUS_URL}/users/me?fields=id,first_name,last_name,email,phone`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return null

  const { data } = await res.json()
  return data as SessionUser
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

export async function updateProfile(data: { first_name?: string; last_name?: string; phone?: string }): Promise<{ success: boolean; error?: string }> {
  const token = await getAccessToken()
  if (!token) return { success: false, error: 'Non connecté.' }

  const res = await fetch(`${DIRECTUS_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) return { success: false, error: 'Erreur lors de la mise à jour.' }
  return { success: true }
}

// ---------------------------------------------------------------------------
// Change password
// ---------------------------------------------------------------------------

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('vsonus_access_token')?.value
  if (!token) return { success: false, error: 'Non connecté.' }

  // Directus doesn't have a direct "change password" endpoint for users/me
  // We need to use PATCH /users/me with the password field
  const res = await fetch(`${DIRECTUS_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password: newPassword }),
  })

  if (!res.ok) return { success: false, error: 'Erreur lors du changement de mot de passe.' }
  return { success: true }
}
