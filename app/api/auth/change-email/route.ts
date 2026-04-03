import { NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/auth'
import { sendEmail, emailLayout } from '@/lib/email'
import crypto from 'crypto'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dev.vsonus.ch'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const token = await getAccessToken()
    if (!token) {
      return NextResponse.json({ success: false, error: 'Non connecté.' }, { status: 401 })
    }

    const { newEmail } = await req.json()

    // Validation format email
    if (!newEmail || !EMAIL_REGEX.test(newEmail)) {
      return NextResponse.json({ success: false, error: 'Adresse email invalide.' }, { status: 400 })
    }

    // Récupérer l'utilisateur courant
    const meRes = await fetch(`${DIRECTUS_URL}/users/me?fields=id,first_name,email`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!meRes.ok) {
      return NextResponse.json({ success: false, error: 'Session expirée.' }, { status: 401 })
    }
    const { data: me } = await meRes.json()

    // Vérifier que le nouvel email est différent de l'actuel
    if (me.email?.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'C\'est déjà votre adresse email actuelle.' }, { status: 400 })
    }

    // Vérifier que le nouvel email n'est pas déjà pris
    const checkRes = await fetch(
      `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(newEmail)}&fields=id&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}` } }
    )
    if (checkRes.ok) {
      const checkData = await checkRes.json()
      if (checkData.data?.length > 0) {
        return NextResponse.json({ success: false, error: 'Cette adresse email est déjà utilisée.' }, { status: 400 })
      }
    }

    // Générer le token de confirmation
    const changeToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1h

    // Stocker sur l'utilisateur
    const updateRes = await fetch(`${DIRECTUS_URL}/users/${me.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}`,
      },
      body: JSON.stringify({
        email_change_token: changeToken,
        email_change_new: newEmail,
        email_change_expires: expires,
      }),
    })

    if (!updateRes.ok) {
      console.error('[change-email] Failed to store token:', await updateRes.text())
      return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
    }

    // Envoyer l'email de confirmation à la NOUVELLE adresse
    const confirmLink = `${SITE_URL}/mon-compte/confirmer-email?token=${changeToken}`
    const firstName = me.first_name ?? ''

    await sendEmail({
      to: newEmail,
      subject: 'V-Sonus — Confirmez votre nouvelle adresse email',
      html: emailLayout('Confirmation de votre email', `
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
          Confirmer votre nouvelle adresse email
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
          Bonjour${firstName ? ` <strong style="color:#fff;">${firstName}</strong>` : ''},<br>
          Vous avez demandé à modifier votre adresse email sur V-Sonus.
          Cliquez sur le bouton ci-dessous pour confirmer cette nouvelle adresse.
        </p>
        <p style="margin:0 0 24px;">
          <a href="${confirmLink}"
             style="display:inline-block;background:#EC1C24;color:#fff;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 24px;text-decoration:none;">
            Confirmer mon email →
          </a>
        </p>
        <p style="font-size:12px;color:#666;line-height:1.6;">
          Ce lien est valable 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.<br>
          <a href="${confirmLink}" style="color:#888;word-break:break-all;">${confirmLink}</a>
        </p>
      `),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[change-email] Error:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
