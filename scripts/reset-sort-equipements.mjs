/**
 * V-Sonus – Reset sort des équipements dans l'ordre logique
 * Groupés par catégorie puis sous-catégorie, triés par prix croissant
 * Lance avec : node scripts/reset-sort-equipements.mjs
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

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL
const TOKEN = process.env.DIRECTUS_SERVER_TOKEN

const client = createDirectus(DIRECTUS_URL)
  .with(staticToken(TOKEN))
  .with(rest())

// Ordre des catégories et sous-catégories (correspond au MegaMenu + catégories secondaires)
const CATEGORY_ORDER = [
  { categorie: 'sonorisation', sous: ['enceintes', 'regie', 'micro'] },
  { categorie: 'eclairage', sous: ['lyres', 'projecteurs', 'cablage-dmx', 'barre-tout-en-un'] },
  { categorie: 'mapping', sous: ['videoprojecteurs', 'cablage-accessoires', 'laser'] },
  { categorie: 'scenes', sous: ['structures', 'praticables', 'levage', 'pavillons-tables'] },
  { categorie: 'cablage', sous: [] },
  { categorie: 'dj', sous: [] },
  { categorie: 'accessoires', sous: [] },
  { categorie: 'nettoyage', sous: [] },
  { categorie: 'levage', sous: [] },
]

async function main() {
  // Étape 1 : Activer sort_field sur la collection equipements
  console.log('1. Activation sort_field sur la collection equipements...')
  try {
    const res = await fetch(`${DIRECTUS_URL}/collections/equipements`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ meta: { sort_field: 'sort' } }),
    })
    if (res.ok) {
      console.log('   ✓ sort_field activé (ou déjà actif)')
    } else {
      const body = await res.text()
      console.log(`   ⚠ Réponse ${res.status}: ${body}`)
    }
  } catch (err) {
    console.log(`   ⚠ Erreur: ${err.message}`)
  }

  // Étape 2 : Fetch tous les équipements
  console.log('\n2. Lecture des équipements...')
  const equips = await client.request(readItems('equipements', {
    limit: -1,
    fields: ['id', 'nom', 'categorie', 'sous_categorie', 'prix_journalier', 'sort'],
  }))
  console.log(`   ${equips.length} équipements trouvés`)

  // Étape 3 : Construire la liste ordonnée
  const ordered = []
  const matched = new Set()

  for (const group of CATEGORY_ORDER) {
    const catItems = equips.filter(e => e.categorie === group.categorie)

    if (group.sous.length === 0) {
      // Pas de sous-catégories définies : trier par prix
      const sorted = catItems.sort((a, b) => (a.prix_journalier ?? 0) - (b.prix_journalier ?? 0))
      for (const item of sorted) {
        ordered.push(item)
        matched.add(item.id)
      }
    } else {
      // Sous-catégories dans l'ordre défini
      for (const sc of group.sous) {
        const scItems = catItems
          .filter(e => e.sous_categorie === sc)
          .sort((a, b) => (a.prix_journalier ?? 0) - (b.prix_journalier ?? 0))
        for (const item of scItems) {
          ordered.push(item)
          matched.add(item.id)
        }
      }
      // Items de cette catégorie avec une sous-catégorie non listée
      const remaining = catItems.filter(e => !matched.has(e.id))
        .sort((a, b) => (a.prix_journalier ?? 0) - (b.prix_journalier ?? 0))
      for (const item of remaining) {
        ordered.push(item)
        matched.add(item.id)
      }
    }
  }

  // Items qui n'appartiennent à aucune catégorie connue
  const unmatched = equips.filter(e => !matched.has(e.id))
    .sort((a, b) => (a.prix_journalier ?? 0) - (b.prix_journalier ?? 0))
  for (const item of unmatched) {
    ordered.push(item)
  }

  // Étape 4 : Update sort séquentiel
  console.log('\n3. Mise à jour du sort...\n')
  let currentCat = ''
  for (let i = 0; i < ordered.length; i++) {
    const item = ordered[i]
    const newSort = i + 1

    // Afficher un séparateur par catégorie
    if (item.categorie !== currentCat) {
      currentCat = item.categorie
      console.log(`\n   --- ${(currentCat || '???').toUpperCase()} ---`)
    }

    await client.request(updateItem('equipements', item.id, { sort: newSort }))
    const changed = item.sort !== newSort ? ` (était ${item.sort ?? 'null'})` : ''
    console.log(`   sort=${String(newSort).padStart(3)} | ${item.sous_categorie?.padEnd(20) ?? '(aucune)'.padEnd(20)} | ${item.prix_journalier?.toString().padStart(6) ?? '?'} CHF | ${item.nom}${changed}`)
  }

  console.log(`\n✓ ${ordered.length} équipements re-triés !`)
}

main().catch((err) => { console.error(err); process.exit(1) })
