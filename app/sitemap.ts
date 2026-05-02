import { MetadataRoute } from 'next'
import { SEED_NAMES } from '@/lib/seed-names'
import { nameToSlug } from '@/lib/slug'
import { getAllGuides } from '@/lib/guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nameclaim.xyz'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/affiliate-disclosure`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const checkPages: MetadataRoute.Sitemap = SEED_NAMES.map(name => ({
    url: `${baseUrl}/check/${nameToSlug(name)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const guidePages: MetadataRoute.Sitemap = getAllGuides().map(g => ({
    url: `${baseUrl}/guides/${g.slug}`,
    lastModified: new Date(g.lastUpdated),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...checkPages, ...guidePages]
}
