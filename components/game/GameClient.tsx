'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import MatchThree from './MatchThree';
import { getLeaderboard, type LeaderboardRow } from '@/app/actions/game';

export default function GameClient({
  isLoggedIn,
  initialRows,
  initialYou,
}: {
  isLoggedIn: boolean;
  initialRows: LeaderboardRow[];
  initialYou: LeaderboardRow | null;
}) {
  const t = useTranslations('Game');
  const [rows, setRows] = useState(initialRows);
  const [you, setYou] = useState(initialYou);

  const refresh = async () => {
    const data = await getLeaderboard();
    setRows(data.rows);
    setYou(data.you);
  };

  return (
    <div className="game-layout">
      <MatchThree isLoggedIn={isLoggedIn} onScoreSaved={refresh} />

      <aside className="game-leaderboard section-card">
        <h3 className="game-lb-title">{t('leaderboard')}</h3>
        {rows.length === 0 ? (
          <p className="game-lb-empty">{t('leaderboardEmpty')}</p>
        ) : (
          <ol className="game-lb-list">
            {rows.map((r) => (
              <li key={r.rank} className={`game-lb-row ${r.isYou ? 'you' : ''}`}>
                <span className={`game-lb-rank r${r.rank}`}>{r.rank}</span>
                <span className="game-lb-name">{r.name}{r.isYou ? ` · ${t('you')}` : ''}</span>
                <span className="game-lb-score">{r.best_score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}
        {you && you.rank > rows.length && (
          <div className="game-lb-row you" style={{ marginTop: '8px' }}>
            <span className="game-lb-rank">{you.rank}</span>
            <span className="game-lb-name">{you.name} · {t('you')}</span>
            <span className="game-lb-score">{you.best_score.toLocaleString()}</span>
          </div>
        )}
      </aside>
    </div>
  );
}
