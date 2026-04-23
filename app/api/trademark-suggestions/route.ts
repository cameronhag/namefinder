import { NextResponse } from 'next/server'

interface BrandIdea {
  name: string
  description: string
}

const SYSTEM_PROMPT = `You are a branding expert helping founders find a distinctive brand name after their first choice was taken.

Rules:
- Never suggest phonetic variations, misspellings, or additions to the taken name (no "Apple Co", "Appleify", "Appel", etc.)
- Prefer invented words, evocative metaphors, or unexpected combinations
- Each name must be 3-14 characters
- Suggest exactly 12 ideas
- For each idea, provide a one-sentence description of the vibe or meaning

Return ONLY a valid JSON array of objects with "name" and "description" fields. No prose, no markdown fences, just the JSON array.`

async function isTrademarkClear(candidate: string, origin: string): Promise<boolean> {
  try {
    const r = await fetch(`${origin}/api/trademark?name=${encodeURIComponent(candidate)}`)
    if (!r.ok) return false
    const data = await r.json()
    return !data.conflict
  } catch {
    return false
  }
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const name = searchParams.get('name') ?? ''
  const category = searchParams.get('category') ?? ''

  if (!name) return NextResponse.json({ ideas: [] })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Taken name: "${name}"\nBusiness category: ${category}\n\nSuggest 12 distinctive brand name ideas.`,
          },
        ],
      }),
    })

    if (!response.ok) return NextResponse.json({ ideas: [] })

    const data = await response.json()
    const text: string = data?.content?.[0]?.text ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ ideas: [] })

    const parsed = JSON.parse(match[0])
    const candidates: BrandIdea[] = Array.isArray(parsed) ? parsed : []

    // Check all candidates for trademark conflicts in parallel
    const checked = await Promise.all(
      candidates.map(async (idea) => ({
        idea,
        clear: await isTrademarkClear(idea.name, origin),
      }))
    )

    // Keep only clean ones, cap at 5
    const ideas = checked.filter(c => c.clear).slice(0, 5).map(c => c.idea)

    return NextResponse.json({ ideas })
  } catch {
    return NextResponse.json({ ideas: [] })
  }
}