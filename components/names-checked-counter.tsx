'use client'

import { useEffect, useState } from 'react'

function floorToPowerOfTen(count: number): number | null {
  if (count < 100) return null
  return Math.pow(10, Math.floor(Math.log10(count)))
}

export function NamesCheckedCounter({ fallback }: { fallback: string }) {
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
        // Counter is a nice-to-have. If it fails, render the fallback.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const bucketed = count !== null ? floorToPowerOfTen(count) : null
  if (bucketed === null) return <span>{fallback}</span>

  return <span>{bucketed.toLocaleString('en-US')}+ names checked</span>
}
