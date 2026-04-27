import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// General API budget: covers domain/trademark/social searches and their follow-ups.
// One search burns ~3 immediate calls + a few follow-ups, so 100/min ≈ 10 searches/min.
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'rl:api',
})

// Feedback submissions are spam-prone — much tighter budget.
export const feedbackLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
  prefix: 'rl:feedback',
})

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '127.0.0.1'
}
