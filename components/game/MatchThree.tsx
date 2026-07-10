'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PetTile, TILE_TYPES } from './PetTiles';
import { submitGameScore } from '@/app/actions/game';

const SIZE = 8;
const START_MOVES = 30;
const CELL = 100 / SIZE; // percentage per cell

type Tile = { id: number; type: number; clearing?: boolean; spawnDrop?: number };
type Board = Tile[][];

let nextId = 1;
const newTile = (type?: number, spawnDrop?: number): Tile => ({
  id: nextId++,
  type: type ?? Math.floor(Math.random() * TILE_TYPES),
  spawnDrop,
});

// Board that starts with no ready-made matches.
function makeBoard(): Board {
  const b: Board = [];
  for (let r = 0; r < SIZE; r++) {
    const row: Tile[] = [];
    for (let c = 0; c < SIZE; c++) {
      let t = newTile();
      while (
        (c >= 2 && row[c - 1].type === t.type && row[c - 2].type === t.type) ||
        (r >= 2 && b[r - 1][c].type === t.type && b[r - 2][c].type === t.type)
      ) {
        t = newTile();
      }
      row.push(t);
    }
    b.push(row);
  }
  return b;
}

function findMatches(b: Board): Set<string> {
  const hits = new Set<string>();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const t = b[r][c].type;
      if (c <= SIZE - 3 && b[r][c + 1].type === t && b[r][c + 2].type === t) {
        let end = c;
        while (end < SIZE && b[r][end].type === t) { hits.add(`${r},${end}`); end++; }
      }
      if (r <= SIZE - 3 && b[r + 1][c].type === t && b[r + 2][c].type === t) {
        let end = r;
        while (end < SIZE && b[end][c].type === t) { hits.add(`${end},${c}`); end++; }
      }
    }
  }
  return hits;
}

function swapCells(b: Board, a: [number, number], d: [number, number]): Board {
  const nb = b.map((row) => row.slice());
  const tmp = nb[a[0]][a[1]];
  nb[a[0]][a[1]] = nb[d[0]][d[1]];
  nb[d[0]][d[1]] = tmp;
  return nb;
}

function hasAnyMove(b: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (c < SIZE - 1 && findMatches(swapCells(b, [r, c], [r, c + 1])).size) return true;
      if (r < SIZE - 1 && findMatches(swapCells(b, [r, c], [r + 1, c])).size) return true;
    }
  }
  return false;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function MatchThree({
  isLoggedIn,
  onScoreSaved,
}: {
  isLoggedIn: boolean;
  onScoreSaved?: () => void;
}) {
  const t = useTranslations('Game');
  const [board, setBoard] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(START_MOVES);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'newBest' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const busy = useRef(false);

  useEffect(() => { setBoard(makeBoard()); }, []); // client-only board (random)

  // Clear spawn offsets one frame after render so new tiles animate down.
  useEffect(() => {
    if (!board || !board.some((row) => row.some((t) => t.spawnDrop))) return;
    const raf = requestAnimationFrame(() => {
      setBoard((b) => b && b.map((row) => row.map((t) => (t.spawnDrop ? { ...t, spawnDrop: 0 } : t))));
    });
    return () => cancelAnimationFrame(raf);
  }, [board]);

  const resolveBoard = async (start: Board, movesAfter: number) => {
    let b = start;
    let cascade = 0;
    let gained = 0;

    while (true) {
      const hits = findMatches(b);
      if (hits.size === 0) break;
      cascade++;
      gained += hits.size * 10 * cascade;

      // Flash the clearing tiles.
      b = b.map((row, r) => row.map((tile, c) => (hits.has(`${r},${c}`) ? { ...tile, clearing: true } : tile)));
      setBoard(b);
      await sleep(230);

      // Gravity: keep survivors, spawn replacements above the board.
      const nb: Board = Array.from({ length: SIZE }, () => new Array(SIZE));
      for (let c = 0; c < SIZE; c++) {
        const survivors: Tile[] = [];
        for (let r = SIZE - 1; r >= 0; r--) {
          if (!hits.has(`${r},${c}`)) survivors.push(b[r][c]);
        }
        for (let r = SIZE - 1, i = 0; r >= 0; r--, i++) {
          nb[r][c] = i < survivors.length ? survivors[i] : newTile(undefined, r + 1 + Math.floor(Math.random() * 2));
        }
      }
      b = nb;
      setBoard(b);
      await sleep(260);
    }

    if (gained) setScore((s) => s + gained);

    // Dead board → reshuffle for free.
    if (!hasAnyMove(b)) {
      setShuffled(true);
      await sleep(600);
      b = makeBoard();
      setBoard(b);
      setShuffled(false);
    }

    if (movesAfter <= 0) setGameOver(true);
  };

  const handleTileClick = async (r: number, c: number) => {
    if (!board || busy.current || gameOver) return;
    if (!selected) { setSelected([r, c]); return; }
    const [sr, sc] = selected;
    if (sr === r && sc === c) { setSelected(null); return; }
    const adjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;
    if (!adjacent) { setSelected([r, c]); return; }

    busy.current = true;
    setSelected(null);
    const swapped = swapCells(board, [sr, sc], [r, c]);
    setBoard(swapped);
    await sleep(240);

    if (findMatches(swapped).size === 0) {
      setBoard(board); // revert — invalid swap costs nothing
      await sleep(240);
    } else {
      const movesAfter = movesLeft - 1;
      setMovesLeft(movesAfter);
      await resolveBoard(swapped, movesAfter);
    }
    busy.current = false;
  };

  // Submit the finished game for signed-in players.
  useEffect(() => {
    if (!gameOver || !isLoggedIn || saveState !== 'idle') return;
    setSaveState('saving');
    submitGameScore('paw-match', score, START_MOVES).then((res) => {
      if (res?.error) { setSaveState('error'); setSaveMessage(res.error); return; }
      setSaveState(res.isNewBest ? 'newBest' : 'saved');
      setSaveMessage('');
      onScoreSaved?.();
    });
  }, [gameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  const restart = () => {
    setBoard(makeBoard());
    setScore(0);
    setMovesLeft(START_MOVES);
    setSelected(null);
    setGameOver(false);
    setSaveState('idle');
    setSaveMessage('');
  };

  if (!board) return <div className="game-board-wrap"><div className="game-loading">{t('loading')}</div></div>;

  return (
    <div className="game-area">
      <div className="game-hud">
        <div className="game-stat"><span className="game-stat-label">{t('score')}</span><span className="game-stat-value">{score.toLocaleString()}</span></div>
        <div className="game-stat"><span className="game-stat-label">{t('moves')}</span><span className={`game-stat-value ${movesLeft <= 5 ? 'low' : ''}`}>{movesLeft}</span></div>
      </div>

      <div className="game-board-wrap">
        <div className="game-board" role="grid" aria-label={t('boardLabel')}>
          {board.flatMap((row, r) =>
            row.map((tile, c) => (
              <button
                key={tile.id}
                type="button"
                className={`game-tile tile-t${tile.type} ${tile.clearing ? 'clearing' : ''} ${selected && selected[0] === r && selected[1] === c ? 'selected' : ''}`}
                style={{ top: `${(r - (tile.spawnDrop ?? 0)) * CELL}%`, left: `${c * CELL}%`, width: `${CELL}%`, height: `${CELL}%` }}
                onClick={() => handleTileClick(r, c)}
                aria-label={`${t('tileLabel')} ${r + 1},${c + 1}`}
              >
                <PetTile type={tile.type} />
              </button>
            ))
          )}
          {shuffled && <div className="game-overlay-note">{t('reshuffling')}</div>}
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
                  <Link href="/signup?next=/game" className="btn-add-pet" style={{ display: 'inline-block', marginBottom: '10px' }}>{t('signUp')}</Link>
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
