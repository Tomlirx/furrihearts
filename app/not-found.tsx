import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🐾</div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
        Page Not <span style={{ color: 'var(--accent-soft)' }}>Found</span>
      </h1>
      <p style={{ color: 'var(--mid)', marginBottom: '24px', maxWidth: '400px' }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link href="/" style={{ background: 'var(--orange)', color: '#fff', borderRadius: '10px', padding: '12px 24px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
          Back Home
        </Link>
        <Link href="/browse" style={{ border: '1.5px solid var(--border)', color: 'var(--dark)', borderRadius: '10px', padding: '12px 24px', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
          Browse Pets
        </Link>
      </div>
    </main>
  );
}
