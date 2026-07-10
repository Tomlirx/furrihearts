'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from './icons';

// Light/dark toggle. The pre-hydration script in layout.tsx sets
// document.documentElement[data-theme] from localStorage before paint (no
// flash); this just reflects and updates it. With no explicit choice the CSS
// falls back to the OS via prefers-color-scheme.
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') setTheme(stored);
    else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch {}
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
