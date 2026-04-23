import { NextResponse } from 'next/server'

interface Conflict {
  name: string
  status: string
  owner: string
  serialNumber: string
}

interface TrademarkResult {
  name: string
  totalConflicts: number
  similarCount: number
  conflict: boolean
  conflicts: Conflict[]
}

// In-memory cache — same name in the same dev session won't hit USPTO twice
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { value: TrademarkResult; expires: number }>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const cacheKey = name.toLowerCase().trim()
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.value)
  }

  try {
    const response = await fetch(
      `https://uspto-trademark.p.rapidapi.com/v1/trademarkSearch/${encodeURIComponent(name)}/active`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'uspto-trademark.p.rapidapi.com',
        },
      }
    )

    const bodyText = await response.text()

    // Surface any non-200 cleanly — do NOT fall through to "no conflicts"
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Upstream trademark lookup failed', name, upstreamStatus: response.status },
        { status: 502 }
      )
    }

    let data: unknown
    try {
      data = JSON.parse(bodyText)
    } catch {
      return NextResponse.json({ error: 'Invalid upstream body', name }, { status: 502 })
    }

    // Detect RapidAPI error envelopes that return 200 with a message but no items
    const dataObj = data as { items?: unknown; message?: string; error?: string }
    if (dataObj?.message || dataObj?.error) {
      return NextResponse.json(
        { error: dataObj.message || dataObj.error, name },
        { status: 502 }
      )
    }

    const items = Array.isArray(dataObj?.items) ? (dataObj.items as Record<string, unknown>[]) : []

    const normalizedQuery = name.toLowerCase().trim()
    const exact: Record<string, unknown>[] = []
    const similar: Record<string, unknown>[] = []
    for (const item of items) {
      const keyword = ((item.keyword as string) || '').toLowerCase().trim()
      if (keyword === normalizedQuery) exact.push(item)
      else similar.push(item)
    }

    const conflicts: Conflict[] = exact.map((item) => ({
      name: (item.keyword as string) || (item.description as string) || 'Unknown',
      status: (item.status_label as string) || (item.status as string) || 'Unknown',
      owner:
        (item.owner as string) ||
        (Array.isArray(item.owners) && item.owners.length > 0
          ? ((item.owners[0] as { name?: string })?.name ?? 'Unknown owner')
          : 'Unknown owner'),
      serialNumber: (item.serial_number as string) || (item.serialNumber as string) || '',
    }))

    const result: TrademarkResult = {
      name,
      totalConflicts: exact.length,
      similarCount: similar.length,
      conflict: exact.length > 0,
      conflicts,
    }

    cache.set(cacheKey, { value: result, expires: Date.now() + CACHE_TTL_MS })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Trademark search failed', name }, { status: 500 })
  }
}