import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes protégées nécessitant une authentification
const PROTECTED_PATHS = ['/mon-compte']
// Routes exclues de la protection (connexion, inscription, etc.)
const PUBLIC_ACCOUNT_PATHS = [
  '/mon-compte/connexion',
  '/mon-compte/mot-de-passe-oublie',
  '/mon-compte/definir-mot-de-passe',
  '/mon-compte/confirmer-email',
]

// Rate limiting en mémoire pour les routes d'auth
const authAttempts = new Map<string, { count: number; resetAt: number }>()

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Rate limiting sur /api/auth/* ---
  if (pathname.startsWith('/api/auth/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const key = `${ip}:${pathname}`
    const now = Date.now()
    const window = 60_000 // 1 minute
    const maxAttempts = 5

    const entry = authAttempts.get(key)
    if (entry && now < entry.resetAt) {
      if (entry.count >= maxAttempts) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Réessayez dans une minute.' },
          { status: 429 }
        )
      }
      entry.count++
    } else {
      authAttempts.set(key, { count: 1, resetAt: now + window })
    }

    // Nettoyage périodique (toutes les 100 entrées)
    if (authAttempts.size > 100) {
      for (const [k, v] of authAttempts) {
        if (now > v.resetAt) authAttempts.delete(k)
      }
    }
  }

  // --- Protection des routes /mon-compte/* ---
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isPublicAccount = PUBLIC_ACCOUNT_PATHS.some((p) => pathname === p)

  if (isProtected && !isPublicAccount) {
    const accessToken = request.cookies.get('vsonus_access_token')?.value
    const refreshToken = request.cookies.get('vsonus_refresh_token')?.value

    if (!accessToken && !refreshToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/mon-compte/connexion'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/mon-compte/:path*', '/api/auth/:path*'],
}
