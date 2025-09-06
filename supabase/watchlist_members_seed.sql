-- Opcional: agrega al owner como miembro automáticamente para pruebas
insert into public.watchlist_members (watchlist_id, user_id, role)
select id, owner_id, 'owner' from public.watchlists
on conflict do nothing;
