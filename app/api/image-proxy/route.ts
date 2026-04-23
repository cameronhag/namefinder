import { NextResponse } from 'next/server'

const ALLOWED_HOSTS = ['fbcdn.net', 'cdninstagram.com', 'tiktokcdn.com', 'tiktokcdn-us.com', 'licdn.com']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  if (!imageUrl) return NextResponse.json({ error: 'url required' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 })
  }

  if (!ALLOWED_HOSTS.some((h) => parsed.hostname.endsWith(h))) {
    return NextResponse.json({ error: 'host not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })
    if (!res.ok) return NextResponse.json({ error: 'upstream error' }, { status: res.status })

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}