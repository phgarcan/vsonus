import { NextResponse } from 'next/server'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Données manquantes.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 })
    }

    // Find user with this reset token
    const userRes = await fetch(
      `${DIRECTUS_URL}/users?filter[reset_token][_eq]=${encodeURIComponent(token)}&fields=id,reset_token_expires&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}` } }
    )

    if (!userRes.ok) {
      return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
    }

    const userData = await userRes.json()
    if (!userData.data?.length) {
      return NextResponse.json({ success: false, error: 'Lien invalide ou expiré.' }, { status: 400 })
    }

    const user = userData.data[0]

    // Check expiration
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json({ success: false, error: 'Ce lien a expiré. Veuillez en demander un nouveau.' }, { status: 400 })
    }

    // Update password and clear token
    const updateRes = await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}`,
      },
      body: JSON.stringify({
        password,
        reset_token: null,
        reset_token_expires: null,
      }),
    })

    if (!updateRes.ok) {
      console.error('[set-password] Failed to update password:', await updateRes.text())
      return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour du mot de passe.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[set-password] Error:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
