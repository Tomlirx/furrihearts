'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PetTile, TILE_TYPES } from './PetTiles';
import { submitGameScore } from '@/app/actions/game';

const N = 4;
const CELL = 100 / N;
const STORAGE_KEY = 'furrihearts-pet-2048';

type Tile = { id: number; value: number; r: number; c: number; pop?: boolean; spawn?: boolean };
type SavedGame = { tiles: { id: number; value: number; r: number; c: number }[]; score: number; moves: number; nextId: number };

let nextId = 1;

const cellOf = (tiles: Tile[], r: number, c: number) => tiles.find((t) => t.r === r && t.c === c);

function spawnTile(tiles: Tile[]): Tile[] {
  const empty: [number, number][] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!cellOf(tiles, r, c)) empty.push([r, c]);
  if (!empty.length) return tiles;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  return [...tiles, { id: nextId++, value: Math.random() < 0.9 ? 2 : 4, r, c, spawn: true }];
}

function newGame(): Tile[] {
  return spawnTile(spawnTile([]));
}

// Slide + merge one line (indices 0..N-1 toward index 0). Returns moved flag & gained score.
function slideLine(line: (Tile | undefined)[]): { out: (Tile | null)[]; gained: number; moved: boolean } {
  const present = line.filter(Boolean) as Tile[];
  const out: (Tile | null)[] = new Array(N).fill(null);
  let gained = 0;
  let i = 0; // write index
  for (let k = 0; k < present.length; k++) {
    const cur = present[k];
    const nxt = present[k + 1];
    if (nxt && nxt.value === cur.value) {
      const merged: Tile = { ...cur, value: cur.value * 2, pop: true };
      gained += merged.value;
      out[i++] = merged;
      k++; // consume both
    } else {
      out[i++] = { ...cur };
    }
  }
  const moved = out.some((t, idx) => t && (line[idx]?.id !== t.id || line[idx]?.value !== t.value)) || present.length !== out.filter(Boolean).length;
  return { out, gained, moved };
}

function move(tiles: Tile[], dir: 'up' | 'down' | 'left' | 'right'): { tiles: Tile[]; gained: number; moved: boolean } {
  const horizontal = dir === 'left' || dir === 'right';
  const reverse = dir === 'right' || dir === 'down';
  const next: Tile[] = [];
  let gained = 0;
  let moved = false;

  for (let i = 0; i < N; i++) {
    const line: (Tile | undefined)[] = [];
    for (let j = 0; j < N; j++) {
      const jj = reverse ? N - 1 - j : j;
      line.push(horizontal ? cellOf(tiles, i, jj) : cellOf(tiles, jj, i));
    }
    const res = slideLine(line);
    gained += res.gained;
    moved = moved || res.moved;
    res.out.forEach((t, j) => {
      if (!t) return;
      const jj = reverse ? N - 1 - j : j;
      next.push(horizontal ? { ...t, r: i, c: jj } : { ...t, r: jj, c: i });
    });
  }
  return { tiles: next, gained, moved };
}

function hasMoves(tiles: Tile[]): boolean {
  if (tiles.length < N * N) return true;
  for (const t of tiles) {
    const right = cellOf(tiles, t.r, t.c + 1);
    const down = cellOf(tiles, t.r + 1, t.c);
    if ((right && right.value === t.value) || (down && down.value === t.value)) return true;
  }
  return false;
}

const tierOf = (value: number) => Math.min(Math.round(Math.log2(value)), 11); // 2→1 … 2048→11

export default function Game2048({ isLoggedIn, onScoreSaved }: { isLoggedIn: boolean; onScoreSaved?: () => void }) {
  const t = useTranslations('Game2048');
  const [tiles, setTiles] = useState<Tile[] | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'newBest' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const busy = useRef(false);
  const touchStart = useRef<[number, number] | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Restore a paused game (stickiness: close the tab, come back later).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SavedGame = JSON.parse(raw);
        if (saved.tiles?.length && Number.isInteger(saved.score)) {
          nextId = Math.max(nextId, saved.nextId || 1);
          setTiles(saved.tiles.map((x) => ({ ...x })));
          setScore(saved.score);
          setMoves(saved.moves || 0);
          return;
        }
      }
    } catch {}
    setTiles(newGame());
  }, []);

  // Persist in-progress games; clear on game over.
  useEffect(() => {
    if (!tiles) return;
    try {
      if (gameOver) localStorage.removeItem(STORAGE_KEY);
      else {
        const saved: SavedGame = { tiles: tiles.map(({ id, value, r, c }) => ({ id, value, r, c })), score, moves, nextId };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      }
    } catch {}
  }, [tiles, score, moves, gameOver]);

  const doMove = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (!tiles || busy.current || gameOver) return;
    const res = move(tiles, dir);
    if (!res.moved) return;
    busy.current = true;
    setTiles(res.tiles);
    if (res.gained) setScore((s) => s + res.gained);
    setMoves((m) => m + 1);
    setTimeout(() => {
      setTiles((cur) => {
        const withSpawn = spawnTile((cur || []).map((x) => ({ ...x, pop: false, spawn: false })));
        if (!hasMoves(withSpawn)) setGameOver(true);
        return withSpawn;
      });
      busy.current = false;
    }, 130);
  };

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      doMove(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // re-bound each render so doMove sees fresh state

  // Touch swipe.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = [e.touches[0].clientX, e.touches[0].clientY];
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current[0];
    const dy = e.changedTouches[0].clientY - touchStart.current[1];
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
  };

  // Submit the finished game for signed-in players.
  useEffect(() => {
    if (!gameOver || !isLoggedIn || saveState !== 'idle') return;
    setSaveState('saving');
    submitGameScore('pet-2048', score, Math.max(1, moves)).then((res) => {
      if (res?.error) { setSaveState('error'); setSaveMessage(res.error); return; }
      setSaveState(res.isNewBest ? 'newBest' : 'saved');
      setSaveMessage('');
      onScoreSaved?.();
    });
  }, [gameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  const restart = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setTiles(newGame());
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setSaveState('idle');
    setSaveMessage('');
  };

  if (!tiles) return <div className="game-board-wrap"><div className="game-loading">{t('loading')}</div></div>;

  const bestTile = tiles.reduce((m, x) => Math.max(m, x.value), 0);

  return (
    <div className="game-area">
      <div className="game-hud">
        <div className="game-stat"><span className="game-stat-label">{t('score')}</span><span className="game-stat-value">{score.toLocaleString()}</span></div>
        <div className="game-stat"><span className="game-stat-label">{t('bestTile')}</span><span className="game-stat-value">{bestTile}</span></div>
        <button className="g2048-newgame" onClick={restart}>{t('newGame')}</button>
      </div>

      <div className="game-board-wrap">
        <div
          ref={boardRef}
          className="game-board g2048-board"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="application"
          aria-label={t('boardLabel')}
        >
          {Array.from({ length: N * N }, (_, i) => (
            <div key={`bg${i}`} className="g2048-cell" style={{ top: `${Math.floor(i / N) * CELL}%`, left: `${(i % N) * CELL}%`, width: `${CELL}%`, height: `${CELL}%` }} />
          ))}
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`g2048-tile tier-${tierOf(tile.value)} ${tile.pop ? 'pop' : ''} ${tile.spawn ? 'spawn' : ''}`}
              style={{ top: `${tile.r * CELL}%`, left: `${tile.c * CELL}%`, width: `${CELL}%`, height: `${CELL}%` }}
            >
              <span className="g2048-pet"><PetTile type={(tierOf(tile.value) - 1) % TILE_TYPES} /></span>
              <span className="g2048-num">{tile.value}</span>
            </div>
          ))}

          {gameOver && (
            <div className="game-over">
              <h3>{t('gameOver')}</h3>
              <div className="game-over-score">{score.toLocaleString()}</div>
              {isLoggedIn ? (
                <p className="game-save-note">
                  {saveState === 'saving' && t('saving')}
                  {saveState === 'saved' && t('saved')}
                  {saveState === 'newBest' && `🏆 ${t('newBest')}`}
                  {saveState === 'error' && saveMessage}
                </p>
              ) : (
                <>
                  <p className="game-save-note">{t('guestCta')}</p>
                  <Link href="/signup?next=/game/2048" className="btn-add-pet" style={{ display: 'inline-block', marginBottom: '10px' }}>{t('signUp')}</Link>
                </>
              )}
              <button className="game-again-btn" onClick={restart}>{t('playAgain')}</button>
            </div>
          )}
        </div>
      </div>

      <p className="game-howto">{t('howTo')}</p>
    </div>
  );
}
