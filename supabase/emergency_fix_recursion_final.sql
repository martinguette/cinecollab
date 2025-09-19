-- SOLUCIÓN DE EMERGENCIA PARA RECURSIÓN INFINITA
-- Este script elimina TODAS las políticas problemáticas y las reemplaza

-- 1. CREAR LAS TABLAS QUE FALTAN
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, media_id, media_type)
);

CREATE TABLE IF NOT EXISTS public.user_watched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  watched_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, media_id, media_type)
);

-- 2. DESACTIVAR RLS COMPLETAMENTE
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched DISABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES (TODAS LAS VERSIONES)
-- Políticas del archivo original
DROP POLICY IF EXISTS "Users can view their own watchlists and collaborative watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON public.watchlists;

DROP POLICY IF EXISTS "Users can view movies in accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can add movies to accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can delete movies from accessible watchlists" ON public.watchlist_movies;

DROP POLICY IF EXISTS "Users can view members of accessible watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can add members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can update member roles" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can remove members" ON public.watchlist_members;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

DROP POLICY IF EXISTS "Users can view their own watched items" ON public.user_watched;
DROP POLICY IF EXISTS "Users can add their own watched items" ON public.user_watched;
DROP POLICY IF EXISTS "Users can delete their own watched items" ON public.user_watched;

-- Políticas de scripts anteriores
DROP POLICY IF EXISTS "watchlists_select_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_insert_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_update_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_delete_own" ON public.watchlists;

DROP POLICY IF EXISTS "watchlist_movies_select_members" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_insert_members" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_delete_own_added" ON public.watchlist_movies;

DROP POLICY IF EXISTS "watchlist_members_select_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_insert_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_update_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_delete_owner" ON public.watchlist_members;

DROP POLICY IF EXISTS "user_favorites_select_own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_favorites_insert_own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_favorites_delete_own" ON public.user_favorites;

DROP POLICY IF EXISTS "user_watched_select_own" ON public.user_watched;
DROP POLICY IF EXISTS "user_watched_insert_own" ON public.user_watched;
DROP POLICY IF EXISTS "user_watched_delete_own" ON public.user_watched;

-- 4. REACTIVAR RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS SIMPLES SIN RECURSIÓN

-- Watchlists: Solo propietarios pueden ver/editar sus propias watchlists
CREATE POLICY "watchlists_owner_only" ON public.watchlists
    FOR ALL USING (auth.uid() = owner_id);

-- Watchlist_movies: Solo el usuario que agregó la película puede verla/eliminarla
CREATE POLICY "watchlist_movies_own_added" ON public.watchlist_movies
    FOR ALL USING (auth.uid() = added_by);

-- Watchlist_members: Solo propietarios pueden gestionar miembros
CREATE POLICY "watchlist_members_owner_only" ON public.watchlist_members
    FOR ALL USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

-- User_favorites: Solo el usuario puede ver/editar sus favoritos
CREATE POLICY "user_favorites_own" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- User_watched: Solo el usuario puede ver/editar sus elementos vistos
CREATE POLICY "user_watched_own" ON public.user_watched
    FOR ALL USING (auth.uid() = user_id);
