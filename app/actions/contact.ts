'use server'

import { createItem } from '@directus/sdk'
import { getServerDirectus } from '@/lib/directus'
import { sendEmail, emailLayout } from '@/lib/email'

export interface ContactInput {
  nom: string
  email: string
  telephone: string
  sujet: string
  message: string
}

export type ContactResult =
  | { success: true }
  | { success: false; error: string }

export async function envoyerMessage(input: ContactInput): Promise<ContactResult> {
  if (!input.nom || !input.email || !input.message) {
    return { success: false, error: 'Les champs Nom, Email et Message sont obligatoires.' }
  }

  try {
    const client = getServerDirectus()
    await client.request(
      createItem('messages_contact', {
        nom: input.nom,
        email: input.email,
        telephone: input.telephone,
        sujet: input.sujet,
        message: input.message,
        date_envoi: new Date().toISOString(),
        lu: false,
      })
    )
  } catch (err) {
    console.error('[envoyerMessage] Erreur Directus:', err)
  }

  // Email notification — non bloquant
  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
      Nouveau message de contact
    </h2>
    <p style="margin:0 0 24px;font-size:13px;color:#EC1C24;">${input.sujet || 'Sans sujet'}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#888;width:110px;">Nom</td>
        <td style="padding:6px 0;font-size:13px;color:#fff;font-weight:700;">${input.nom}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#888;">Email</td>
        <td style="padding:6px 0;font-size:13px;">
          <a href="mailto:${input.email}" style="color:#EC1C24;">${input.email}</a>
        </td>
      </tr>
      ${input.telephone ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#888;">Téléphone</td>
        <td style="padding:6px 0;font-size:13px;">
          <a href="tel:${input.telephone}" style="color:#EC1C24;">${input.telephone}</a>
        </td>
      </tr>` : ''}
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#888;">Sujet</td>
        <td style="padding:6px 0;font-size:13px;color:#fff;">${input.sujet || '—'}</td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:12px;color:#EC1C24;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
    <div style="background:#1a1718;border-left:3px solid #EC1C24;padding:16px;font-size:14px;color:#ccc;line-height:1.7;white-space:pre-wrap;">${input.message}</div>

    <p style="margin-top:24px;">
      <a href="mailto:${input.email}"
         style="display:inline-block;background:#EC1C24;color:#fff;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:10px 20px;text-decoration:none;">
        Répondre à ${input.nom} →
      </a>
    </p>
  `

  const confirmationBody = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
      Message bien reçu !
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
      Bonjour <strong style="color:#fff;">${input.nom}</strong>,<br>
      Nous avons bien reçu votre message et vous répondrons <strong style="color:#fff;">dans les 24 heures</strong>.
    </p>

    <p style="margin:0 0 8px;font-size:12px;color:#EC1C24;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Votre message</p>
    <div style="background:#1a1718;border-left:3px solid #EC1C24;padding:16px;font-size:14px;color:#ccc;line-height:1.7;white-space:pre-wrap;">${input.message}</div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:#1a1718;padding:16px;border-left:3px solid #EC1C24;">
      <tr><td>
        <p style="margin:0 0 6px;font-size:12px;color:#EC1C24;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Besoin d'une réponse rapide ?</p>
        <p style="margin:0;font-size:13px;color:#aaa;line-height:1.7;">
          Appelez-nous directement au <a href="tel:+41796512114" style="color:#EC1C24;">+41 79 651 21 14</a>
        </p>
      </td></tr>
    </table>
  `

  Promise.all([
    sendEmail({
      to: 'info@vsonus.ch',
      subject: `Nouveau message — ${input.nom}`,
      html: emailLayout('Nouveau message de contact', body),
    }),
    sendEmail({
      to: input.email,
      subject: 'V-Sonus — Votre message a bien été reçu',
      html: emailLayout('Message reçu', confirmationBody),
    }),
  ]).catch(err => console.error('[email] Erreur envoi email contact:', err))

  return { success: true }
}
