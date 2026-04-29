import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getAllGuides, getGuideBySlug } from '@/lib/guides'
import { mdxComponents } from '@/mdx-components'

const SITE_URL = 'https://nameclaim.xyz'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllGuides().map(g => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}

  const url = `${SITE_URL}/guides/${guide.frontmatter.slug}`
  return {
    title: guide.frontmatter.title,
    description: guide.frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: guide.frontmatter.title,
      description: guide.frontmatter.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.frontmatter.title,
      description: guide.frontmatter.description,
    },
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const all = getAllGuides()
  const related = all.filter(g => g.slug !== slug).slice(0, 3)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.frontmatter.title,
    description: guide.frontmatter.description,
    datePublished: guide.frontmatter.lastUpdated,
    dateModified: guide.frontmatter.lastUpdated,
    author: { '@type': 'Organization', name: 'NameClaim' },
    publisher: {
      '@type': 'Organization',
      name: 'NameClaim',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/guides/${guide.frontmatter.slug}`,
    },
  }

  const faqJsonLd =
    guide.frontmatter.faqs && guide.frontmatter.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: guide.frontmatter.faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-14 md:py-20">
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/guides" className="hover:text-gray-900">
              Guides
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-700">{guide.frontmatter.category}</span>
          </nav>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {guide.frontmatter.title}
          </h1>
          <p className="mb-2 text-lg text-gray-600">{guide.frontmatter.description}</p>
          <p className="mb-10 text-sm text-gray-500">
            Last updated {formatDate(guide.frontmatter.lastUpdated)}
          </p>

          <div className="text-gray-700">
            <MDXRemote source={guide.content} components={mdxComponents} />
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-gray-200 bg-gray-50 px-6 py-14 md:py-20">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">
                Related guides
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map(g => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#297134]">
                      {g.category}
                    </p>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {g.title}
                    </h3>
                    <p className="text-sm text-gray-500">{g.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-[#297134] px-6 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to claim your business name?
            </h2>
            <p className="mb-8 text-lg text-white">
              Check trademark, domain, and social availability in one search — free.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-black transition-colors hover:bg-gray-100"
            >
              Check a Name <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
