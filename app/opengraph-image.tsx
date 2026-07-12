import { ImageResponse } from 'next/og';

// Branded default share card (used when a page has no specific OG image).
// Code-only — no binary asset. Warm brand palette to match the site.
export const runtime = 'edge';
export const alt = "FurriHearts — Malaysia's Pet Adoption Platform";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FDF5EF 0%, #FBE8D8 55%, #F5CD9B 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* paw mark */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="#C8490A" style={{ marginBottom: 24 }}>
          <ellipse cx="6" cy="11" rx="2.4" ry="3.1" />
          <ellipse cx="18" cy="11" rx="2.4" ry="3.1" />
          <ellipse cx="9.7" cy="6.6" rx="2.3" ry="2.9" />
          <ellipse cx="14.3" cy="6.6" rx="2.3" ry="2.9" />
          <path d="M12 12.5c-3.2 0-5.7 2.4-5.7 5.1 0 2.1 1.6 3.4 3.6 3.4 1 0 1.6-.4 2.1-.4s1.1.4 2.1.4c2 0 3.6-1.3 3.6-3.4 0-2.7-2.5-5.1-5.7-5.1z" />
        </svg>
        <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, color: '#1A1008', letterSpacing: -1 }}>
          Furri<span style={{ color: '#C8490A' }}>Hearts</span>
        </div>
        <div style={{ fontSize: 34, color: '#5C4A3A', marginTop: 14 }}>
          Malaysia&apos;s Pet Adoption Platform
        </div>
      </div>
    ),
    { ...size },
  );
}
