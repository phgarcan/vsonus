import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'V-Sonus <info@vsonus.ch>'

const LOGO_URL = 'https://dev.vsonus.ch/logo-vsonus-email.png'

// ---------------------------------------------------------------------------
// Fonction générique
// ---------------------------------------------------------------------------

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const { error } = await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: opts.subject,
    html:    opts.html,
  })
  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Wrapper HTML — dark theme V-Sonus
// ---------------------------------------------------------------------------

export function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#000;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#231F20;border-top:3px solid #EC1C24;">
        <tr>
          <td style="padding:24px 32px 20px;border-bottom:1px solid #333;">
            <img src="${LOGO_URL}" alt="V-Sonus" width="150" style="display:block;margin-bottom:4px;" />
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #333;font-size:11px;color:#666;line-height:1.6;">
            V-Sonus – Paul Villommet &nbsp;·&nbsp; Rue des Bosquets 17, 1800 Vevey<br>
            <a href="tel:+41796512114" style="color:#EC1C24;text-decoration:none;">+41 79 651 21 14</a>
            &nbsp;·&nbsp;
            <a href="mailto:info@vsonus.ch" style="color:#EC1C24;text-decoration:none;">info@vsonus.ch</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Helper : tableau matériel
// ---------------------------------------------------------------------------

export function lignesTable(lignes: Array<{ label: string; quantite: number; prix_total: number }>): string {
  const rows = lignes.map(l => `
    <tr>
      <td style="padding:8px 0;color:#ccc;font-size:14px;border-bottom:1px solid #333;">${l.label}</td>
      <td style="padding:8px 0;color:#ccc;font-size:14px;border-bottom:1px solid #333;text-align:center;">×${l.quantite}</td>
      <td style="padding:8px 0;color:#fff;font-size:14px;border-bottom:1px solid #333;text-align:right;font-weight:700;">${l.prix_total.toFixed(2)} CHF</td>
    </tr>`).join('')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr>
      <th style="text-align:left;font-size:11px;color:#EC1C24;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:8px;border-bottom:1px solid #EC1C24;">Matériel</th>
      <th style="text-align:center;font-size:11px;color:#EC1C24;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:8px;border-bottom:1px solid #EC1C24;">Qté</th>
      <th style="text-align:right;font-size:11px;color:#EC1C24;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:8px;border-bottom:1px solid #EC1C24;">Prix</th>
    </tr>
    ${rows}
  </table>`
}
