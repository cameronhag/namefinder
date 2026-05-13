'use client'

import { useEffect, useState } from 'react'

export function NamesCheckedCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/stats/searches')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!cancelled && data && typeof data.count === 'number' && data.count > 0) {
          setCount(data.count)
        }
      })
      .catch(() => {
        // Counter is a nice-to-have. If it fails, render nothing.
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (count === null) return null

  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      {count.toLocaleString('en-US')} names checked
    </div>
  )
}
