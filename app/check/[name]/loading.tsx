'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { BinocularsLogo } from '@/components/binoculars-logo'

const STAGES = [
  'Searching USPTO trademark database…',
  'Checking domain availability across TLDs…',
  'Checking Instagram, TikTok, and LinkedIn handles…',
  'Compiling your verdict…',
]

export default function CheckLoading() {
  const [stage, setStage] = useState(0)
  const [name, setName] = useState<string>('')

  useEffect(() => {
    // Pull the slug from the URL so the skeleton can echo the name back.
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    const slug = path.split('/').filter(Boolean).pop() ?? ''
    if (slug) {
      const decoded = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      setName(decoded)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setStage(s => (s < STAGES.length - 1 ? s + 1 : s))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BinocularsLogo className="h-6 w-auto text-black" />
            <span
              className="text-2xl font-bold tracking-tight text-gray-900"
              style={{ fontFamily: 'var(--font-wordmark)' }}
            >
              nameclaim
            </span>
          </div>
          <div className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            Support
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col items-start gap-3">
          <div className="flex items-center gap-3 text-sm font-medium text-[#297134]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {STAGES[stage]}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {name ? `Checking ${name}…` : 'Checking your name…'}
          </h1>
          <p className="text-sm text-gray-500">
            Federal trademark, 13 domain TLDs, plus social handles. About 10 seconds.
          </p>
        </div>

        <div className="grid gap-4">
          <SkeletonCard rows={4} title="Trademark" />
          <SkeletonCard rows={5} title="Domains" />
          <SkeletonCard rows={3} title="Social handles" />
        </div>
      </main>
    </div>
  )
}

function SkeletonCard({ rows, title }: { rows: number; title: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between pb-3">
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        <span className="h-4 w-20 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
          >
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
