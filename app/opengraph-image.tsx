import { ImageResponse } from 'next/og'
import fs from 'node:fs'
import path from 'node:path'

export const alt = 'NameClaim — See if your business name is actually free'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BRAND_GREEN = '#297134'
const INK = '#0f172a'

function loadFont(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), 'node_modules', rel))
}

export default async function Image() {
  const figtree700 = loadFont('@fontsource/figtree/files/figtree-latin-700-normal.woff')
  const figtree500 = loadFont('@fontsource/figtree/files/figtree-latin-500-normal.woff')
  const spaceGrotesk700 = loadFont('@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff')

  const pillStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 999,
    padding: '10px 20px',
    fontSize: 20,
    fontWeight: 700,
    color: '#374151',
  } as const

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
            padding: '24px 56px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="44" height="30" viewBox="0 0 89 60" fill={INK}>
              <path d="M12.3655 10.0973C18.3653 -0.702313 26.2496 -0.000330469 29.8655 0.597305C38.6653 2.19726 41.1987 10.2639 41.3655 14.0973C41.5321 19.2639 41.7655 31.5973 41.3655 39.5973C40.8655 49.5973 28.8655 64.5973 12.3655 57.0973C5.4187 53.9396 2.04424 48.7968 0.625241 43.7829C-1.51199 36.2303 2.21634 28.5921 5.97583 21.7018C7.80104 18.3566 9.96295 14.4219 12.3655 10.0973ZM20.7502 26.9996C14.1229 26.9996 8.75039 32.3724 8.75024 38.9996C8.75024 45.6271 14.1228 50.9996 20.7502 50.9996C27.3775 50.9995 32.7502 45.627 32.7502 38.9996C32.7501 32.3724 27.3775 26.9998 20.7502 26.9996Z" />
              <path d="M75.9707 9.78801C69.9708 -1.01161 62.0866 -0.309626 58.4707 0.28801C49.6709 1.88797 47.1375 9.95456 46.9707 13.788C46.804 18.9546 46.5707 31.288 46.9707 39.288C47.4707 49.288 59.4707 64.288 75.9707 56.788C82.9175 53.6303 86.2919 48.4875 87.7109 43.4736C89.8482 35.921 86.1198 28.2828 82.3604 21.3925C80.5351 18.0473 78.3732 14.1126 75.9707 9.78801ZM67.5859 26.6904C74.2133 26.6904 79.5858 32.0631 79.5859 38.6904C79.5859 45.3178 74.2134 50.6904 67.5859 50.6904C60.9586 50.6902 55.5859 45.3177 55.5859 38.6904C55.5861 32.0631 60.9587 26.6905 67.5859 26.6904Z" />
            </svg>
            <span
              style={{
                fontFamily: 'Space Grotesk',
                fontSize: 32,
                fontWeight: 700,
                color: INK,
                letterSpacing: -0.8,
              }}
            >
              nameclaim
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              fontSize: 16,
              fontWeight: 500,
              color: '#4b5563',
            }}
          >
            <span>How It Works</span>
            <span>Features</span>
            <span>FAQ</span>
            <span>Guides</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: BRAND_GREEN,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                padding: '9px 20px',
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
            padding: '24px 56px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(41, 114, 52, 0.12)',
              color: '#1f2937',
              fontSize: 18,
              fontWeight: 500,
              padding: '10px 22px',
              borderRadius: 999,
              marginBottom: 22,
            }}
          >
            Availability Checker
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 70,
              fontWeight: 700,
              color: INK,
              letterSpacing: -2.5,
              lineHeight: 1.05,
              textAlign: 'center',
              marginBottom: 28,
            }}
          >
            <span>See if your business name</span>
            <span>is actually free</span>
          </div>

          {/* Coverage pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={pillStyle}>
              {/* Shield (lucide) */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BRAND_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
              Trademark
            </div>
            <div style={pillStyle}>
              {/* Globe (lucide) */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BRAND_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                <path d="M3 12h18" />
                <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
              </svg>
              Domain
            </div>
            <div style={pillStyle}>
              {/* AtSign (lucide) */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BRAND_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
              </svg>
              Socials
            </div>
          </div>

          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: 920,
              background: '#fff',
              borderRadius: 999,
              border: '1px solid #e5e7eb',
              padding: 10,
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 22px', gap: 14 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span style={{ fontSize: 22, fontWeight: 500, color: INK }}>Acme Solutions</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 18px',
                fontSize: 18,
                fontWeight: 700,
                color: INK,
                borderLeft: '1px solid #f1f5f9',
              }}
            >
              Technology &amp; Software
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: BRAND_GREEN,
                color: '#fff',
                fontSize: 19,
                fontWeight: 700,
                padding: '16px 32px',
                borderRadius: 999,
              }}
            >
              Check Name
            </div>
          </div>

          {/* Try row + founders proof */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 920,
              marginTop: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                Try
              </span>
              {['Acme', 'TechFlow', 'GreenLeaf'].map(t => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,0.22)',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 500,
                    padding: '6px 14px',
                    borderRadius: 999,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: 1.8,
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
        { name: 'Figtree', data: figtree700, weight: 700, style: 'normal' },
        { name: 'Figtree', data: figtree500, weight: 500, style: 'normal' },
        { name: 'Space Grotesk', data: spaceGrotesk700, weight: 700, style: 'normal' },
      ],
    }
  )
}
