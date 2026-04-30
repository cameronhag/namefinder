import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'NameClaim — See if your business name is actually free'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BRAND_GREEN = '#297134'
const INK = '#0f172a'

async function loadGoogleFont(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    }
  ).then(r => r.text())
  const match = css.match(/src:\s*url\((https:[^)]+\.woff2)\)/)
  if (!match) throw new Error(`Failed to resolve font URL for ${family} ${weight}`)
  return fetch(match[1]).then(r => r.arrayBuffer())
}

export default async function Image() {
  const [figtree400, figtree500, figtree600, figtree700, spaceGrotesk700] = await Promise.all([
    loadGoogleFont('Figtree', 400),
    loadGoogleFont('Figtree', 500),
    loadGoogleFont('Figtree', 600),
    loadGoogleFont('Figtree', 700),
    loadGoogleFont('Space Grotesk', 700),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #ffffff 0%, #B7DDC2 60%, #297134 100%)',
          fontFamily: 'Figtree',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 48px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="36" height="24" viewBox="0 0 89 60" fill={INK}>
              <path d="M12.3655 10.0973C18.3653 -0.702313 26.2496 -0.000330469 29.8655 0.597305C38.6653 2.19726 41.1987 10.2639 41.3655 14.0973C41.5321 19.2639 41.7655 31.5973 41.3655 39.5973C40.8655 49.5973 28.8655 64.5973 12.3655 57.0973C5.4187 53.9396 2.04424 48.7968 0.625241 43.7829C-1.51199 36.2303 2.21634 28.5921 5.97583 21.7018C7.80104 18.3566 9.96295 14.4219 12.3655 10.0973ZM20.7502 26.9996C14.1229 26.9996 8.75039 32.3724 8.75024 38.9996C8.75024 45.6271 14.1228 50.9996 20.7502 50.9996C27.3775 50.9995 32.7502 45.627 32.7502 38.9996C32.7501 32.3724 27.3775 26.9998 20.7502 26.9996Z" />
              <path d="M75.9707 9.78801C69.9708 -1.01161 62.0866 -0.309626 58.4707 0.28801C49.6709 1.88797 47.1375 9.95456 46.9707 13.788C46.804 18.9546 46.5707 31.288 46.9707 39.288C47.4707 49.288 59.4707 64.288 75.9707 56.788C82.9175 53.6303 86.2919 48.4875 87.7109 43.4736C89.8482 35.921 86.1198 28.2828 82.3604 21.3925C80.5351 18.0473 78.3732 14.1126 75.9707 9.78801ZM67.5859 26.6904C74.2133 26.6904 79.5858 32.0631 79.5859 38.6904C79.5859 45.3178 74.2134 50.6904 67.5859 50.6904C60.9586 50.6902 55.5859 45.3177 55.5859 38.6904C55.5861 32.0631 60.9587 26.6905 67.5859 26.6904Z" />
            </svg>
            <span
              style={{
                fontFamily: 'Space Grotesk',
                fontSize: 26,
                fontWeight: 700,
                color: INK,
                letterSpacing: -0.5,
              }}
            >
              nameclaim
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {['How It Works', 'Features', 'FAQ', 'Guides'].map(label => (
              <span
                key={label}
                style={{ fontSize: 14, fontWeight: 500, color: '#4b5563' }}
              >
                {label}
              </span>
            ))}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: BRAND_GREEN,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 18px',
                borderRadius: 999,
              }}
            >
              Sign Up
            </div>
          </div>
        </div>

        {/* Hero */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '32px 48px 0',
          }}
        >
          {/* Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(41, 114, 52, 0.1)',
              color: '#1f2937',
              fontSize: 16,
              fontWeight: 500,
              padding: '8px 18px',
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            Availability Checker
          </div>

          {/* Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 64,
              fontWeight: 700,
              color: INK,
              letterSpacing: -2,
              lineHeight: 1.05,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <span>See if your business name</span>
            <span>is actually free</span>
          </div>

          {/* Coverage pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            {/* Trademark */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: 16,
                fontWeight: 500,
                color: '#374151',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11.25" fill="none" stroke={BRAND_GREEN} strokeWidth="1.5" />
                <text
                  x="12"
                  y="12.5"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Figtree"
                  fill={BRAND_GREEN}
                >
                  TM
                </text>
              </svg>
              Trademark
            </div>
            {/* Domain */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: 16,
                fontWeight: 500,
                color: '#374151',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Domain
            </div>
            {/* Social */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: 16,
                fontWeight: 500,
                color: '#374151',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Social
            </div>
          </div>

          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: 880,
              background: '#fff',
              borderRadius: 999,
              border: '1px solid #e5e7eb',
              padding: 8,
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 18px', gap: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span style={{ fontSize: 18, color: '#9ca3af' }}>Enter your business name</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 14px',
                fontSize: 16,
                fontWeight: 600,
                color: INK,
                borderLeft: '1px solid #f1f5f9',
              }}
            >
              Technology &amp; Software
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: BRAND_GREEN,
                color: '#fff',
                fontSize: 17,
                fontWeight: 600,
                padding: '14px 28px',
                borderRadius: 999,
              }}
            >
              Check Name →
            </div>
          </div>

          {/* Try row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 880,
              marginTop: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                Try
              </span>
              {['Acme', 'TechFlow', 'GreenLeaf'].map(t => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    padding: '4px 12px',
                    borderRadius: 999,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
              }}
            >
              Used by founders like you
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Figtree', data: figtree400, weight: 400, style: 'normal' },
        { name: 'Figtree', data: figtree500, weight: 500, style: 'normal' },
        { name: 'Figtree', data: figtree600, weight: 600, style: 'normal' },
        { name: 'Figtree', data: figtree700, weight: 700, style: 'normal' },
        { name: 'Space Grotesk', data: spaceGrotesk700, weight: 700, style: 'normal' },
      ],
    }
  )
}
