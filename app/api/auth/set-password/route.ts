import { NextResponse } from 'next/server'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Données manquantes.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 })
    }

    // Validation format : au moins 1 majuscule, 1 chiffre, 1 caractère spécial
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json({
        success: false,
        error: 'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial.',
      }, { status: 400 })
    }

    const serverToken = process.env.DIRECTUS_SERVER_TOKEN
    if (!serverToken) {
      console.error('[set-password] DIRECTUS_SERVER_TOKEN manquant')
      return NextResponse.json({ success: false, error: 'Erreur de configuration serveur.' }, { status: 500 })
    }

    // Trouver l'utilisateur par reset_token
    const userRes = await fetch(
      `${DIRECTUS_URL}/users?filter[reset_token][_eq]=${encodeURIComponent(token)}&fields=id,reset_token_expires&limit=1`,
      { headers: { Authorization: `Bearer ${serverToken}` } }
    )

    if (!userRes.ok) {
      const errBody = await userRes.text().catch(() => '')
      console.error('[set-password] Recherche utilisateur échouée:', userRes.status, errBody)
      return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
    }

    const userData = await userRes.json()
    if (!userData.data?.length) {
      return NextResponse.json({ success: false, error: 'Lien invalide ou expiré.' }, { status: 400 })
    }

    const user = userData.data[0]

    // Vérifier l'expiration
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json({ success: false, error: 'Ce lien a expiré. Veuillez en demander un nouveau.' }, { status: 400 })
    }

    // Étape 1 : mettre à jour le mot de passe (séparé du nettoyage token)
    const pwdRes = await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serverToken}`,
      },
      body: JSON.stringify({ password }),
    })

    if (!pwdRes.ok) {
      const errBody = await pwdRes.text().catch(() => '')
      console.error('[set-password] Échec mise à jour mot de passe:', pwdRes.status, errBody)
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la mise à jour du mot de passe.',
        // Inclure le détail Directus en dev pour le diagnostic
        ...(process.env.NODE_ENV === 'development' ? { directusError: errBody } : {}),
      }, { status: 500 })
    }

    // Étape 2 : nettoyer le token (non bloquant)
    await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serverToken}`,
      },
      body: JSON.stringify({ reset_token: null, reset_token_expires: null }),
    }).catch((err) => {
      console.error('[set-password] Échec nettoyage token (non critique):', err)
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[set-password] Error:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
