// Static affiliate URLs for partner CTAs (landing page, results page next-steps).
// Per-domain Namecheap deep-links live in lib/affiliates.ts (Impact program 386170)
// so each domain card can pass a unique destination + subId for attribution.

const NAMECHEAP_AFFILIATE_BASE = 'https://namecheap.pxf.io/c/7230234/386170/5618'

function namecheapHomeUrl(): string {
  const params = new URLSearchParams({
    u: 'https://www.namecheap.com/',
    subId1: 'partners_card',
  })
  return `${NAMECHEAP_AFFILIATE_BASE}?${params.toString()}`
}

export const affiliateLinks = {
  bizee: {
    url: 'https://www.awin1.com/cread.php?awinmid=88819&awinaffid=2895975&ued=https%3A%2F%2Fbizee.com%2Fform-an-llc',
    label: 'Form your LLC with Bizee',
    disclosure: 'Affiliate partner',
  },
  namecheap: {
    url: namecheapHomeUrl(),
    label: 'Register your domain on Namecheap',
    disclosure: 'Affiliate partner',
  },
} as const
