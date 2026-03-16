import { readItems } from '@directus/sdk'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getServerDirectus, getImageUrl } from '@/lib/directus'
import type { Page, PageBlock } from '@/lib/directus'
import { HeroBlock } from '@/components/blocks/HeroBlock'
import { TextImageBlock } from '@/components/blocks/TextImageBlock'
import { FeaturesGridBlock } from '@/components/blocks/FeaturesGridBlock'
import { CtaBlock } from '@/components/blocks/CtaBlock'
import { LogoCloudBlock } from '@/components/blocks/LogoCloudBlock'
import type { HeroBlockData } from '@/components/blocks/HeroBlock'
import type { TextImageBlockData } from '@/components/blocks/TextImageBlock'
import type { FeaturesGridBlockData } from '@/components/blocks/FeaturesGridBlock'
import type { CtaBlockData } from '@/components/blocks/CtaBlock'
import type { LogoCloudBlockData } from '@/components/blocks/LogoCloudBlock'

// ISR : revalidation toutes les 60 secondes
export const revalidate = 60

// ---------------------------------------------------------------------------
// Génération des métadonnées SEO dynamiques
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const pages = await getServerDirectus()
    .request(
      readItems('pages', {
        filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
        limit: 1,
        fields: ['title', 'meta_description'],
      })
    )
    .catch(() => [])

  const page = (pages as Page[])[0]
  if (!page) return { title: 'Page introuvable – V-Sonus' }

  return {
    title: `${page.title} – V-Sonus`,
    description: page.meta_description ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// Page principale (Server Component)
// ---------------------------------------------------------------------------

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const pages = await getServerDirectus()
    .request(
      readItems('pages', {
        filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
        limit: 1,
        fields: ['id', 'slug', 'title', 'meta_description', 'content', 'status'],
      })
    )
    .catch(() => [])

  const page = (pages as Page[])[0]
  if (!page) notFound()

  const hasHero = page.content?.[0]?.collection === 'block_hero'

  return (
    <div className={hasHero ? '' : 'max-w-7xl mx-auto px-6 py-12'}>
      {page.content?.map((block) => (
        <div key={block.id} className={hasHero && block.collection !== 'block_hero' ? 'max-w-7xl mx-auto px-6' : ''}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Moteur de rendu des blocs CMS
// ---------------------------------------------------------------------------

function renderBlock(block: PageBlock) {
  switch (block.collection) {
    case 'block_hero':
      return <HeroBlock data={block.item as unknown as HeroBlockData} />

    case 'block_texte_image':
      return <TextImageBlock data={block.item as unknown as TextImageBlockData} />

    case 'block_features':
      return <FeaturesGridBlock data={block.item as unknown as FeaturesGridBlockData} />

    case 'block_cta':
      return <CtaBlock data={block.item as unknown as CtaBlockData} />

    case 'block_logos':
      return <LogoCloudBlock data={block.item as unknown as LogoCloudBlockData} />

    // Anciens types de blocs (compatibilité)
    case 'block_texte': {
      const d = block.item as unknown as { titre?: string; contenu: string }
      return (
        <section className="py-10">
          {d.titre && (
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4 border-l-4 border-vsonus-red pl-4">
              {d.titre}
            </h2>
          )}
          <div
            className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: d.contenu }}
          />
        </section>
      )
    }

    case 'block_galerie': {
      const d = block.item as unknown as { images: Array<{ id: string; directus_files_id: string; titre?: string }> }
      return (
        <section className="py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {d.images.map((img) => {
              const url = getImageUrl(img.directus_files_id, { width: '600', height: '400', fit: 'cover' })
              if (!url) return null
              return (
                <div key={img.id} className="relative h-48 overflow-hidden border border-gray-800 hover:border-vsonus-red transition-colors">
                  <Image src={url} alt={img.titre ?? ''} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                </div>
              )
            })}
          </div>
        </section>
      )
    }

    default:
      return null
  }
}
