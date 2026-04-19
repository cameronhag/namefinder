import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('name')

  if (!raw) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const noSpaces = raw.toLowerCase().replace(/\s+/g, '')
  const withDashes = raw.toLowerCase().replace(/\s+/g, '-')

  const platforms = [
    { name: 'LinkedIn', url: `https://www.linkedin.com/company/${withDashes}`, exact: true },
    { name: 'Instagram', url: `https://www.instagram.com/${noSpaces}/`, exact: false },
    { name: 'TikTok', url: `https://www.tiktok.com/@${noSpaces}`, exact: false },
  ]

  const results = await Promise.all(
    platforms.map(async (platform) => {
      try {
        const response = await fetch(platform.url, { method: 'HEAD' })
        return {
          platform: platform.name,
          available: response.status === 404,
          exact: platform.exact,
          status: response.status,
        }
      } catch {
        return {
          platform: platform.name,
          available: false,
          exact: platform.exact,
          status: 'error',
        }
      }
    })
  )

  return NextResponse.json({ name: raw, results })
}