import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('domain')

  if (!raw) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  const domain = raw.toLowerCase().replace(/\s+/g, '')
  const key = process.env.GODADDY_API_KEY
  const secret = process.env.GODADDY_API_SECRET

  const coreExtensions = ['.com', '.io', '.co']
  const extraExtensions = ['.app', '.dev', '.ai', '.tech', '.net', '.org', '.store', '.shop', '.biz', '.digital']
  const allExtensions = [...coreExtensions, ...extraExtensions]

  const allResults = await Promise.all(
    allExtensions.map(async (ext) => {
      const response = await fetch(
        `https://api.ote-godaddy.com/v1/domains/available?domain=${domain}${ext}`,
        {
          headers: {
            Authorization: `sso-key ${key}:${secret}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.json()
      return {
        domain: `${domain}${ext}`,
        available: data.available,
        core: coreExtensions.includes(ext),
      }
    })
  )

  return NextResponse.json({
    results: allResults.filter(d => d.core),
    extra: allResults.filter(d => !d.core && d.available),
  })
}