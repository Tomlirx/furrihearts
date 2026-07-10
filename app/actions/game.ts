'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient, isAdminConfigured } from '@/utils/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

// Per-game sanity bounds. Client-side games can't be fully trusted; these plus
// the rate limit and the service-role-only write path keep leaderboards sane.
const GAMES = {
  'paw-match': { maxScore: 50_000, maxMoves: 30 },
  'pet-2048': { maxScore: 250_000, maxMoves: 5_000 },
} as const;
export type GameId = keyof typeof GAMES;

const KEPT_SCORES = 3; // each player keeps only their 3 best results per game

export async function submitGameScore(game: GameId, score: number, movesUsed: number) {
  const cfg = GAMES[game];
  if (!cfg) return { error: 'Unknown game.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in to save your score.' };

  if (!Number.isInteger(score) || score < 0 || score > cfg.maxScore) {
    return { error: 'Invalid score.' };
  }
  if (!Number.isInteger(movesUsed) || movesUsed < 1 || movesUsed > cfg.maxMoves) {
    return { error: 'Invalid game.' };
  }

  // 10 submissions / 5 minutes per player per game.
  if (!(await checkRateLimit(supabase, `game:${game}:${user.id}`, 10, 300))) {
    return { error: "You're submitting scores too quickly. Take a breather!" };
  }

  if (!isAdminConfigured()) return { error: 'Leaderboard is not available right now.' };
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('game_scores')
    .select('best_score, games_played, top_scores')
    .eq('user_id', user.id)
    .eq('game', game)
    .maybeSingle();

  // Keep only the player's KEPT_SCORES best results, sorted descending.
  const top = [...(existing?.top_scores ?? []), score]
    .sort((a, b) => b - a)
    .slice(0, KEPT_SCORES);
  const best = top[0];

  const { error } = await admin.from('game_scores').upsert(
    {
      user_id: user.id,
      game,
      best_score: best,
      top_scores: top,
      games_played: (existing?.games_played ?? 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,game' },
  );

  if (error) {
    console.error('Score submit error:', error.message);
    return { error: 'Could not save your score. Please try again.' };
  }

  return {
    success: true,
    best,
    topScores: top,
    isNewBest: !existing || score > existing.best_score,
  };
}

export type LeaderboardRow = {
  rank: number;
  name: string;
  best_score: number;
  isYou: boolean;
};

export type LeaderboardData = {
  rows: LeaderboardRow[];
  yourTopScores: number[]; // signed-in player's kept best results (may be empty)
};

// Lean by design: exactly 10 rows for the board, plus (when signed in) one
// primary-key lookup for the player's own kept scores. No rank scans.
export async function getLeaderboard(game: GameId): Promise<LeaderboardData> {
  if (!GAMES[game]) return { rows: [], yourTopScores: [] };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('game_scores')
    .select('user_id, best_score, profiles:user_id (first_name, last_name)')
    .eq('game', game)
    .order('best_score', { ascending: false })
    .limit(10);

  const rows: LeaderboardRow[] = (data || []).map((r: any, i: number) => {
    const first = r.profiles?.first_name || '';
    const lastInitial = r.profiles?.last_name ? ` ${r.profiles.last_name[0]}.` : '';
    return {
      rank: i + 1,
      name: (first + lastInitial).trim() || 'Player',
      best_score: r.best_score,
      isYou: !!user && r.user_id === user.id,
    };
  });

  let yourTopScores: number[] = [];
  if (user) {
    const { data: mine } = await supabase
      .from('game_scores')
      .select('top_scores')
      .eq('user_id', user.id)
      .eq('game', game)
      .maybeSingle();
    yourTopScores = mine?.top_scores ?? [];
  }

  return { rows, yourTopScores };
}
