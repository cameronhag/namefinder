import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const SEARCH_COUNT_KEY = 'stats:search_count'
const SEARCH_POPULARITY_KEY = 'stats:search_popularity'

/**
 * Increment the all-time search counter and the per-name popularity sorted set.
 * Called server-side on each successful /check/[name] render.
 */
export async function incrementSearchCount(slug: string): Promise<void> {
  try {
    await Promise.all([
      redis.incr(SEARCH_COUNT_KEY),
      redis.zincrby(SEARCH_POPULARITY_KEY, 1, slug),
    ])
  } catch {
    // Stat tracking must never block the page render.
  }
}

/**
 * Read the all-time search count. Returns 0 if Redis is unreachable so the UI
 * can render a non-zero placeholder elsewhere if needed.
 */
export async function getSearchCount(): Promise<number> {
  try {
    const value = await redis.get<number | string>(SEARCH_COUNT_KEY)
    if (value === null || value === undefined) return 0
    const n = typeof value === 'string' ? parseInt(value, 10) : value
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

/**
 * Get the top N most-searched name slugs, descending by check count.
 * Used by the sitemap to surface high-traffic pages.
 */
export async function getPopularSlugs(limit: number): Promise<string[]> {
  try {
    const result = await redis.zrange<string[]>(SEARCH_POPULARITY_KEY, 0, limit - 1, {
      rev: true,
    })
    return result ?? []
  } catch {
    return []
  }
}
