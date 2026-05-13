import { NextResponse } from 'next/server'
import { getSearchCount } from '@/lib/stats'

export const revalidate = 300

export async function GET() {
  const count = await getSearchCount()
  return NextResponse.json(
    { count },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  )
}
