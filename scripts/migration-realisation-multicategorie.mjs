/**
 * V-Sonus – Migration réalisations : catégorie simple → multi-catégories (tags JSON)
 * 1. Change le type du champ categorie en JSON + interface tags
 * 2. Migre les données existantes (string → [string])
 * Lance avec : node scripts/migration-realisation-multicategorie.mjs
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

async function main() {
  // Étape 1 : Modifier le champ categorie → type json, interface tags
  console.log('1. Modification du champ categorie → JSON + tags...')
  try {
    const res = await fetch(`${DIRECTUS_URL}/fields/realisations/categorie`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        type: 'json',
        meta: {
          interface: 'tags',
          special: ['cast-json'],
          options: {
            presets: ['sonorisation', 'eclairage', 'scene', 'dj', 'concert', 'mapping', 'festival'],
            alphabetize: false,
          },
          note: 'Catégorie(s) de la réalisation. Plusieurs tags possibles.',
        },
      }),
    })
    if (res.ok) {
      console.log('   ✓ Champ converti en JSON + tags')
    } else {
      const body = await res.text()
      console.log(`   ⚠ Réponse ${res.status}: ${body}`)
    }
  } catch (err) {
    console.log(`   ⚠ Erreur: ${err.message}`)
  }

  // Étape 2 : Migrer les données existantes
  console.log('\n2. Migration des données...')
  const realisations = await client.request(readItems('realisations', {
    limit: -1,
    fields: ['id', 'titre', 'categorie'],
  }))

  console.log(`   ${realisations.length} réalisation(s) trouvée(s)`)

  let migrated = 0
  let skipped = 0

  for (const real of realisations) {
    // Déjà un tableau → skip
    if (Array.isArray(real.categorie)) {
      skipped++
      continue
    }

    // String simple → convertir en tableau
    const newValue = real.categorie ? [real.categorie] : []
    await client.request(updateItem('realisations', real.id, { categorie: newValue }))
    console.log(`   ✓ "${real.titre}" : "${real.categorie}" → ${JSON.stringify(newValue)}`)
    migrated++
  }

  console.log(`\n✓ Migration terminée : ${migrated} migré(s), ${skipped} déjà en tableau`)
}

main().catch((err) => { console.error(err); process.exit(1) })
