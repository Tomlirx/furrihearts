'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Pet } from '@/lib/pet-service';
import { Share2, Link2, Check } from '@/components/icons';
import { FacebookIcon, XIcon, WhatsAppIcon, TelegramIcon } from './shareIcons';

export function ShareButton({ pet }: { pet: Pet }) {
  const t = useTranslations('PetDetail.share');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<'link' | 'caption' | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Only shareable once the listing is publicly viewable — otherwise a
  // recipient just sees "not available".
  const shareable = !pet.is_hidden && (!pet.review_status || pet.review_status === 'approved');

  useEffect(() => { setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share); }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!shareable) return null;

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const detail = [pet.gender, pet.age, pet.breed, pet.location].filter(Boolean).join(' · ');
  const caption = t('caption', { name: pet.name, detail }).trim();
  const shareText = `${caption}\n${url}`;

  const copy = async (what: 'link' | 'caption') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? url : shareText);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch { /* clipboard blocked; ignore */ }
  };

  const nativeShare = async () => {
    try { await navigator.share({ title: `Adopt ${pet.name} · FurriHearts`, text: caption, url }); }
    catch { /* user cancelled */ }
  };

  const targets = [
    { key: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, Icon: FacebookIcon, color: '#1877F2' },
    { key: 'x', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(caption)}`, Icon: XIcon, color: 'var(--text)' },
    { key: 'whatsapp', href: `https://wa.me/?text=${encodeURIComponent(shareText)}`, Icon: WhatsAppIcon, color: '#25D366' },
    { key: 'telegram', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(caption)}`, Icon: TelegramIcon, color: '#26A5E4' },
  ] as const;

  return (
    <div className="share-wrap" ref={wrapRef}>
      <button
        type="button"
        className="share-trigger"
        onClick={() => (canNativeShare ? nativeShare() : setOpen((o) => !o))}
        aria-haspopup={!canNativeShare}
        aria-expanded={open}
      >
        <Share2 size={18} /> {t('shareThis')}
      </button>

      {open && !canNativeShare && (
        <div className="share-panel" role="menu">
          <div className="share-targets">
            {targets.map(({ key, href, Icon, color }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="share-target"
                style={{ color }}
                aria-label={t('shareOn', { platform: t(`platform.${key}`) })}
                onClick={() => setOpen(false)}
              >
                <Icon size={22} />
                <span>{t(`platform.${key}`)}</span>
              </a>
            ))}
          </div>
          <button type="button" className="share-copy" onClick={() => copy('link')}>
            {copied === 'link' ? <Check size={16} /> : <Link2 size={16} />}
            {copied === 'link' ? t('copied') : t('copyLink')}
          </button>
          <button type="button" className="share-copy" onClick={() => copy('caption')}>
            {copied === 'caption' ? <Check size={16} /> : <Share2 size={16} />}
            {copied === 'caption' ? t('captionCopied') : t('copyCaption')}
          </button>
          <p className="share-hint">{t('appHint')}</p>
        </div>
      )}
    </div>
  );
}
