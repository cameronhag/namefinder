import { NextResponse } from 'next/server'

type ProxyResponse = {
  domains?: Array<{
    domain: string
    available: boolean
    premium?: boolean
    premiumPrice?: number | null
    eapFee?: number | null
  }>
  error?: string
  details?: unknown
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('domain')

  if (!raw) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  const domain = raw.toLowerCase().replace(/\s+/g, '')
  const proxyUrl = process.env.NAMECHEAP_PROXY_URL
  const proxySecret = process.env.NAMECHEAP_PROXY_SECRET

  if (!proxyUrl || !proxySecret) {
    return NextResponse.json(
      { error: 'Namecheap proxy is not configured' },
      { status: 500 }
    )
  }

  const coreExtensions = ['.com', '.io', '.co']
  const extraExtensions = ['.app', '.dev', '.ai', '.tech', '.net', '.org', '.store', '.shop', '.biz', '.digital']
  const allExtensions = [...coreExtensions, ...extraExtensions]
  const fqdns = allExtensions.map(ext => `${domain}${ext}`)

  const response = await fetch(`${proxyUrl}/domains/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-proxy-secret': proxySecret,
    },
    body: JSON.stringify({ domains: fqdns }),
  })

  if (!response.ok) {
    const text = await response.text()
    return NextResponse.json(
      { error: 'Domain lookup failed', status: response.status, details: text },
      { status: 502 }
    )
  }

  const data = (await response.json()) as ProxyResponse
  const byDomain = new Map<string, boolean>()
  for (const d of data.domains ?? []) {
    byDomain.set(d.domain.toLowerCase(), d.available)
  }

  const allResults = allExtensions.map(ext => {
    const fqdn = `${domain}${ext}`
    return {
      domain: fqdn,
      available: byDomain.get(fqdn) ?? false,
      core: coreExtensions.includes(ext),
    }
  })

  return NextResponse.json({
    results: allResults.filter(d => d.core),
    extra: allResults.filter(d => !d.core && d.available),
  })
}
