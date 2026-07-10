import '../styles.css';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { IntlScope } from '@/components/IntlScope';
import GameClient from '@/components/game/GameClient';
import { GameTabs } from '@/components/game/GameTabs';
import { getLeaderboard } from '@/app/actions/game';

export default async function Pet2048Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations('Game2048');
  const leaderboard = await getLeaderboard('pet-2048');

  return (
    <div className="game-page">
      <div className="game-hero">
        <div className="page-tag">{t('tag')}</div>
        <h1 className="game-title">{t('title')}</h1>
        <p className="game-sub">{t('subtitle')}</p>
      </div>
      <GameTabs active="pet-2048" />
      <IntlScope namespaces={['Game', 'Game2048']}>
        <GameClient game="pet-2048" isLoggedIn={!!user} initialData={leaderboard} />
      </IntlScope>
    </div>
  );
}
