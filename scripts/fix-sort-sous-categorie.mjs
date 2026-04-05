/**
 * Repositionne sous_categorie juste après categorie dans Directus
 * Lance avec : node scripts/fix-sort-sous-categorie.mjs
 */

import { createDirectus, rest, staticToken, readFieldsByCollection, updateField } from '@directus/sdk'
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
} catch {
  console.error('Impossible de lire .env.local')
  process.exit(1)
}

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL)
  .with(staticToken(process.env.DIRECTUS_SERVER_TOKEN))
  .with(rest())

for (const col of ['equipements', 'packs']) {
  console.log(`\n--- ${col} ---`)
  const fields = await client.request(readFieldsByCollection(col))
  const catField = fields.find((f) => f.field === 'categorie')
  const scField = fields.find((f) => f.field === 'sous_categorie')

  console.log(`  categorie.sort = ${catField?.meta?.sort}`)
  console.log(`  sous_categorie.sort = ${scField?.meta?.sort}`)

  if (catField?.meta?.sort != null) {
    const newSort = catField.meta.sort + 1

    // Decaler les champs avec sort >= newSort (sauf sous_categorie elle-meme)
    const toShift = fields.filter(
      (f) => f.field !== 'sous_categorie' && f.meta?.sort != null && f.meta.sort >= newSort
    )
    for (const f of toShift) {
      await client.request(updateField(col, f.field, { meta: { sort: f.meta.sort + 1 } }))
    }

    await client.request(updateField(col, 'sous_categorie', { meta: { sort: newSort } }))
    console.log(`  -> sous_categorie repositionne a sort=${newSort}`)
  }
}

console.log('\nDone')
