'use server'

import { createItem } from '@directus/sdk'
import { getServerDirectus } from '@/lib/directus'
import { sendEmail, emailLayout, lignesTable } from '@/lib/email'
import { getLocationCoefficient, getCoefficientLabel } from '@/lib/pricing'
import type { CartItem } from '@/lib/store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClientData {
  nom: string
  email: string
  tel: string
  rue: string
  npa: string
  ville: string
  pays: string
  notes?: string
}

export interface ReservationInput {
  clientData: ClientData
  cartItems: CartItem[]
  startDate: string
  endDate: string
  nbJours: number
  totalHT: number
  besoinMontage: boolean
  besoinLivraison: boolean
}

export type ReservationResult =
  | { success: true; id: string }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Server Action principale
// ---------------------------------------------------------------------------

export async function soumettreReservation(
  input: ReservationInput
): Promise<ReservationResult> {
  const { clientData, cartItems, startDate, endDate, nbJours, totalHT, besoinMontage, besoinLivraison } = input

  if (!clientData.nom || !clientData.email || !clientData.tel || !clientData.rue || !clientData.npa || !clientData.ville) {
    return { success: false, error: 'Tous les champs obligatoires doivent être remplis.' }
  }
  if (!startDate || !endDate) {
    return { success: false, error: 'Les dates de location sont obligatoires.' }
  }
  if (cartItems.length === 0) {
    return { success: false, error: 'La sélection est vide.' }
  }

  try {
    const client = getServerDirectus()

    // 1. Créer la réservation
    const reservation = await client.request(
      createItem('reservations', {
        statut: 'en_attente_validation',
        nom_client: clientData.nom,
        email_client: clientData.email,
        tel_client: clientData.tel,
        adresse_evenement: `${clientData.rue}, ${clientData.npa} ${clientData.ville}, ${clientData.pays}`,
        notes: clientData.notes ?? '',
        date_debut: startDate,
        date_fin: endDate,
        total_ht: totalHT,
        besoin_montage: besoinMontage,
        besoin_livraison: besoinLivraison,
      })
    )

    const reservationId = (reservation as { id: string }).id

    // 2. Créer les lignes (coefficient de durée appliqué)
    const coefficient = getLocationCoefficient(nbJours) ?? 1
    const lignes = cartItems.map((item) => {
      const prix_unitaire = item.type === 'equipement' ? item.item.prix_journalier : item.item.prix_base
      const prix_total = prix_unitaire * coefficient * item.quantite
      return { item, prix_unitaire, prix_total }
    })

    await Promise.all(lignes.map(({ item, prix_unitaire, prix_total }) =>
      client.request(createItem('reservation_lignes', {
        reservation_id: reservationId,
        type: item.type,
        reference_id: item.item.id,
        label: item.item.nom,
        quantite: item.quantite,
        prix_unitaire,
        prix_total,
      }))
    ))

    // 3. Emails — non bloquants
    const lignesEmail = lignes.map(({ item, prix_total }) => ({
      label: item.item.nom,
      quantite: item.quantite,
      prix_total,
    }))

    sendEmails({ clientData, startDate, endDate, nbJours, coefficient, totalHT, besoinMontage, besoinLivraison, lignes: lignesEmail, reservationId })
      .catch(err => console.error('[email] Erreur envoi emails réservation:', err))

    return { success: true, id: reservationId }
  } catch (err) {
    console.error('[soumettreReservation] Erreur:', err)
    return { success: false, error: 'Une erreur est survenue lors de la soumission. Veuillez réessayer.' }
  }
}

// ---------------------------------------------------------------------------
// Envoi des emails (gérant + client)
// ---------------------------------------------------------------------------

async function sendEmails(data: {
  clientData: ClientData
  startDate: string
  endDate: string
  nbJours: number
  coefficient: number
  totalHT: number
  besoinMontage: boolean
  besoinLivraison: boolean
  lignes: Array<{ label: string; quantite: number; prix_total: number }>
  reservationId: string
}) {
  const { clientData, startDate, endDate, nbJours, coefficient, totalHT, besoinMontage, besoinLivraison, lignes, reservationId } = data
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? ''

  // ── A) Email au gérant ────────────────────────────────────────────────────
  const fraisHtml = (besoinMontage || besoinLivraison) ? `
    <p style="margin:8px 0 4px;font-size:12px;color:#EC1C24;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Frais obligatoires</p>
    ${besoinLivraison ? `<p style="margin:2px 0;font-size:13px;color:#ccc;">• Transport / Livraison</p>` : ''}
    ${besoinMontage   ? `<p style="margin:2px 0;font-size:13px;color:#ccc;">• Montage / Démontage</p>` : ''}
  ` : ''

  const gerantBody = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
      Nouvelle demande de devis
    </h2>
    <p style="margin:0 0 24px;font-size:13px;color:#EC1C24;">Réf. #${reservationId}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#888;width:130px;">Nom</td>
        <td style="padding:6px 0;font-size:13px;color:#fff;font-weight:700;">${clientData.nom}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#888;">Email</td>
        <td style="padding:6px 0;font-size:13px;color:#fff;">
          <a href="mailto:${clientData.email}" style="color:#EC1C24;">${clientData.email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#888;">Téléphone</td>
        <td style="padding:6px 0;font-size:13px;color:#fff;">
          <a href="tel:${clientData.tel}" style="color:#EC1C24;">${clientData.tel}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#888;vertical-align:top;">Adresse event</td>
        <td style="padding:6px 0;font-size:13px;color:#fff;">${clientData.rue}<br>${clientData.npa} ${clientData.ville}, ${clientData.pays}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#888;">Dates</td>
        <td style="padding:6px 0;font-size:13px;color:#fff;">${startDate} → ${endDate} <span style="color:#888;">(${nbJours} jour${nbJours > 1 ? 's' : ''}</span>${coefficient !== 1 ? ` <span style="color:#EC1C24;font-weight:700;">${getCoefficientLabel(nbJours)}</span>` : ''}<span style="color:#888;">)</span></td>
      </tr>
      ${clientData.notes ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#888;vertical-align:top;">Notes</td>
        <td style="padding:6px 0;font-size:13px;color:#ccc;">${clientData.notes}</td>
      </tr>` : ''}
    </table>

    ${lignesTable(lignes)}
    ${fraisHtml}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:2px solid #EC1C24;padding-top:12px;">
      <tr>
        <td style="font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">Total HT</td>
        <td style="font-size:20px;font-weight:900;color:#EC1C24;text-align:right;">${totalHT.toFixed(2)} CHF</td>
      </tr>
    </table>

    ${directusUrl ? `<p style="margin-top:28px;">
      <a href="${directusUrl}/admin/content/reservations/${reservationId}"
         style="display:inline-block;background:#EC1C24;color:#fff;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:10px 20px;text-decoration:none;">
        Traiter la demande →
      </a>
    </p>` : ''}
  `

  // ── B) Email de confirmation client ───────────────────────────────────────
  const clientBody = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">
      Demande reçue !
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
      Bonjour <strong style="color:#fff;">${clientData.nom}</strong>,<br>
      Votre demande de devis a bien été enregistrée. Notre équipe reviendra vers vous
      <strong style="color:#fff;">dans les 24 heures</strong>.
    </p>

    <p style="margin:0 0 8px;font-size:12px;color:#EC1C24;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
      Récapitulatif de votre demande
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#888;width:100px;">Dates</td>
        <td style="padding:5px 0;font-size:13px;color:#fff;">${startDate} → ${endDate} (${nbJours} jour${nbJours > 1 ? 's' : ''}${coefficient !== 1 ? ` <span style="color:#EC1C24;font-weight:700;">${getCoefficientLabel(nbJours)}</span>` : ''})</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#888;vertical-align:top;">Lieu</td>
        <td style="padding:5px 0;font-size:13px;color:#fff;">${clientData.rue}<br>${clientData.npa} ${clientData.ville}, ${clientData.pays}</td>
      </tr>
    </table>

    ${lignesTable(lignes)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:2px solid #EC1C24;padding-top:12px;">
      <tr>
        <td style="font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.1em;">Total estimatif HT</td>
        <td style="font-size:18px;font-weight:900;color:#EC1C24;text-align:right;">${totalHT.toFixed(2)} CHF</td>
      </tr>
    </table>

    <p style="margin:28px 0 12px;font-size:12px;color:#EC1C24;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">La suite du processus</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2728;">
          <span style="display:inline-block;background:#EC1C24;color:#fff;font-weight:900;font-size:11px;width:22px;height:22px;text-align:center;line-height:22px;margin-right:10px;flex-shrink:0;">1</span>
          <span style="font-size:13px;color:#ccc;">Nous vérifions la disponibilité du matériel pour vos dates.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2728;">
          <span style="display:inline-block;background:#EC1C24;color:#fff;font-weight:900;font-size:11px;width:22px;height:22px;text-align:center;line-height:22px;margin-right:10px;">2</span>
          <span style="font-size:13px;color:#ccc;">Vous recevez un devis officiel par email sous 24h.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2728;">
          <span style="display:inline-block;background:#EC1C24;color:#fff;font-weight:900;font-size:11px;width:22px;height:22px;text-align:center;line-height:22px;margin-right:10px;">3</span>
          <span style="font-size:13px;color:#ccc;">Vous validez le devis et réglez l'acompte pour confirmer la réservation.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <span style="display:inline-block;background:#EC1C24;color:#fff;font-weight:900;font-size:11px;width:22px;height:22px;text-align:center;line-height:22px;margin-right:10px;">4</span>
          <span style="font-size:13px;color:#ccc;">Livraison et installation le jour J par notre équipe.</span>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1718;padding:16px;border-left:3px solid #EC1C24;">
      <tr><td>
        <p style="margin:0 0 6px;font-size:12px;color:#EC1C24;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">À savoir</p>
        <p style="margin:0;font-size:13px;color:#aaa;line-height:1.7;">
          • Annulation gratuite jusqu'à 5 jours avant la date de l'événement.<br>
          • Ce récapitulatif est indicatif — le devis officiel vous sera transmis par email.<br>
          • Pour toute question : <a href="tel:+41796512114" style="color:#EC1C24;">+41 79 651 21 14</a><br>
          • En soumettant votre demande, vous acceptez nos <a href="https://vsonus.ch/conditions-generales" style="color:#EC1C24;">Conditions Générales</a>.
        </p>
      </td></tr>
    </table>
  `

  await Promise.all([
    sendEmail({
      to: 'info@vsonus.ch',
      subject: `Nouvelle demande de réservation — ${clientData.nom}`,
      html: emailLayout(`Devis #${reservationId}`, gerantBody),
    }),
    sendEmail({
      to: clientData.email,
      subject: `V-Sonus — Confirmation de votre demande de devis`,
      html: emailLayout('Confirmation de votre demande', clientBody),
    }),
  ])
}
