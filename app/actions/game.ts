'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient, isAdminConfigured } from '@/utils/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

// Theoretical ceiling well above any legitimate 30-move game (cascades
// included); the DB CHECK mirrors it. Client-side games can't be fully
// trusted, so this plus the rate limit keeps the leaderboard sane.
const MAX_SCORE = 50000;
const MAX_MOVES = 30;

export async function submitGameScore(score: number, movesUsed: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in to save your score.' };

  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return { error: 'Invalid score.' };
  }
  if (!Number.isInteger(movesUsed) || movesUsed < 1 || movesUsed > MAX_MOVES) {
    return { error: 'Invalid game.' };
  }

  // 10 submissions / 5 minutes per player.
  if (!(await checkRateLimit(supabase, `game:${user.id}`, 10, 300))) {
    return { error: "You're submitting scores too quickly. Take a breather!" };
  }

  if (!isAdminConfigured()) return { error: 'Leaderboard is not available right now.' };
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('game_scores')
    .select('best_score, games_played')
    .eq('user_id', user.id)
    .maybeSingle();

  const best = Math.max(existing?.best_score ?? 0, score);
  const { error } = await admin.from('game_scores').upsert({
    user_id: user.id,
    best_score: best,
    games_played: (existing?.games_played ?? 0) + 1,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Score submit error:', error.message);
    return { error: 'Could not save your score. Please try again.' };
  }

  return { success: true, best, isNewBest: !existing || score > existing.best_score };
}

export type LeaderboardRow = {
  rank: number;
  name: string;
  best_score: number;
  games_played: number;
  isYou: boolean;
};

export async function getLeaderboard(): Promise<{ rows: LeaderboardRow[]; you: LeaderboardRow | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('game_scores')
    .select('user_id, best_score, games_played, profiles:user_id (first_name, last_name)')
    .order('best_score', { ascending: false })
    .limit(100);

  const rows: LeaderboardRow[] = (data || []).map((r: any, i: number) => {
    const first = r.profiles?.first_name || '';
    const lastInitial = r.profiles?.last_name ? ` ${r.profiles.last_name[0]}.` : '';
    return {
      rank: i + 1,
      name: (first + lastInitial).trim() || 'Player',
      best_score: r.best_score,
      games_played: r.games_played,
      isYou: !!user && r.user_id === user.id,
    };
  });

  return { rows: rows.slice(0, 10), you: rows.find((r) => r.isYou) ?? null };
}
