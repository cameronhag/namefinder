import { NextResponse } from 'next/server'

type RegisterAction = { type: string; name: string; url: string }

const categoryModifiers: Record<string, string[]> = {
  Technology: ['tech', 'soft', 'cloud', 'digital', 'solutions', 'apps', 'labs'],
  Food: ['kitchen', 'eats', 'bites', 'table', 'cafe'],
  Fashion: ['style', 'wear', 'boutique', 'collection'],
  Health: ['health', 'wellness', 'care', 'vitality'],
  Finance: ['finance', 'capital', 'wealth', 'invest'],
  Education: ['learning', 'academy', 'courses'],
  Retail: ['shop', 'store', 'market', 'mart'],
  Services: ['services', 'solutions', 'pro', 'experts'],
  Other: ['hub', 'co', 'group', 'central'],
}

const genericPrefixes = ['get', 'try', 'use', 'my']
const genericSuffixes = ['hq', 'app', 'co']

async function checkDomain(fqdn: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch(
      `https://domains-api.p.rapidapi.com/domains/${fqdn}?mode=cache`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'domains-api.p.rapidapi.com',
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeout)
    if (!res.ok) return { domain: fqdn, available: false }

    const data = await res.json()
    const available = data.availability === 'available'
    const register = Array.isArray(data.actions)
      ? (data.actions as RegisterAction[]).find((a) => a.type === 'register')
      : null

    return {
      domain: fqdn,
      available,
      registerUrl: register?.url,
      registrarName: register?.name,
    }
  } catch {
    clearTimeout(timeout)
    return { domain: fqdn, available: false }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawName = searchParams.get('domain') || ''
    const rawCategory = searchParams.get('category') || ''

    const clean = rawName.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!clean) return NextResponse.json({ suggestions: [] })

    // Frontend sends full category strings like "Technology & Software"
    // Match them by first word
    const categoryKey = (Object.keys(categoryModifiers).find((k) =>
      rawCategory.toLowerCase().startsWith(k.toLowerCase())
    ) ?? 'Other') as keyof typeof categoryModifiers

    const modifiers = categoryModifiers[categoryKey]
    const candidates = new Set<string>()
    modifiers.forEach((m) => candidates.add(`${clean}${m}.com`))
    genericPrefixes.forEach((p) => candidates.add(`${p}${clean}.com`))
    genericSuffixes.forEach((s) => candidates.add(`${clean}${s}.com`))

    const fqdns = Array.from(candidates).slice(0, 8)
    const results = await Promise.all(fqdns.map(checkDomain))

    const sorted = results.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1
      return a.domain.localeCompare(b.domain)
    })

    return NextResponse.json({ suggestions: sorted.slice(0, 5) })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}