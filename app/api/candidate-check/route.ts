import { NextResponse } from 'next/server'

interface Candidate {
  baseName: string
  domain: string             // e.g. "useprism.com"
  socialHandle: string       // consistent across Instagram + TikTok
  instagramAvailable: boolean
  tiktokAvailable: boolean
  linkedinName: string       // always equals baseName
  linkedinAvailable: boolean
}

const variantsFor = (name: string): string[] => {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return [n, `use${n}`, `get${n}`, `try${n}`, `${n}hq`, `${n}app`]
}

async function checkDomain(handle: string, origin: string): Promise<boolean> {
  try {
    const r = await fetch(`${origin}/api/domain?domain=${encodeURIComponent(handle)}`)
    if (!r.ok) return false
    const data = await r.json()
    return data?.available === true || data?.results?.[0]?.available === true
  } catch {
    return false
  }
}

async function checkSocials(handle: string, origin: string): Promise<Record<string, boolean>> {
  try {
    const r = await fetch(`${origin}/api/social?name=${encodeURIComponent(handle)}`)
    if (!r.ok) return {}
    const data = await r.json()
    const map: Record<string, boolean> = {}
    for (const s of data?.results ?? []) {
      map[s.platform] = !!s.available
    }
    return map
  } catch {
    return {}
  }
}

async function findDomain(baseName: string, origin: string): Promise<string | null> {
  for (const variant of variantsFor(baseName)) {
    if (await checkDomain(variant, origin)) return `${variant}.com`
  }
  return null
}

// Finds a handle available on BOTH Instagram and TikTok (consistent across the two)
async function findSocialHandle(
  baseName: string,
  origin: string,
): Promise<{ handle: string; instagram: boolean; tiktok: boolean } | null> {
  for (const variant of variantsFor(baseName)) {
    const socials = await checkSocials(variant, origin)
    if (socials.Instagram === true && socials.TikTok === true) {
      return { handle: variant, instagram: true, tiktok: true }
    }
  }
  return null
}

async function resolveCandidate(baseName: string, origin: string): Promise<Candidate | null> {
  const [domain, socialHandle, baseSocials] = await Promise.all([
    findDomain(baseName, origin),
    findSocialHandle(baseName, origin),
    checkSocials(baseName, origin),
  ])

  // Require domain + IG/TikTok handle to exist. LinkedIn status is informational.
  if (!domain || !socialHandle) return null

  return {
    baseName,
    domain,
    socialHandle: socialHandle.handle,
    instagramAvailable: socialHandle.instagram,
    tiktokAvailable: socialHandle.tiktok,
    linkedinName: baseName,
    linkedinAvailable: baseSocials.LinkedIn === true,
  }
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const names = (searchParams.get('names') ?? '').split(',').filter(Boolean).slice(0, 8)

  if (names.length === 0) return NextResponse.json({ candidates: [] })

  const resolved = await Promise.all(names.map(n => resolveCandidate(n, origin)))
  const candidates = resolved.filter((c): c is Candidate => c !== null).slice(0, 5)

  return NextResponse.json({ candidates })
}