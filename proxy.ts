import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { apiLimiter, feedbackLimiter, getClientIp } from '@/lib/ratelimit'

export async function proxy(request: NextRequest) {
  const ip = getClientIp(request)
  const isFeedback = request.nextUrl.pathname.startsWith('/api/feedback')
  const limiter = isFeedback ? feedbackLimiter : apiLimiter

  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(retryAfter),
        },
      }
    )
  }

  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', String(limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  return response
}

export const config = {
  matcher: '/api/:path*',
}
