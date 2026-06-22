import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const rawPrice = searchParams.get('price') ?? '';
  const visa = searchParams.get('visa') ?? '';
  const flag = searchParams.get('flag') ?? '';
  const airline = searchParams.get('airline') ?? '';

  const formattedPrice = Number(rawPrice).toLocaleString('fr-MA');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#15803d',
          padding: '60px 70px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Filigrane */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.05,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: 320,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: -8,
            }}
          >
            MML
          </span>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 1.5,
            }}
          >
            MEN MATAR L MATAR
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 18,
              marginTop: 6,
            }}
          >
            نسافر بذكاء
          </span>
        </div>

        {/* Itinéraire + Prix */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            {from} → {to}
          </span>
          <span
            style={{
              color: '#fbbf24',
              fontSize: 72,
              fontWeight: 900,
              marginTop: 20,
            }}
          >
            {formattedPrice} MAD
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <span style={{ color: '#ffffff', fontSize: 24, fontWeight: 600 }}>
            {flag} {visa}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 24, fontWeight: 600 }}>
            {airline}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
