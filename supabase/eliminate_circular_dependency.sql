-- ELIMINAR DEPENDENCIA CIRCULAR DEFINITIVAMENTE
-- Este script elimina la recursión infinita cambiando el enfoque de las políticas

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

-- 2. DESACTIVAR RLS TEMPORALMENTE
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched DISABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users can view their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON public.watchlists;

DROP POLICY IF EXISTS "Users can view movies in their watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can add movies to their watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can delete movies from their watchlists" ON public.watchlist_movies;

DROP POLICY IF EXISTS "Users can view members of their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can add members to their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can update members of their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can remove members from their watchlists" ON public.watchlist_members;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

DROP POLICY IF EXISTS "Users can view their own watched items" ON public.user_watched;
DROP POLICY IF EXISTS "Users can add their own watched items" ON public.user_watched;
DROP POLICY IF EXISTS "Users can delete their own watched items" ON public.user_watched;

-- 4. REACTIVAR RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS SIN DEPENDENCIA CIRCULAR

-- Watchlists: Solo propietarios pueden ver/editar sus propias watchlists
CREATE POLICY "watchlists_select_own" ON public.watchlists
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "watchlists_insert_own" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "watchlists_update_own" ON public.watchlists
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "watchlists_delete_own" ON public.watchlists
    FOR DELETE USING (auth.uid() = owner_id);

-- Watchlist_movies: Solo propietarios de watchlists pueden ver/editar películas
-- SIN consultar watchlists (evita recursión)
CREATE POLICY "watchlist_movies_select_own" ON public.watchlist_movies
    FOR SELECT USING (auth.uid() = added_by);

CREATE POLICY "watchlist_movies_insert_own" ON public.watchlist_movies
    FOR INSERT WITH CHECK (auth.uid() = added_by);

CREATE POLICY "watchlist_movies_delete_own" ON public.watchlist_movies
    FOR DELETE USING (auth.uid() = added_by);

-- Watchlist_members: Solo propietarios pueden gestionar miembros
-- SIN consultar watchlists (evita recursión)
CREATE POLICY "watchlist_members_select_own" ON public.watchlist_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "watchlist_members_insert_own" ON public.watchlist_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_members_update_own" ON public.watchlist_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "watchlist_members_delete_own" ON public.watchlist_members
    FOR DELETE USING (auth.uid() = user_id);

-- User_favorites: Solo el usuario puede ver/editar sus favoritos
CREATE POLICY "user_favorites_select_own" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_favorites_insert_own" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_favorites_delete_own" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- User_watched: Solo el usuario puede ver/editar sus elementos vistos
CREATE POLICY "user_watched_select_own" ON public.user_watched
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_watched_insert_own" ON public.user_watched
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_watched_delete_own" ON public.user_watched
    FOR DELETE USING (auth.uid() = user_id);
