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
  const [figtree700, figtree500, spaceGrotesk700] = await Promise.all([
    loadGoogleFont('Figtree', 700),
    loadGoogleFont('Figtree', 500),
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
          background: 'linear-gradient(180deg, #ffffff 0%, #B7DDC2 65%, #297134 100%)',
          padding: 80,
          fontFamily: 'Figtree',
          position: 'relative',
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <svg width="64" height="44" viewBox="0 0 89 60" fill={BRAND_GREEN}>
            <path d="M12.3655 10.0973C18.3653 -0.702313 26.2496 -0.000330469 29.8655 0.597305C38.6653 2.19726 41.1987 10.2639 41.3655 14.0973C41.5321 19.2639 41.7655 31.5973 41.3655 39.5973C40.8655 49.5973 28.8655 64.5973 12.3655 57.0973C5.4187 53.9396 2.04424 48.7968 0.625241 43.7829C-1.51199 36.2303 2.21634 28.5921 5.97583 21.7018C7.80104 18.3566 9.96295 14.4219 12.3655 10.0973ZM20.7502 26.9996C14.1229 26.9996 8.75039 32.3724 8.75024 38.9996C8.75024 45.6271 14.1228 50.9996 20.7502 50.9996C27.3775 50.9995 32.7502 45.627 32.7502 38.9996C32.7501 32.3724 27.3775 26.9998 20.7502 26.9996Z" />
            <path d="M75.9707 9.78801C69.9708 -1.01161 62.0866 -0.309626 58.4707 0.28801C49.6709 1.88797 47.1375 9.95456 46.9707 13.788C46.804 18.9546 46.5707 31.288 46.9707 39.288C47.4707 49.288 59.4707 64.288 75.9707 56.788C82.9175 53.6303 86.2919 48.4875 87.7109 43.4736C89.8482 35.921 86.1198 28.2828 82.3604 21.3925C80.5351 18.0473 78.3732 14.1126 75.9707 9.78801ZM67.5859 26.6904C74.2133 26.6904 79.5858 32.0631 79.5859 38.6904C79.5859 45.3178 74.2134 50.6904 67.5859 50.6904C60.9586 50.6902 55.5859 45.3177 55.5859 38.6904C55.5861 32.0631 60.9587 26.6905 67.5859 26.6904Z" />
          </svg>
          <span
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: 44,
              fontWeight: 700,
              color: INK,
              letterSpacing: -1,
            }}
          >
            nameclaim
          </span>
        </div>

        {/* Articles label + headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 90,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: BRAND_GREEN,
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            Business Name Availability Checker
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 84,
              fontWeight: 700,
              color: INK,
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            <span>See if your business name</span>
            <span>is actually free.</span>
          </div>
        </div>

        {/* Coverage row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginTop: 36,
          }}
        >
          {['Trademark', 'Domain', 'Social'].map((label, i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                padding: '10px 18px',
                fontSize: 22,
                fontWeight: 500,
                color: '#374151',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: BRAND_GREEN,
                  display: 'inline-block',
                  marginRight: 2,
                  opacity: i === 2 ? 0.55 : i === 1 ? 0.8 : 1,
                }}
              />
              {label}
            </div>
          ))}
        </div>

        {/* URL footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: 0.5,
            }}
          >
            nameclaim.xyz
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            Free · No signup · 10 seconds
          </span>
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
