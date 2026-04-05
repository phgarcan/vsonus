/**
 * V-Sonus – Ajouter le champ promo_pourcentage sur la collection packs
 * Lance avec : node scripts/add-promo-pourcentage.mjs
 */

import { createDirectus, rest, staticToken, createField } from '@directus/sdk'
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

async function main() {
  console.log('Ajout du champ promo_pourcentage sur la collection packs...')

  try {
    await client.request(createField('packs', {
      field: 'promo_pourcentage',
      type: 'integer',
      meta: {
        width: 'half',
        group: 'promotion_group',
        interface: 'input',
        options: { min: 0, max: 100, step: 1, placeholder: 'ex: 20' },
        note: 'Pourcentage de réduction (0-100). Le prix promo est calculé automatiquement.',
        sort: 1,
      },
      schema: { is_nullable: true, default_value: null },
    }))
    console.log('✓ Champ promo_pourcentage créé avec succès')
  } catch (err) {
    if (err?.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS' || err?.message?.includes('already exists')) {
      console.log('✓ Champ promo_pourcentage existe déjà')
    } else {
      throw err
    }
  }

  console.log('\nDone!')
}

main().catch((err) => { console.error(err); process.exit(1) })
