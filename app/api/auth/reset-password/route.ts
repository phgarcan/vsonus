import { NextResponse } from 'next/server'
import { sendEmail, emailLayout } from '@/lib/email'
import crypto from 'crypto'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dev.vsonus.ch'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      // Always return success to avoid email enumeration
      return NextResponse.json({ success: true })
    }

    // Check if user exists in Directus
    const userRes = await fetch(
      `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id,first_name&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}` } }
    )

    if (!userRes.ok) {
      return NextResponse.json({ success: true })
    }

    const userData = await userRes.json()
    if (!userData.data?.length) {
      // User doesn't exist — return success anyway (no enumeration)
      return NextResponse.json({ success: true })
    }

    const user = userData.data[0]
    const userId = user.id
    const firstName = user.first_name ?? ''

    // Generate a secure token
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

    // Store token on user (using custom fields reset_token / reset_token_expires)
    const updateRes = await fetch(`${DIRECTUS_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DIRECTUS_SERVER_TOKEN}`,
      },
      body: JSON.stringify({
        reset_token: token,
        reset_token_expires: expires,
      }),
    })

    if (!updateRes.ok) {
      console.error('[reset-password] Failed to store token:', await updateRes.text())
      return NextResponse.json({ success: true })
    }

    // Send email via Resend
    const resetLink = `${SITE_URL}/mon-compte/definir-mot-de-passe?token=${token}`

    await sendEmail({
      to: email,
      subject: 'V-Sonus — Réinitialisation de votre mot de passe',
      html: emailLayout('Réinitialisation du mot de passe', `
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
          Réinitialisation du mot de passe
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
          Bonjour${firstName ? ` <strong style="color:#fff;">${firstName}</strong>` : ''},<br>
          Vous avez demandé la réinitialisation de votre mot de passe.
          Cliquez sur le bouton ci-dessous pour en définir un nouveau.
        </p>
        <p style="margin:0 0 24px;">
          <a href="${resetLink}"
             style="display:inline-block;background:#EC1C24;color:#fff;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 24px;text-decoration:none;">
            Définir un nouveau mot de passe →
          </a>
        </p>
        <p style="font-size:12px;color:#666;line-height:1.6;">
          Ce lien est valable 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.<br>
          <a href="${resetLink}" style="color:#888;word-break:break-all;">${resetLink}</a>
        </p>
      `),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reset-password] Error:', err)
    return NextResponse.json({ success: true })
  }
}
