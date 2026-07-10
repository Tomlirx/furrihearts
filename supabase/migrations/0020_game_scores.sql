-- ============================================================================
-- 0020 — Paw Match game scores + public leaderboard
-- ============================================================================
-- One row per player holding their BEST score (no per-game rows to dedupe).
-- Reads are public (leaderboard). Writes are NOT allowed via RLS at all —
-- they go through the submitGameScore server action using the service role,
-- which validates auth, sane score bounds and rate limits. Idempotent.
-- ============================================================================

create table if not exists public.game_scores (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  best_score integer not null check (best_score >= 0 and best_score <= 50000),
  games_played integer not null default 1 check (games_played >= 1),
  updated_at timestamptz not null default now()
);

create index if not exists idx_game_scores_best on public.game_scores (best_score desc);

alter table public.game_scores enable row level security;

drop policy if exists "Leaderboard is publicly readable" on public.game_scores;
create policy "Leaderboard is publicly readable" on public.game_scores for select using (true);
-- No INSERT/UPDATE/DELETE policies: only the service role writes.
