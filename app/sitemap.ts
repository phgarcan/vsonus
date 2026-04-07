import type { MetadataRoute } from 'next'
import { getServerDirectus, CAT_LABELS, parseCategorie } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'
import { readItems } from '@directus/sdk'
import { PRESTATIONS } from './packs/data'

const SITE_URL = 'https://vsonus.ch'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const client = getServerDirectus()

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/catalogue`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/packs`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/realisations`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/gestion-evenementielle`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/conditions-generales`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/politique-de-confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Pages prestations (landing pages packs)
  const prestationPages: MetadataRoute.Sitemap = PRESTATIONS.map((p) => ({
    url: `${SITE_URL}/packs/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Pages catégorie
  const categoryPages: MetadataRoute.Sitemap = Object.keys(CAT_LABELS).map((cat) => ({
    url: `${SITE_URL}/catalogue/${cat}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Équipements : sous-catégories + pages produit
  const equipements = await client.request(
    readItems('equipements', { limit: -1, fields: ['slug', 'categorie', 'sous_categorie'] })
  ).catch(() => []) as Equipement[]

  const sousCatSet = new Set<string>()
  const sousCatPages: MetadataRoute.Sitemap = []
  for (const eq of equipements) {
    const cat = parseCategorie(eq.categorie)[0]
    const sousCat = eq.sous_categorie
    if (cat && sousCat) {
      const key = `${cat}/${sousCat}`
      if (!sousCatSet.has(key)) {
        sousCatSet.add(key)
        sousCatPages.push({
          url: `${SITE_URL}/catalogue/${cat}/${sousCat}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      }
    }
  }

  const productPages: MetadataRoute.Sitemap = equipements
    .filter((eq) => eq.slug && parseCategorie(eq.categorie)[0] && eq.sous_categorie)
    .map((eq) => ({
      url: `${SITE_URL}/catalogue/${parseCategorie(eq.categorie)[0]}/${eq.sous_categorie}/${eq.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  // Pages pack
  const packs = await client.request(
    readItems('packs', { limit: -1, fields: ['slug'] })
  ).catch(() => []) as Pack[]

  const packPages: MetadataRoute.Sitemap = packs
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/catalogue/pack/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  // Pages CMS
  const pages = await client.request(
    readItems('pages', { filter: { status: { _eq: 'published' } }, limit: -1, fields: ['slug'] })
  ).catch(() => []) as { slug: string }[]

  const cmsPages: MetadataRoute.Sitemap = pages
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

  return [
    ...staticPages,
    ...prestationPages,
    ...categoryPages,
    ...sousCatPages,
    ...productPages,
    ...packPages,
    ...cmsPages,
  ]
}
