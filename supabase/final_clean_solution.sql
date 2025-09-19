-- SOLUCIÓN FINAL LIMPIA PARA RECURSIÓN INFINITA
-- Este script elimina TODAS las políticas problemáticas y crea una solución colaborativa sin recursión

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
ALTER TABLE public.watchlist_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched DISABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- Políticas problemáticas identificadas
DROP POLICY IF EXISTS "Users can access their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can access watchlists where they are members" ON public.watchlists;
DROP POLICY IF EXISTS "Allow all authenticated users to read watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_select_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_insert_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_update_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_delete_own" ON public.watchlists;

DROP POLICY IF EXISTS "Collaborators can access their own records" ON public.watchlist_collaborators;

DROP POLICY IF EXISTS "Collaborators can access movies in their watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Allow insert for owner" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Permitir SELECT a todos los usuarios autenticados" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_select_own" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_insert_own" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_delete_own" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_select_members" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_insert_members" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_delete_own_added" ON public.watchlist_movies;

DROP POLICY IF EXISTS "watchlist_members_select_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_insert_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_update_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_delete_own" ON public.watchlist_members;
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
ALTER TABLE public.watchlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS COLABORATIVAS SIN RECURSIÓN

-- Watchlists: Solo propietarios pueden ver/editar sus propias watchlists
CREATE POLICY "watchlists_owner_only" ON public.watchlists
    FOR ALL USING (auth.uid() = owner_id);

-- Watchlist_collaborators: Solo el usuario puede ver sus propias colaboraciones
CREATE POLICY "watchlist_collaborators_own" ON public.watchlist_collaborators
    FOR ALL USING (auth.uid() = user_id);

-- Watchlist_movies: 
-- - Solo el usuario que agregó la película puede verla/eliminarla
-- - Solo miembros pueden agregar películas
CREATE POLICY "watchlist_movies_own_added" ON public.watchlist_movies
    FOR SELECT USING (auth.uid() = added_by);

CREATE POLICY "watchlist_movies_insert_member" ON public.watchlist_movies
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND
        EXISTS (
            SELECT 1 FROM public.watchlist_collaborators 
            WHERE watchlist_id = watchlist_movies.watchlist_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "watchlist_movies_delete_own" ON public.watchlist_movies
    FOR DELETE USING (auth.uid() = added_by);

-- Watchlist_members: Solo propietarios pueden gestionar miembros
CREATE POLICY "watchlist_members_owner_only" ON public.watchlist_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.watchlists 
            WHERE id = watchlist_members.watchlist_id 
            AND owner_id = auth.uid()
        )
    );

-- User_favorites: Solo el usuario puede ver/editar sus favoritos
CREATE POLICY "user_favorites_own" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- User_watched: Solo el usuario puede ver/editar sus elementos vistos
CREATE POLICY "user_watched_own" ON public.user_watched
    FOR ALL USING (auth.uid() = user_id);
