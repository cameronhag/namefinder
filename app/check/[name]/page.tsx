import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { slugToName } from '@/lib/slug'
import ResultsPageWrapper, {
  type DomainApiResult,
  type TrademarkApiResult,
  type SocialApiResult,
} from '@/components/results-page-wrapper'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name: slug } = await params
  const name = slugToName(slug)

  return {
    title: `Is "${name}" available? Trademark, domain & social check`,
    description: `Check if "${name}" is available as a business name across federal trademarks, domain registrars, and social media handles. Free instant availability check.`,
    alternates: {
      canonical: `https://nameclaim.xyz/check/${slug}`,
    },
    openGraph: {
      title: `Is "${name}" available?`,
      description: `Trademark, domain, and social handle availability for "${name}".`,
      url: `https://nameclaim.xyz/check/${slug}`,
    },
  }
}

async function resolveBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  // Fall back to the request host so dev (localhost:3000) and preview deploys work
  // without requiring the env var to be set.
  const h = await headers()
  const host = h.get('host')
  if (!host) return 'https://nameclaim.xyz'
  const protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export default async function CheckPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name: slug } = await params
  const name = slugToName(slug)

  if (!name || name.length < 2) {
    notFound()
  }

  const baseUrl = await resolveBaseUrl()

  try {
    const [domainRes, trademarkRes, socialRes] = await Promise.all([
      fetch(`${baseUrl}/api/domain?domain=${encodeURIComponent(name)}`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${baseUrl}/api/trademark?name=${encodeURIComponent(name)}`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${baseUrl}/api/social?name=${encodeURIComponent(name)}`, {
        next: { revalidate: 3600 },
      }),
    ])

    if (!domainRes.ok || !trademarkRes.ok || !socialRes.ok) {
      throw new Error(`upstream_status_${domainRes.status}_${trademarkRes.status}_${socialRes.status}`)
    }

    const [domain, trademark, social]: [DomainApiResult, TrademarkApiResult, SocialApiResult] =
      await Promise.all([domainRes.json(), trademarkRes.json(), socialRes.json()])

    return (
      <ResultsPageWrapper
        name={name}
        results={{ domain, trademark, social }}
      />
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'unknown'
    return (
      <ResultsPageWrapper
        name={name}
        results={null}
        error={errorMessage}
      />
    )
  }
}
