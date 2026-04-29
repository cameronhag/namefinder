import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getAllGuides } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Practical guides on checking business name availability, trademark conflicts, domain choices, and social handles — written for founders.',
  alternates: { canonical: 'https://nameclaim.xyz/guides' },
  openGraph: {
    type: 'website',
    url: 'https://nameclaim.xyz/guides',
    title: 'Guides | NameClaim',
    description:
      'Practical guides on checking business name availability, trademark conflicts, domain choices, and social handles.',
  },
}

export default function GuidesIndexPage() {
  const guides = getAllGuides()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-gray-200 px-6 py-14 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#297134]">
              Articles
            </p>
            <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Guides for founders naming a business
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-500">
              Step-by-step articles on trademark searches, domain strategy, social handle
              availability, and the legal pitfalls that quietly kill brands.
            </p>
          </div>
        </section>

        <section className="px-6 py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            {guides.length === 0 ? (
              <p className="text-center text-gray-500">
                Guides are coming soon. Check back shortly.
              </p>
            ) : (
              <ul className="grid gap-6 md:grid-cols-2">
                {guides.map(g => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="block h-full rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#297134]">
                        {g.category}
                      </p>
                      <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        {g.title}
                      </h2>
                      <p className="text-sm text-gray-500">{g.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
