import { MetadataRoute } from 'next'
import { SEED_NAMES } from '@/lib/seed-names'
import { nameToSlug } from '@/lib/slug'

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
  ]

  const checkPages: MetadataRoute.Sitemap = SEED_NAMES.map(name => ({
    url: `${baseUrl}/check/${nameToSlug(name)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...checkPages]
}
