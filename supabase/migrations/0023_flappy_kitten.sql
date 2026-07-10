-- ============================================================================
-- 0023 — Register the Flappy Kitten mini game on the shared leaderboard
-- ============================================================================
-- Third game id for game_scores (same rules: one row per player per game,
-- top-3 kept scores, 10-row leaderboard). Idempotent.
-- ============================================================================

alter table public.game_scores drop constraint if exists game_scores_game_check;
alter table public.game_scores add constraint game_scores_game_check
  check (game in ('paw-match', 'pet-2048', 'flappy-kitten'));
