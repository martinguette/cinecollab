-- Tabla de miembros de watchlist para colaboración en tiempo real
create table if not exists public.watchlist_members (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid references public.watchlists(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  role text default 'member',
  unique (watchlist_id, user_id)
);

-- Index para búsquedas rápidas
create index if not exists idx_watchlist_members_user_id on public.watchlist_members(user_id);
create index if not exists idx_watchlist_members_watchlist_id on public.watchlist_members(watchlist_id);
