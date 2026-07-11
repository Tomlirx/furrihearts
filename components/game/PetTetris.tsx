'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { submitGameScore } from '@/app/actions/game';
import { ChevronLeft, ChevronRight, ChevronDown, RotateCw, ArrowDownToLine } from '@/components/icons';

const COLS = 10;
const ROWS = 20;
const CELL = 30; // logical px
const W = COLS * CELL;
const H = ROWS * CELL;

// Seven tetrominoes, each a pet-warm color. Cells carry a paw-pad watermark.
const PIECES: Record<string, { color: string; size: number; cells: [number, number][] }> = {
  I: { color: '#4C9ED9', size: 4, cells: [[1, 0], [1, 1], [1, 2], [1, 3]] },
  O: { color: '#E8B23A', size: 2, cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  T: { color: '#B06AB3', size: 3, cells: [[0, 1], [1, 0], [1, 1], [1, 2]] },
  S: { color: '#5FAE6E', size: 3, cells: [[0, 1], [0, 2], [1, 0], [1, 1]] },
  Z: { color: '#D9536B', size: 3, cells: [[0, 0], [0, 1], [1, 1], [1, 2]] },
  J: { color: '#7A5233', size: 3, cells: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  L: { color: '#E8833A', size: 3, cells: [[0, 2], [1, 0], [1, 1], [1, 2]] },
};
type PieceKey = keyof typeof PIECES;
const KEYS = Object.keys(PIECES) as PieceKey[];

type Active = { key: PieceKey; rot: number; r: number; c: number };
type Phase = 'ready' | 'playing' | 'over';

// Rotate a piece's cells `rot` quarter-turns within its bounding box.
function cellsOf(key: PieceKey, rot: number): [number, number][] {
  const { size, cells } = PIECES[key];
  return cells.map(([r, c]) => {
    let rr = r, cc = c;
    for (let i = 0; i < ((rot % 4) + 4) % 4; i++) {
      const nr = cc, nc = size - 1 - rr;
      rr = nr; cc = nc;
    }
    return [rr, cc] as [number, number];
  });
}

function collides(board: (string | null)[][], a: Active): boolean {
  for (const [dr, dc] of cellsOf(a.key, a.rot)) {
    const r = a.r + dr, c = a.c + dc;
    if (c < 0 || c >= COLS || r >= ROWS) return true;
    if (r >= 0 && board[r][c]) return true;
  }
  return false;
}

const randKey = () => KEYS[Math.floor(Math.random() * KEYS.length)];
const LINE_SCORES = [0, 40, 100, 300, 1200];

export default function PetTetris({ isLoggedIn, onScoreSaved }: { isLoggedIn: boolean; onScoreSaved?: () => void }) {
  const t = useTranslations('GameTetris');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [nextKey, setNextKey] = useState<PieceKey>('T');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'newBest' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const g = useRef({
    board: Array.from({ length: ROWS }, () => new Array<string | null>(COLS).fill(null)),
    active: null as Active | null,
    next: 'T' as PieceKey,
    score: 0, lines: 0, level: 0, pieces: 0,
    dropAcc: 0, phase: 'ready' as Phase,
  });

  const spawn = () => {
    const s = g.current;
    const key = s.next;
    s.next = randKey();
    setNextKey(s.next);
    const a: Active = { key, rot: 0, r: -1, c: Math.floor((COLS - PIECES[key].size) / 2) };
    if (collides(s.board, a)) {
      s.phase = 'over';
      setPhase('over');
      s.active = null;
      return;
    }
    s.active = a;
  };

  const start = () => {
    const s = g.current;
    s.board = Array.from({ length: ROWS }, () => new Array<string | null>(COLS).fill(null));
    s.score = 0; s.lines = 0; s.level = 0; s.pieces = 0; s.dropAcc = 0;
    s.next = randKey();
    s.phase = 'playing';
    setScore(0); setLines(0); setLevel(0); setPhase('playing');
    setSaveState('idle'); setSaveMessage('');
    spawn();
  };

  const lockPiece = () => {
    const s = g.current;
    if (!s.active) return;
    for (const [dr, dc] of cellsOf(s.active.key, s.active.rot)) {
      const r = s.active.r + dr, c = s.active.c + dc;
      if (r >= 0) s.board[r][c] = PIECES[s.active.key].color;
    }
    s.pieces++;
    // Clear full lines.
    const kept = s.board.filter((row) => row.some((x) => !x));
    const cleared = ROWS - kept.length;
    if (cleared > 0) {
      while (kept.length < ROWS) kept.unshift(new Array<string | null>(COLS).fill(null));
      s.board = kept;
      s.lines += cleared;
      s.score += LINE_SCORES[cleared] * (s.level + 1);
      s.level = Math.floor(s.lines / 10);
      setScore(s.score); setLines(s.lines); setLevel(s.level);
    }
    spawn();
  };

  const tryMove = (dr: number, dc: number, drot: number): boolean => {
    const s = g.current;
    if (!s.active || s.phase !== 'playing') return false;
    const cand: Active = { ...s.active, r: s.active.r + dr, c: s.active.c + dc, rot: s.active.rot + drot };
    if (drot !== 0) {
      // simple wall kicks
      for (const kick of [0, -1, 1, -2, 2]) {
        const kicked = { ...cand, c: cand.c + kick };
        if (!collides(s.board, kicked)) { s.active = kicked; return true; }
      }
      return false;
    }
    if (!collides(s.board, cand)) { s.active = cand; return true; }
    return false;
  };

  const softDrop = () => {
    const s = g.current;
    if (tryMove(1, 0, 0)) { s.score += 1; setScore(s.score); }
    else lockPiece();
  };

  const hardDrop = () => {
    const s = g.current;
    if (!s.active || s.phase !== 'playing') return;
    let fell = 0;
    while (tryMove(1, 0, 0)) fell++;
    s.score += fell * 2;
    setScore(s.score);
    lockPiece();
  };

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = g.current;
      if (s.phase === 'ready' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); start(); return; }
      if (s.phase !== 'playing') return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); tryMove(0, -1, 0); break;
        case 'ArrowRight': e.preventDefault(); tryMove(0, 1, 0); break;
        case 'ArrowUp': e.preventDefault(); tryMove(0, 0, 1); break;
        case 'ArrowDown': e.preventDefault(); softDrop(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // rebound each render to see fresh closures

  // Main loop: gravity + render.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let last = 0;

    const token = (name: string, fallback: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

    const drawCell = (r: number, c: number, color: string, alpha = 1) => {
      const x = c * CELL, y = r * CELL;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3, 6);
      ctx.fill();
      // paw-pad watermark: two toes + pad
      ctx.fillStyle = 'rgba(255,255,255,0.34)';
      ctx.beginPath();
      ctx.ellipse(x + CELL * 0.38, y + CELL * 0.34, 3, 3.8, 0, 0, Math.PI * 2);
      ctx.ellipse(x + CELL * 0.62, y + CELL * 0.34, 3, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + CELL * 0.5, y + CELL * 0.6, 5.4, 4.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const frame = (now: number) => {
      const s = g.current;
      const dt = last ? Math.min(now - last, 100) : 0; // cap: background tabs can't fast-forward
      last = now;

      if (s.phase === 'playing' && s.active) {
        s.dropAcc += dt;
        const interval = Math.max(110, 780 - s.level * 65);
        while (s.dropAcc >= interval) {
          s.dropAcc -= interval;
          if (!tryMove(1, 0, 0)) { lockPiece(); break; }
        }
      }

      // Render.
      ctx.fillStyle = token('--surface-2', '#FBF7F2');
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = token('--border', '#EDE4DA');
      ctx.lineWidth = 1;
      for (let c = 1; c < COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke(); }
      for (let r = 1; r < ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke(); }

      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const col = s.board[r][c];
        if (col) drawCell(r, c, col);
      }

      if (s.active && s.phase === 'playing') {
        // ghost landing hint
        const ghost: Active = { ...s.active };
        while (!collides(s.board, { ...ghost, r: ghost.r + 1 })) ghost.r++;
        for (const [dr, dc] of cellsOf(ghost.key, ghost.rot)) {
          if (ghost.r + dr >= 0) drawCell(ghost.r + dr, ghost.c + dc, PIECES[ghost.key].color, 0.22);
        }
        for (const [dr, dc] of cellsOf(s.active.key, s.active.rot)) {
          if (s.active.r + dr >= 0) drawCell(s.active.r + dr, s.active.c + dc, PIECES[s.active.key].color);
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Next-piece preview.
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 4 * 16;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const p = PIECES[nextKey];
    const off = (4 - p.size) / 2;
    for (const [r, c] of cellsOf(nextKey, 0)) {
      const x = (c + off) * 16, y = (r + off + (p.size < 3 ? 0.5 : 0)) * 16;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, 14, 14, 4);
      ctx.fill();
    }
  }, [nextKey, phase]);

  // Submit the finished game for signed-in players.
  useEffect(() => {
    if (phase !== 'over' || !isLoggedIn || saveState !== 'idle') return;
    setSaveState('saving');
    submitGameScore('pet-tetris', g.current.score, Math.max(1, g.current.pieces)).then((res) => {
      if (res?.error) { setSaveState('error'); setSaveMessage(res.error); return; }
      setSaveState(res.isNewBest ? 'newBest' : 'saved');
      setSaveMessage('');
      onScoreSaved?.();
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game-area">
      <div className="game-hud">
        <div className="game-stat"><span className="game-stat-label">{t('score')}</span><span className="game-stat-value">{score.toLocaleString()}</span></div>
        <div className="game-stat"><span className="game-stat-label">{t('lines')}</span><span className="game-stat-value">{lines}</span></div>
        <div className="game-stat"><span className="game-stat-label">{t('level')}</span><span className="game-stat-value">{level + 1}</span></div>
        <div className="game-stat tetris-next"><span className="game-stat-label">{t('next')}</span><canvas ref={previewRef} style={{ width: 48, height: 48 }} /></div>
      </div>

      <div className="game-board-wrap">
        <div className="tetris-wrap">
          <canvas ref={canvasRef} className="tetris-canvas" style={{ width: '100%', aspectRatio: `${W} / ${H}` }} aria-label={t('boardLabel')} />
          {phase === 'ready' && (
            <button className="tetris-start" onClick={start}>{t('start')}</button>
          )}
          {phase === 'over' && (
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
                  <Link href="/signup?next=/game/tetris" className="btn-add-pet" style={{ display: 'inline-block', marginBottom: '10px' }}>{t('signUp')}</Link>
                </>
              )}
              <button className="game-again-btn" onClick={start}>{t('playAgain')}</button>
            </div>
          )}
        </div>

        {/* Touch controls (also usable with a mouse) */}
        <div className="tetris-controls">
          <button className="tetris-btn" onClick={() => tryMove(0, -1, 0)} aria-label={t('left')}><ChevronLeft size={22} /></button>
          <button className="tetris-btn" onClick={() => tryMove(0, 0, 1)} aria-label={t('rotate')}><RotateCw size={20} /></button>
          <button className="tetris-btn" onClick={softDrop} aria-label={t('down')}><ChevronDown size={22} /></button>
          <button className="tetris-btn wide" onClick={hardDrop} aria-label={t('drop')}><ArrowDownToLine size={20} /></button>
          <button className="tetris-btn" onClick={() => tryMove(0, 1, 0)} aria-label={t('right')}><ChevronRight size={22} /></button>
        </div>
      </div>

      <p className="game-howto">{t('howTo')}</p>
    </div>
  );
}
