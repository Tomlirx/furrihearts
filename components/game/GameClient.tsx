'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import MatchThree from './MatchThree';
import { getLeaderboard, type LeaderboardData } from '@/app/actions/game';

export default function GameClient({
  isLoggedIn,
  initialData,
}: {
  isLoggedIn: boolean;
  initialData: LeaderboardData;
}) {
  const t = useTranslations('Game');
  const [data, setData] = useState(initialData);

  const refresh = async () => {
    setData(await getLeaderboard());
  };

  return (
    <div className="game-layout">
      <MatchThree isLoggedIn={isLoggedIn} onScoreSaved={refresh} />

      <aside className="game-leaderboard section-card">
        <h3 className="game-lb-title">{t('leaderboard')}</h3>
        {data.rows.length === 0 ? (
          <p className="game-lb-empty">{t('leaderboardEmpty')}</p>
        ) : (
          <ol className="game-lb-list">
            {data.rows.map((r) => (
              <li key={r.rank} className={`game-lb-row ${r.isYou ? 'you' : ''}`}>
                <span className={`game-lb-rank r${r.rank}`}>{r.rank}</span>
                <span className="game-lb-name">{r.name}{r.isYou ? ` · ${t('you')}` : ''}</span>
                <span className="game-lb-score">{r.best_score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}

        {isLoggedIn && data.yourTopScores.length > 0 && (
          <div className="game-your-best">
            <h4 className="game-lb-subtitle">{t('yourBest')}</h4>
            <ol className="game-lb-list">
              {data.yourTopScores.map((s, i) => (
                <li key={i} className="game-lb-row">
                  <span className="game-lb-rank">{i + 1}</span>
                  <span className="game-lb-score">{s.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
}
