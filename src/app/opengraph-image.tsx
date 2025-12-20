import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'Opositaplace - Por opositores, para opositores';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // Using approximate hex values for the brand colors since OKLCH might not be fully supported in satori yet
  // Tropical Teal 600 approx: #0D9488 (standard teal-600) -> or closer to defined: #009ca6
  // Dusty Rose 50 approx: #fff1f2 (rose-50) -> or closer to defined: #fdf2f8

  const tropicalTeal = '#00897b'; // A nice teal close to the brand
  const dustyRoseBg = '#fff0f5'; // Lavender blush / soft pink

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dustyRoseBg,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          {/* Logo Icon representation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '30px',
              backgroundColor: tropicalTeal,
              marginBottom: '40px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: '#333',
              margin: '0 0 20px 0',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Opositaplace
          </h1>

          <p
            style={{
              fontSize: '32px',
              color: tropicalTeal,
              margin: 0,
              fontWeight: 600,
            }}
          >
            Por opositores, para opositores
          </p>

          <div
            style={{
              marginTop: '40px',
              padding: '12px 24px',
              backgroundColor: 'white',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              border: `2px solid ${tropicalTeal}`,
            }}
          >
            <p
              style={{
                fontSize: '20px',
                color: tropicalTeal,
                margin: 0,
                fontWeight: 600,
              }}
            >
              www.opositaplace.com
            </p>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
