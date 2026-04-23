import { NextResponse } from 'next/server'

type Platform = 'Instagram' | 'TikTok' | 'LinkedIn'

const categoryModifiers: Record<string, { prefixes: string[]; suffixes: string[] }> = {
  Technology: {
    prefixes: ['get', 'try', 'use', 'my', 'io'],
    suffixes: ['app', 'tech', 'labs', 'studio', 'hq', 'ai'],
  },
  Food: {
    prefixes: ['eat', 'taste', 'savor', 'try', 'chez'],
    suffixes: ['eats', 'cafe', 'kitchen', 'bistro', 'bites', 'dining'],
  },
  Retail: {
    prefixes: ['shop', 'get', 'buy'],
    suffixes: ['shop', 'store', 'market', 'goods'],
  },
  Fashion: {
    prefixes: ['shop', 'wear', 'style'],
    suffixes: ['style', 'wear', 'boutique', 'threads'],
  },
  Health: {
    prefixes: ['try', 'my', 'go'],
    suffixes: ['health', 'wellness', 'care', 'vitality'],
  },
  Finance: {
    prefixes: ['get', 'try', 'my'],
    suffixes: ['finance', 'capital', 'wealth', 'money'],
  },
  Education: {
    prefixes: ['learn', 'study', 'my'],
    suffixes: ['academy', 'school', 'learning', 'courses'],
  },
  Other: {
    prefixes: ['get', 'try', 'my'],
    suffixes: ['hq', 'co', 'hub'],
  },
}

function categoryKey(raw: string): keyof typeof categoryModifiers {
  const c = raw.toLowerCase()
  if (c.startsWith('technology')) return 'Technology'
  if (c.startsWith('food')) return 'Food'
  if (c.startsWith('e-commerce') || c.startsWith('retail')) return 'Retail'
  if (c.startsWith('fashion')) return 'Fashion'
  if (c.startsWith('health')) return 'Health'
  if (c.startsWith('finance')) return 'Finance'
  if (c.startsWith('education')) return 'Education'
  return 'Other'
}

// Universal brand-signal prefixes — work across all categories
const brandSignals = ['the', 'real', 'official']

// Generate candidates per platform, respecting each platform's allowed characters
function generateCandidates(name: string, platform: Platform, catKey: keyof typeof categoryModifiers): string[] {
  const { prefixes, suffixes } = categoryModifiers[catKey]
  const candidates = new Set<string>()

  if (platform === 'LinkedIn') {
    // LinkedIn company slugs: letters, numbers, dashes only
    prefixes.forEach((p) => candidates.add(`${p}${name}`))
    suffixes.forEach((s) => candidates.add(`${name}${s}`))
    prefixes.slice(0, 3).forEach((p) => candidates.add(`${p}-${name}`))
    suffixes.slice(0, 3).forEach((s) => candidates.add(`${name}-${s}`))
    return Array.from(candidates).slice(0, 8)
  }

  // Instagram / TikTok: periods and underscores allowed — use them to escape namespace saturation
  // Tier 1 — periods (most likely available since few users use dots)
  prefixes.forEach((p) => candidates.add(`${p}.${name}`))
  suffixes.forEach((s) => candidates.add(`${name}.${s}`))
  brandSignals.forEach((b) => candidates.add(`${b}.${name}`))

  // Tier 2 — underscores
  prefixes.slice(0, 3).forEach((p) => candidates.add(`${p}_${name}`))
  suffixes.slice(0, 3).forEach((s) => candidates.add(`${name}_${s}`))

  // Tier 3 — plain concatenation (fallback, often taken for common names)
  prefixes.slice(0, 2).forEach((p) => candidates.add(`${p}${name}`))
  suffixes.slice(0, 2).forEach((s) => candidates.add(`${name}${s}`))

  return Array.from(candidates).slice(0, 12)
}

function profileUrl(platform: Platform, handle: string): string {
  if (platform === 'Instagram') return `https://www.instagram.com/${handle}/`
  if (platform === 'TikTok') return `https://www.tiktok.com/@${handle}`
  return `https://www.linkedin.com/company/${handle}`
}

async function checkInstagramHandle(handle: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch('https://instagram120.p.rapidapi.com/api/instagram/profile', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: handle }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return false
    const data = await res.json()
    return data?.success === false && !data?.result?.username
  } catch {
    clearTimeout(timeout)
    return false
  }
}

async function checkHandleViaHead(platform: Platform, handle: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch(profileUrl(platform, handle), {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    })
    clearTimeout(timeout)
    return res.status === 404
  } catch {
    clearTimeout(timeout)
    return false
  }
}

async function checkTikTokHandle(handle: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(`https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${encodeURIComponent(handle)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com',
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return false
    const data = await res.json()
    return data?.statusCode !== 0 || !data?.userInfo?.user?.uniqueId
  } catch {
    clearTimeout(timeout)
    return false
  }
}

async function checkHandle(platform: Platform, handle: string): Promise<boolean> {
  if (platform === 'Instagram') return checkInstagramHandle(handle)
  if (platform === 'TikTok') return checkTikTokHandle(handle)
  return checkHandleViaHead(platform, handle)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawName = searchParams.get('name') || ''
    const rawCategory = searchParams.get('category') || ''
    const platformsParam = searchParams.get('platforms') || 'Instagram,TikTok,LinkedIn'

    const name = rawName.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!name) return NextResponse.json({ suggestions: {} })

    const platforms = platformsParam.split(',').filter(Boolean) as Platform[]
    const catKey = categoryKey(rawCategory)

    // Generate candidates per-platform (LinkedIn uses dashes, IG/TikTok use dots/underscores)
    const jobs = platforms.flatMap((p) =>
      generateCandidates(name, p, catKey).map((h) => ({ platform: p, handle: h }))
    )

    const results = await Promise.all(
      jobs.map(async ({ platform, handle }) => ({
        platform,
        handle,
        available: await checkHandle(platform, handle),
      }))
    )

    const suggestions: Record<string, string[]> = {}
    for (const p of platforms) {
      suggestions[p] = results
        .filter((r) => r.platform === p && r.available)
        .map((r) => r.handle)
        .slice(0, 3)
    }

    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: {} })
  }
}