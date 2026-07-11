'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { submitGameScore } from '@/app/actions/game';

// Logical canvas size; scaled to the container width (DPR-aware).
const W = 480;
const H = 640;
const GROUND_H = 56;

const GRAVITY = 0.42;
const FLAP = -7.4;
const MAX_FALL = 10.5;
const PIPE_W = 72;
const GAP = 172;
const PIPE_SPACING = 264; // px between pipe pairs
const SPEED = 2.7;
const CAT_X = 132;
const CAT_R = 17;

type Pipe = { x: number; gapY: number; passed: boolean };
type Phase = 'ready' | 'playing' | 'over';

export default function FlappyKitten({ isLoggedIn, onScoreSaved }: { isLoggedIn: boolean; onScoreSaved?: () => void }) {
  const t = useTranslations('GameFlappy');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'newBest' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Mutable game state lives in refs; React state only drives the HUD/overlay.
  const g = useRef({
    y: H / 2, vy: 0, pipes: [] as Pipe[], score: 0, flaps: 0,
    phase: 'ready' as Phase, wing: 0, last: 0,
  });

  const reset = () => {
    g.current = { y: H / 2, vy: 0, pipes: [], score: 0, flaps: 0, phase: 'ready', wing: 0, last: 0 };
    setScore(0);
    setPhase('ready');
    setSaveState('idle');
    setSaveMessage('');
  };

  const flap = () => {
    const s = g.current;
    if (s.phase === 'over') return;
    if (s.phase === 'ready') { s.phase = 'playing'; setPhase('playing'); }
    s.vy = FLAP;
    s.flaps++;
    s.wing = 1;
  };

  // Input: tap/click + Space/ArrowUp.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); flap(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Game loop.
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

    const token = (name: string, fallback: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

    const drawCat = (y: number, tilt: number, wing: number) => {
      ctx.save();
      ctx.translate(CAT_X, y);
      ctx.rotate(tilt);
      // tail
      ctx.strokeStyle = '#C2622A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-CAT_R, 2);
      ctx.quadraticCurveTo(-CAT_R - 12, 8 - wing * 6, -CAT_R - 8, -6);
      ctx.stroke();
      // ears
      ctx.fillStyle = '#E8833A';
      ctx.beginPath(); ctx.moveTo(-10, -CAT_R + 3); ctx.lineTo(-6, -CAT_R - 9); ctx.lineTo(-1, -CAT_R + 1); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10, -CAT_R + 3); ctx.lineTo(6, -CAT_R - 9); ctx.lineTo(1, -CAT_R + 1); ctx.fill();
      // body
      ctx.fillStyle = '#F0A05A';
      ctx.beginPath(); ctx.arc(0, 0, CAT_R, 0, Math.PI * 2); ctx.fill();
      // wing (flap animation)
      ctx.fillStyle = '#FDF0EA';
      ctx.beginPath();
      ctx.ellipse(-4, 2 - wing * 5, 9, 5.5, -0.5 - wing * 0.6, 0, Math.PI * 2);
      ctx.fill();
      // eye + muzzle
      ctx.fillStyle = '#3A2415';
      ctx.beginPath(); ctx.arc(7, -4, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3A2415'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(11, 3); ctx.quadraticCurveTo(13.5, 5, 16, 3); ctx.stroke();
      ctx.restore();
    };

    const drawPipePair = (p: Pipe, post: string, postEdge: string, cap: string) => {
      const topH = p.gapY - GAP / 2;
      const botY = p.gapY + GAP / 2;
      for (const [y0, h] of [[0, topH], [botY, H - GROUND_H - botY]] as const) {
        if (h <= 0) continue;
        ctx.fillStyle = post;
        ctx.fillRect(p.x, y0, PIPE_W, h);
        // sisal-rope texture stripes
        ctx.strokeStyle = postEdge;
        ctx.lineWidth = 2;
        for (let yy = y0 + 8; yy < y0 + h - 4; yy += 14) {
          ctx.beginPath(); ctx.moveTo(p.x + 3, yy); ctx.lineTo(p.x + PIPE_W - 3, yy + 5); ctx.stroke();
        }
        // cap toward the gap
        ctx.fillStyle = cap;
        const capY = y0 === 0 ? topH - 14 : botY;
        ctx.fillRect(p.x - 5, capY, PIPE_W + 10, 14);
      }
    };

    const frame = (now: number) => {
      const s = g.current;
      const dt = s.last ? Math.min((now - s.last) / (1000 / 60), 2) : 1;
      s.last = now;

      // Physics.
      if (s.phase === 'playing') {
        s.vy = Math.min(s.vy + GRAVITY * dt, MAX_FALL);
        s.y += s.vy * dt;
        s.wing = Math.max(0, s.wing - 0.08 * dt);

        for (const p of s.pipes) p.x -= SPEED * dt;
        if (s.pipes.length === 0 || s.pipes[s.pipes.length - 1].x < W - PIPE_SPACING) {
          const margin = 90;
          s.pipes.push({ x: W + 20, gapY: margin + Math.random() * (H - GROUND_H - margin * 2), passed: false });
        }
        if (s.pipes[0] && s.pipes[0].x < -PIPE_W - 20) s.pipes.shift();

        for (const p of s.pipes) {
          if (!p.passed && p.x + PIPE_W < CAT_X - CAT_R) {
            p.passed = true;
            s.score++;
            setScore(s.score);
          }
          // Collision (circle vs the two rects).
          const inX = CAT_X + CAT_R > p.x && CAT_X - CAT_R < p.x + PIPE_W;
          const hitY = s.y - CAT_R < p.gapY - GAP / 2 || s.y + CAT_R > p.gapY + GAP / 2;
          if (inX && hitY) { s.phase = 'over'; setPhase('over'); }
        }
        if (s.y + CAT_R > H - GROUND_H || s.y - CAT_R < 0) { s.phase = 'over'; setPhase('over'); }
      } else if (s.phase === 'ready') {
        // gentle hover on the start screen
        s.y = H / 2 + Math.sin(now / 320) * 9;
        s.wing = (Math.sin(now / 200) + 1) / 2;
      }

      // Render (theme-aware via design tokens).
      const bgTop = token('--surface-2', '#FBF7F2');
      const bgBot = token('--surface-3', '#F5EEE6');
      const ground = token('--orange-pale', '#FDF0EA');
      const border = token('--border', '#EDE4DA');

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, bgBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      drawCatClouds(ctx, now);
      for (const p of g.current.pipes) drawPipePair(p, '#A9805A', '#936D4A', '#7A5233');

      // ground
      ctx.fillStyle = ground;
      ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
      ctx.strokeStyle = border;
      ctx.beginPath(); ctx.moveTo(0, H - GROUND_H); ctx.lineTo(W, H - GROUND_H); ctx.stroke();

      const tilt = s.phase === 'playing' ? Math.max(-0.45, Math.min(0.9, s.vy / 12)) : 0;
      drawCat(s.y, tilt, s.wing);

      raf = requestAnimationFrame(frame);
    };

    // soft background paw-clouds
    const drawCatClouds = (c: CanvasRenderingContext2D, now: number) => {
      c.save();
      c.globalAlpha = 0.35;
      c.fillStyle = token('--surface', '#FFFFFF');
      for (let i = 0; i < 3; i++) {
        const cx = ((now / 40 + i * 210) % (W + 160)) - 80;
        const cy = 90 + i * 110;
        c.beginPath();
        c.ellipse(W - cx, cy, 46, 18, 0, 0, Math.PI * 2);
        c.ellipse(W - cx + 30, cy + 6, 30, 13, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Submit the finished game for signed-in players.
  useEffect(() => {
    if (phase !== 'over' || !isLoggedIn || saveState !== 'idle') return;
    setSaveState('saving');
    submitGameScore('flappy-kitten', g.current.score, Math.max(1, g.current.flaps)).then((res) => {
      if (res?.error) { setSaveState('error'); setSaveMessage(res.error); return; }
      setSaveState(res.isNewBest ? 'newBest' : 'saved');
      setSaveMessage('');
      onScoreSaved?.();
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game-area">
      <div className="game-hud">
        <div className="game-stat"><span className="game-stat-label">{t('score')}</span><span className="game-stat-value">{score}</span></div>
      </div>

      <div className="game-board-wrap">
        <div className="flappy-wrap">
          <canvas
            ref={canvasRef}
            className="flappy-canvas"
            style={{ aspectRatio: `${W} / ${H}` }}
            onPointerDown={(e) => { e.preventDefault(); flap(); }}
            aria-label={t('boardLabel')}
          />
          {phase === 'ready' && <div className="flappy-hint">{t('tapToStart')}</div>}
          {phase === 'over' && (
            <div className="game-over">
              <h3>{t('gameOver')}</h3>
              <div className="game-over-score">{score}</div>
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
                  <Link href="/signup?next=/game/flappy" className="btn-add-pet" style={{ display: 'inline-block', marginBottom: '10px' }}>{t('signUp')}</Link>
                </>
              )}
              <button className="game-again-btn" onClick={reset}>{t('playAgain')}</button>
            </div>
          )}
        </div>
      </div>

      <p className="game-howto">{t('howTo')}</p>
    </div>
  );
}
