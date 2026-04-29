import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'NameClaim — Claim a name no one can take from you'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #ffffff 0%, #B7DDC2 60%, #297134 100%)',
          padding: 88,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 'auto' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              background: '#297134',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path d="M20 3v4" />
              <path d="M22 5h-4" />
              <path d="M4 17v2" />
              <path d="M5 18H3" />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: '#0f172a', letterSpacing: -1 }}>
            nameclaim
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 76,
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: -2,
            lineHeight: 1.1,
            marginBottom: 32,
          }}
        >
          <div>Claim a name no one</div>
          <div>can take from you.</div>
        </div>

        {/* Subhead */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 28,
            fontWeight: 500,
            color: '#1f3d44',
            lineHeight: 1.3,
          }}
        >
          <div>Trademark, domain, and social handles —</div>
          <div>checked in one search.</div>
        </div>

        {/* URL footer */}
        <div
          style={{
            marginTop: 'auto',
            fontSize: 22,
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: 0.5,
          }}
        >
          nameclaim.xyz
        </div>
      </div>
    ),
    { ...size }
  )
}
