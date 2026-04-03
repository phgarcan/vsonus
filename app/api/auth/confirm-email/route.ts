import { NextResponse } from 'next/server'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token manquant.' }, { status: 400 })
    }

    // Chercher l'utilisateur avec ce token
    const searchRes = await fetch(
      `${DIRECTUS_URL}/users?filter[email_change_token][_eq]=${encodeURIComponent(token)}&fields=id,email_change_new,email_change_expires&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}` } }
    )

    if (!searchRes.ok) {
      return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
    }

    const searchData = await searchRes.json()
    if (!searchData.data?.length) {
      return NextResponse.json({ success: false, error: 'Lien invalide ou déjà utilisé.' }, { status: 400 })
    }

    const user = searchData.data[0]

    // Vérifier l'expiration
    if (new Date(user.email_change_expires) < new Date()) {
      // Nettoyer le token expiré
      await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}`,
        },
        body: JSON.stringify({
          email_change_token: null,
          email_change_new: null,
          email_change_expires: null,
        }),
      })
      return NextResponse.json({ success: false, error: 'Ce lien a expiré. Veuillez refaire la demande depuis votre profil.' }, { status: 400 })
    }

    // Mettre à jour l'email et nettoyer les champs temporaires
    const updateRes = await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}`,
      },
      body: JSON.stringify({
        email: user.email_change_new,
        email_change_token: null,
        email_change_new: null,
        email_change_expires: null,
      }),
    })

    if (!updateRes.ok) {
      console.error('[confirm-email] Failed to update email:', await updateRes.text())
      return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[confirm-email] Error:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
