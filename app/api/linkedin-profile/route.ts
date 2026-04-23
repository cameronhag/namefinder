import { NextResponse } from 'next/server'

interface ProfilePreview {
  username: string
  fullName: string
  biography: string
  profilePicUrl: string
  isPrivate: boolean
  followerCount: number
  postCount: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get('handle')
  if (!handle) return NextResponse.json({ profile: null }, { status: 400 })

  const companyUrl = `https://www.linkedin.com/company/${encodeURIComponent(handle)}/`
  const apiUrl = `https://linkedin-profiles-companies-post-search.p.rapidapi.com/company?url=${encodeURIComponent(companyUrl)}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': 'linkedin-profiles-companies-post-search.p.rapidapi.com',
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json({ profile: null })
    }
    const json = await response.json()
    const data = json?.data
    if (!data || !data.name) {
      return NextResponse.json({ profile: null })
    }

    const profile: ProfilePreview = {
      username: data.handle ?? handle,
      fullName: data.name ?? '',
      biography: data.industry ?? '',
      profilePicUrl: data.logo ?? '',
      isPrivate: false,
      followerCount: data.followers ?? 0,
      postCount: data.employeeCount ?? 0,
    }

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ profile: null })
  }

}