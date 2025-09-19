-- SOLUCIÓN COLABORATIVA SIN RECURSIÓN
-- Este script mantiene la funcionalidad colaborativa pero elimina la recursión infinita

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

-- 2. CREAR FUNCIÓN PARA VERIFICAR SI EL USUARIO ES PROPIETARIO DE UNA WATCHLIST
CREATE OR REPLACE FUNCTION public.is_watchlist_owner(watchlist_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.watchlists 
    WHERE id = watchlist_id_param 
    AND owner_id = auth.uid()
  );
$$;

-- 3. CREAR FUNCIÓN PARA VERIFICAR SI EL USUARIO ES MIEMBRO DE UNA WATCHLIST
CREATE OR REPLACE FUNCTION public.is_watchlist_member(watchlist_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.watchlist_members 
    WHERE watchlist_id = watchlist_id_param 
    AND user_id = auth.uid()
  );
$$;

-- 4. CREAR FUNCIÓN PARA VERIFICAR SI EL USUARIO PUEDE ACCEDER A UNA WATCHLIST
CREATE OR REPLACE FUNCTION public.can_access_watchlist(watchlist_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.is_watchlist_owner(watchlist_id_param) OR public.is_watchlist_member(watchlist_id_param);
$$;

-- 5. DESACTIVAR RLS TEMPORALMENTE
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched DISABLE ROW LEVEL SECURITY;

-- 6. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
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

-- 7. REACTIVAR RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;

-- 8. CREAR POLÍTICAS COLABORATIVAS SIN RECURSIÓN

-- Watchlists: Solo propietarios pueden ver/editar sus propias watchlists
CREATE POLICY "watchlists_select_own" ON public.watchlists
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "watchlists_insert_own" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "watchlists_update_own" ON public.watchlists
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "watchlists_delete_own" ON public.watchlists
    FOR DELETE USING (auth.uid() = owner_id);

-- Watchlist_movies: 
-- - Todos los miembros pueden VER las películas
-- - Cada usuario puede ELIMINAR solo las películas que él agregó
-- - Solo miembros pueden AGREGAR películas
CREATE POLICY "watchlist_movies_select_members" ON public.watchlist_movies
    FOR SELECT USING (public.can_access_watchlist(watchlist_id));

CREATE POLICY "watchlist_movies_insert_members" ON public.watchlist_movies
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND 
        public.can_access_watchlist(watchlist_id)
    );

CREATE POLICY "watchlist_movies_delete_own_added" ON public.watchlist_movies
    FOR DELETE USING (
        auth.uid() = added_by OR 
        public.is_watchlist_owner(watchlist_id)
    );

-- Watchlist_members: Solo propietarios pueden gestionar miembros
CREATE POLICY "watchlist_members_select_owner" ON public.watchlist_members
    FOR SELECT USING (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "watchlist_members_insert_owner" ON public.watchlist_members
    FOR INSERT WITH CHECK (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "watchlist_members_update_owner" ON public.watchlist_members
    FOR UPDATE USING (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "watchlist_members_delete_owner" ON public.watchlist_members
    FOR DELETE USING (public.is_watchlist_owner(watchlist_id));

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
