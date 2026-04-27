// Namecheap deep-link via Impact — program ID 386170 supports ?u= deep linking
const NAMECHEAP_AFFILIATE_BASE = 'https://namecheap.pxf.io/c/7230234/386170/5618'

export function namecheapUrl(domain: string): string {
  const destination = `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`
  const params = new URLSearchParams({
    u: destination,
    subId1: domain, // pass-through tracking — surfaces in Impact reports
  })
  return `${NAMECHEAP_AFFILIATE_BASE}?${params.toString()}`
}

export function trademarkFilingUrl(name: string): string {
  // Placeholder until Trademark Engine approves
  const affid = process.env.NEXT_PUBLIC_TRADEMARK_AFFID
  const base = 'https://www.trademarkengine.com/trademark-search'
  const params = new URLSearchParams({ search: name })
  if (affid) params.set('aff', affid)
  return `${base}?${params.toString()}`
}