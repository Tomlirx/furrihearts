import Link from 'next/link';
export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6 border-b bg-white">
      <div className="text-2xl font-bold">Furri<span className="text-blue-600">Hearts</span></div>
      <div className="space-x-6">
        <Link href="/">Adopt</Link>
        <Link href="/quiz">FurriMatch</Link>
      </div>
    </nav>
  );
}