import { NextResponse } from 'next/server'

type InstagramProfile = {
  username: string
  fullName: string
  biography: string
  profilePicUrl: string
  isPrivate: boolean
  followerCount: number
  postCount: number
}

type PlatformResult = {
  platform: string
  available: boolean
  exact: boolean
  status: number | string
  profile?: InstagramProfile
}

async function checkInstagram(handle: string, profileUrl: string): Promise<PlatformResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch('https://instagram120.p.rapidapi.com/api/instagram/profile', {
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

    if (!response.ok) {
      return { platform: 'Instagram', available: false, exact: false, status: response.status }
    }

    const data = await response.json()
    const isAvailable = data?.success === false && !data?.result?.username

    let profile: InstagramProfile | undefined
    if (!isAvailable && data?.result) {
      const r = data.result
      profile = {
        username: r.username ?? handle,
        fullName: r.full_name ?? '',
        biography: r.biography ?? '',
        profilePicUrl: r.profile_pic_url ?? '',
        isPrivate: Boolean(r.is_private),
        followerCount: r.edge_followed_by?.count ?? 0,
        postCount: r.edge_owner_to_timeline_media?.count ?? 0,
      }
    }

    return {
      platform: 'Instagram',
      available: isAvailable,
      exact: true,
      status: response.status,
      ...(profile ? { profile } : {}),
    }
  } catch {
    clearTimeout(timeout)
    return { platform: 'Instagram', available: false, exact: false, status: 'error' }
  }
}

async function checkTikTok(handle: string, profileUrl: string): Promise<PlatformResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(`https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${encodeURIComponent(handle)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com',
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return { platform: 'TikTok', available: false, exact: false, status: response.status }
    }

    const data = await response.json()
    const user = data?.userInfo?.user
    const isAvailable = data?.statusCode !== 0 || !user?.uniqueId

    let profile: InstagramProfile | undefined
    if (!isAvailable && user) {
      const stats = data?.userInfo?.stats
      profile = {
        username: user.uniqueId ?? handle,
        fullName: user.nickname ?? '',
        biography: user.signature ?? '',
        profilePicUrl: user.avatarLarger ?? user.avatarMedium ?? user.avatarThumb ?? '',
        isPrivate: Boolean(user.privateAccount),
        followerCount: stats?.followerCount ?? 0,
        postCount: stats?.videoCount ?? 0,
      }
    }

    return {
      platform: 'TikTok',
      available: isAvailable,
      exact: true,
      status: response.status,
      ...(profile ? { profile } : {}),
    }
  } catch {
    clearTimeout(timeout)
    return { platform: 'TikTok', available: false, exact: false, status: 'error' }
  }
}

async function checkViaHead(
  name: string,
  url: string,
  exact: boolean
): Promise<PlatformResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, { method: 'HEAD', signal: controller.signal })
    clearTimeout(timeout)
    return {
      platform: name,
      available: response.status === 404,
      exact,
      status: response.status,
    }
  } catch {
    clearTimeout(timeout)
    return { platform: name, available: false, exact, status: 'error' }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('name')

  if (!raw) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const noSpaces = raw.toLowerCase().replace(/\s+/g, '')
  const withDashes = raw.toLowerCase().replace(/\s+/g, '-')

  const linkedinUrl = `https://www.linkedin.com/company/${withDashes}`
  const instagramUrl = `https://www.instagram.com/${noSpaces}/`
  const tiktokUrl = `https://www.tiktok.com/@${noSpaces}`

  const results = await Promise.all([
    checkViaHead('LinkedIn', linkedinUrl, true),
    checkInstagram(noSpaces, instagramUrl),
    checkTikTok(noSpaces, tiktokUrl),
  ])

  return NextResponse.json({ name: raw, results })
}