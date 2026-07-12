import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/site';

// Per-pet share card: a fixed 1200x630 image with the pet photo baked in, so
// social platforms get a correctly-sized, always-absolute image instead of the
// raw upload (which can be >5MB / odd aspect / a relative /img-*.png path and
// then renders tiny or not at all).
export const alt = 'Adopt this pet on FurriHearts';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PawMark = ({ w = 96 }: { w?: number }) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="#fff">
    <ellipse cx="6" cy="11" rx="2.4" ry="3.1" />
    <ellipse cx="18" cy="11" rx="2.4" ry="3.1" />
    <ellipse cx="9.7" cy="6.6" rx="2.3" ry="2.9" />
    <ellipse cx="14.3" cy="6.6" rx="2.3" ry="2.9" />
    <path d="M12 12.5c-3.2 0-5.7 2.4-5.7 5.1 0 2.1 1.6 3.4 3.6 3.4 1 0 1.6-.4 2.1-.4s1.1.4 2.1.4c2 0 3.6-1.3 3.6-3.4 0-2.7-2.5-5.1-5.7-5.1z" />
  </svg>
);

function brandCard() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FDF5EF 0%, #FBE8D8 55%, #F5CD9B 100%)', fontFamily: 'sans-serif' }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="#C8490A" style={{ marginBottom: 20 }}>
          <ellipse cx="6" cy="11" rx="2.4" ry="3.1" /><ellipse cx="18" cy="11" rx="2.4" ry="3.1" />
          <ellipse cx="9.7" cy="6.6" rx="2.3" ry="2.9" /><ellipse cx="14.3" cy="6.6" rx="2.3" ry="2.9" />
          <path d="M12 12.5c-3.2 0-5.7 2.4-5.7 5.1 0 2.1 1.6 3.4 3.6 3.4 1 0 1.6-.4 2.1-.4s1.1.4 2.1.4c2 0 3.6-1.3 3.6-3.4 0-2.7-2.5-5.1-5.7-5.1z" />
        </svg>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#1A1008' }}>Furri<span style={{ color: '#C8490A' }}>Hearts</span></div>
        <div style={{ fontSize: 32, color: '#5C4A3A', marginTop: 12 }}>Malaysia&apos;s Pet Adoption Platform</div>
      </div>
    ),
    { ...size },
  );
}

export default async function PetOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!base || !key) return brandCard();

    const res = await fetch(
      `${base}/rest/v1/pets?id=eq.${encodeURIComponent(id)}&select=name,breed,age,gender,location,image_url,is_hidden,review_status&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' },
    );
    const rows = res.ok ? await res.json() : [];
    const pet = rows?.[0];

    // Not found / not public → generic brand card (don't leak the photo).
    if (!pet || pet.is_hidden || (pet.review_status && pet.review_status !== 'approved')) {
      return brandCard();
    }

    let img: string | null = pet.image_url || null;
    if (img && img.startsWith('/')) img = `${SITE_URL}${img}`; // relative fallback assets

    const detail = [pet.gender, pet.age, pet.breed, pet.location].filter(Boolean).join('  ·  ');

    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#1A1008', fontFamily: 'sans-serif' }}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #E8833A, #C8490A)' }} />
          )}
          {/* bottom scrim for text legibility */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(to top, rgba(20,12,7,0.92) 0%, rgba(20,12,7,0.55) 55%, rgba(20,12,7,0) 100%)' }} />
          {/* brand chip top-left */}
          <div style={{ position: 'absolute', top: 40, left: 44, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(200,73,10,0.92)', padding: '12px 20px', borderRadius: 999 }}>
            <PawMark w={30} />
            <span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>FurriHearts</span>
          </div>
          {/* text */}
          <div style={{ position: 'absolute', left: 52, bottom: 48, right: 52, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#FDD9A8' }}>Adopt me</div>
            <div style={{ fontSize: 88, fontWeight: 800, color: '#fff', lineHeight: 1.05, marginTop: 4 }}>{pet.name}</div>
            {detail ? <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.9)', marginTop: 10 }}>{detail}</div> : null}
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
    return brandCard();
  }
}
