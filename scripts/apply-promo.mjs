/**
 * V-Sonus – Appliquer une promo en masse sur les packs d'une catégorie
 * Usage : node scripts/apply-promo.mjs --categorie=sonorisation --pourcentage=20 --date-fin=2026-08-31
 * Options :
 *   --categorie    Catégorie cible (sonorisation, eclairage, scene, mapping, dj, concerts, scenes)
 *   --pourcentage  Pourcentage de réduction (0-100)
 *   --date-fin     Date d'expiration (format YYYY-MM-DD)
 *   --label        (optionnel) Label promo, ex: "Promo été -20%"
 *   --reset        (optionnel) Supprimer la promo de tous les packs de la catégorie
 */

import { createDirectus, rest, staticToken, readItems, updateItem } from '@directus/sdk'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch { process.exit(1) }

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL)
  .with(staticToken(process.env.DIRECTUS_SERVER_TOKEN))
  .with(rest())

// Parse des arguments CLI
function parseArgs() {
  const args = {}
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--(\w[\w-]*)(?:=(.+))?$/)
    if (match) args[match[1]] = match[2] ?? true
  }
  return args
}

async function main() {
  const args = parseArgs()

  if (!args.categorie) {
    console.error('Usage : node scripts/apply-promo.mjs --categorie=sonorisation --pourcentage=20 --date-fin=2026-08-31')
    console.error('Options : --label="Promo été" --reset')
    process.exit(1)
  }

  const categorie = args.categorie
  const reset = args.reset === true

  // Fetch les packs de la catégorie
  const packs = await client.request(readItems('packs', {
    filter: { categorie: { _eq: categorie } },
    limit: -1,
    fields: ['id', 'nom', 'prix_base', 'promo_pourcentage', 'promo_label', 'promo_date_fin'],
    sort: ['sort'],
  }))

  if (packs.length === 0) {
    console.log(`Aucun pack trouvé pour la catégorie "${categorie}"`)
    process.exit(0)
  }

  console.log(`${packs.length} pack(s) trouvé(s) pour la catégorie "${categorie}"\n`)

  if (reset) {
    // Mode reset : supprimer la promo
    for (const pack of packs) {
      await client.request(updateItem('packs', pack.id, {
        promo_pourcentage: null,
        promo_date_fin: null,
        promo_label: null,
      }))
    }
    console.log(`✓ Promo supprimée de ${packs.length} pack(s)`)
    return
  }

  // Mode application
  const pourcentage = parseInt(args.pourcentage, 10)
  const dateFin = args['date-fin']

  if (!pourcentage || pourcentage < 1 || pourcentage > 100) {
    console.error('--pourcentage doit être entre 1 et 100')
    process.exit(1)
  }
  if (!dateFin || !/^\d{4}-\d{2}-\d{2}$/.test(dateFin)) {
    console.error('--date-fin doit être au format YYYY-MM-DD')
    process.exit(1)
  }

  const label = args.label || `Promo -${pourcentage}%`

  // Appliquer
  const recap = []
  for (const pack of packs) {
    const prixCalcule = Math.round(pack.prix_base * (1 - pourcentage / 100))
    await client.request(updateItem('packs', pack.id, {
      promo_pourcentage: pourcentage,
      promo_date_fin: `${dateFin}T23:59:59`,
      promo_label: label,
    }))
    recap.push({
      Pack: pack.nom,
      'Prix base': `${pack.prix_base} CHF`,
      Réduction: `-${pourcentage}%`,
      'Prix promo': `${prixCalcule} CHF`,
      'Date fin': dateFin,
    })
  }

  console.table(recap)
  console.log(`\n✓ Promo -${pourcentage}% appliquée sur ${packs.length} pack(s) jusqu'au ${dateFin}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
