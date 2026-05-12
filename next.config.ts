import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const csp = [
  "default-src 'self'",
  // Next.js + Tailwind require unsafe-inline; unsafe-eval kept for compatibility with Next dev tooling and some runtime libs.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // img-src is intentionally broad: badges, founder avatars, linkedin profile previews via image-proxy, OG images, etc.
  "img-src 'self' data: blob: https:",
  // PostHog events route through the t.nameclaim.xyz proxy.
  "connect-src 'self' https://t.nameclaim.xyz https://us.i.posthog.com https://us-assets.i.posthog.com",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  // 2-year HSTS with preload — required to be eligible for browser preload lists.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()',
  },
  { key: 'Content-Security-Policy', value: csp },
]

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-gfm'],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
