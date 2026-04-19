import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://uspto-trademark.p.rapidapi.com/v1/trademarkSearch/${name}/active`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'uspto-trademark.p.rapidapi.com',
        },
      }
    )

    const data = await response.json()
    const hits = data?.count || 0

    return NextResponse.json({
      name,
      totalConflicts: hits,
      conflict: hits > 0,
      results: data?.items || [],
    })

  } catch (error) {
    return NextResponse.json({ error: 'Trademark search failed' }, { status: 500 })
  }
}