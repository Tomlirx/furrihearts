-- ============================================================================
-- 0022 — Support multiple mini games on the shared leaderboard table
-- ============================================================================
-- Adds Pet 2048 alongside Paw Match: game_scores gains a `game` column and a
-- composite (user_id, game) key — still one row per player PER GAME, top-3
-- kept scores, 10-row leaderboard reads via the (game, best_score) index.
-- 2048 scores run far higher than match-3, so the score ceiling is raised;
-- per-game bounds are enforced in the submitGameScore server action. Idempotent.
-- ============================================================================

alter table public.game_scores
  add column if not exists game text not null default 'paw-match';

alter table public.game_scores drop constraint if exists game_scores_game_check;
alter table public.game_scores add constraint game_scores_game_check
  check (game in ('paw-match', 'pet-2048'));

-- Composite primary key (user_id, game).
alter table public.game_scores drop constraint if exists game_scores_pkey;
alter table public.game_scores add primary key (user_id, game);

-- Raise the hard ceiling (2048 legitimately exceeds the match-3 cap).
alter table public.game_scores drop constraint if exists game_scores_best_score_check;
alter table public.game_scores add constraint game_scores_best_score_check
  check (best_score >= 0 and best_score <= 1000000);

drop index if exists idx_game_scores_best;
create index if not exists idx_game_scores_game_best
  on public.game_scores (game, best_score desc);
