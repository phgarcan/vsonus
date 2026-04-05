/**
 * V-Sonus – Reset sort des packs dans l'ordre logique
 * Lance avec : node scripts/reset-sort-packs.mjs
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

// Ordre souhaite des packs (match partiel sur le nom)
// Ordre exact des packs (noms complets Directus)
const PACK_ORDER = [
  // Sonorisation
  'Pack Sono XS', 'Pack Sono Junior', 'Pack S', 'Pack M', 'Pack L', 'Pack XL', 'Pack XXL', 'Pack MAX',
  // DJ
  'Pack DJ XS', 'Pack DJ Junior', 'DJ Pack M', 'DJ Pack L', 'DJ Pack XL', 'DJ Pack XXL', 'DJ Pack MAX',
  'Pack Clé en main',
  // Concert
  'Pack Concert XS', 'Pack Concert Junior', 'Pack Concert M', 'Pack Concert L', 'Pack Concert XL', 'Pack Concert XXL', 'Pack Concert MAX',
  // Éclairage
  'Pack Light S', 'Pack Light M', 'Pack Light L', 'Pack Light XL', 'Pack Light XXL',
  // Scènes
  'Pack Scène 6×6', 'Pack Structure Line Array',
  // Mapping
  'Pack Mapping',
]

async function main() {
  console.log('Lecture des packs...')
  const packs = await client.request(readItems('packs', { limit: -1, fields: ['id', 'nom', 'sort'] }))
  console.log(`${packs.length} packs trouves\n`)

  // Matcher chaque pack a sa position
  const ordered = []
  const unmatched = []

  for (const pattern of PACK_ORDER) {
    const found = packs.find((p) => p.nom === pattern && !ordered.includes(p))
    if (found) {
      ordered.push(found)
    } else {
      console.log(`  !  Pattern "${pattern}" non trouve`)
    }
  }

  // Ajouter les packs non matches a la fin
  for (const p of packs) {
    if (!ordered.find((o) => o.id === p.id)) {
      unmatched.push(p)
    }
  }

  const all = [...ordered, ...unmatched]

  console.log('Mise a jour du sort...\n')
  for (let i = 0; i < all.length; i++) {
    const newSort = i + 1
    await client.request(updateItem('packs', all[i].id, { sort: newSort }))
    const marker = ordered.includes(all[i]) ? '+' : '?'
    console.log(`  ${marker}  sort=${String(newSort).padStart(2)} | ${all[i].nom}${all[i].sort !== newSort ? ` (etait ${all[i].sort ?? 'null'})` : ''}`)
  }

  // Verifier les equipements aussi
  console.log('\n--- Verification equipements ---')
  const equips = await client.request(readItems('equipements', { limit: -1, fields: ['id', 'nom', 'sort', 'categorie'] }))
  const noSort = equips.filter((e) => e.sort == null || e.sort === 0)
  const hasDupes = new Set(equips.map((e) => e.sort).filter((s) => s != null)).size !== equips.filter((e) => e.sort != null).length

  if (noSort.length > 0 || hasDupes) {
    console.log(`  ${noSort.length} equipements sans sort, doublons: ${hasDupes}`)
    // Trier par categorie puis nom, assigner sort sequentiel
    equips.sort((a, b) => {
      if (a.categorie !== b.categorie) return (a.categorie ?? '').localeCompare(b.categorie ?? '')
      return a.nom.localeCompare(b.nom)
    })
    for (let i = 0; i < equips.length; i++) {
      await client.request(updateItem('equipements', equips[i].id, { sort: i + 1 }))
    }
    console.log(`  -> ${equips.length} equipements re-tries par categorie+nom`)
  } else {
    console.log('  Equipements OK (pas de valeurs manquantes ou doublons)')
  }

  console.log('\nDone!')
}

main().catch((err) => { console.error(err); process.exit(1) })
