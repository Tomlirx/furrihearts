import Link from 'next/link';

// Root-level fallback — only reached when the URL's locale segment itself is
// invalid (e.g. /xx/browse), since that's caught above app/[locale]/layout.tsx
// before it can render that segment's own not-found.tsx. Normal 404s inside a
// valid locale are handled by app/[locale]/not-found.tsx instead.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '80px', marginBottom: '16px' }}>🐾</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Page Not Found</h1>
          <p style={{ color: '#666', marginBottom: '24px', maxWidth: '400px' }}>
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <Link href="/" style={{ background: '#E8744C', color: '#fff', borderRadius: '10px', padding: '12px 24px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
            Back Home
          </Link>
        </main>
      </body>
    </html>
  );
}
