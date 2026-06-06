import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="flex justify-between items-center py-6 border-b border-slate-100">
      <Link href="/" className="text-2xl font-bold tracking-tighter">FurriHearts</Link>
      <div className="space-x-8 font-medium text-slate-600">
        <Link href="/" className="hover:text-black">Adopt</Link>
        <Link href="/match" className="hover:text-black">FurriMatch</Link>
      </div>
    </nav>
  );
}