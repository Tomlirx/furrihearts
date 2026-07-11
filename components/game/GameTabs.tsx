import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

// Server component: switcher between the mini games.
export async function GameTabs({ active }: { active: 'paw-match' | 'pet-2048' | 'flappy-kitten' | 'pet-tetris' }) {
  const t = await getTranslations('Game');
  return (
    <div className="game-tabs">
      <Link href="/game" className={`game-tab ${active === 'paw-match' ? 'active' : ''}`}>{t('tabPawMatch')}</Link>
      <Link href="/game/2048" className={`game-tab ${active === 'pet-2048' ? 'active' : ''}`}>{t('tab2048')}</Link>
      <Link href="/game/flappy" className={`game-tab ${active === 'flappy-kitten' ? 'active' : ''}`}>{t('tabFlappy')}</Link>
      <Link href="/game/tetris" className={`game-tab ${active === 'pet-tetris' ? 'active' : ''}`}>{t('tabTetris')}</Link>
    </div>
  );
}
