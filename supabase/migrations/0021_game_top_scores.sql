-- ============================================================================
-- 0021 — Paw Match: keep each player's 3 best scores; lean leaderboard
-- ============================================================================
-- Still one row per player (minimal storage): top_scores holds their best
-- three results, sorted descending; best_score stays the ordering column so
-- the leaderboard remains a 10-row index scan. Idempotent.
-- ============================================================================

alter table public.game_scores
  add column if not exists top_scores integer[] not null default '{}';

update public.game_scores set top_scores = array[best_score] where top_scores = '{}';

alter table public.game_scores drop constraint if exists game_scores_top_scores_max3;
alter table public.game_scores add constraint game_scores_top_scores_max3
  check (coalesce(array_length(top_scores, 1), 0) <= 3);
