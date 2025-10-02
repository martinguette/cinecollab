-- SOLUCIÓN PARA NUEVOS USUARIOS QUE NO PUEDEN CREAR WATCHLISTS
-- Este script corrige las políticas RLS para permitir que nuevos usuarios creen watchlists

-- 1. VERIFICAR QUE LAS TABLAS EXISTAN
CREATE TABLE IF NOT EXISTS public.watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.watchlist_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid REFERENCES public.watchlists(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(watchlist_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.watchlist_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid REFERENCES public.watchlists(id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  movie_type text NOT NULL CHECK (movie_type IN ('movie', 'tv')),
  added_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at timestamp with time zone DEFAULT now()
);

-- 2. DESACTIVAR RLS TEMPORALMENTE PARA CORREGIR POLÍTICAS
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies DISABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view their own watchlists and collaborative watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_full_access" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_only" ON public.watchlists;

DROP POLICY IF EXISTS "Users can view movies in accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can add movies to accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can delete movies from accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_owner_full_access" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_collaborator_access" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_collaborator_insert" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_collaborator_delete" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_own_added" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_insert_member" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_delete_own" ON public.watchlist_movies;

DROP POLICY IF EXISTS "Users can view members of accessible watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can add members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can update member roles" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can remove members" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_only" ON public.watchlist_members;

-- 4. REACTIVAR RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS CORREGIDAS PARA NUEVOS USUARIOS

-- WATCHLISTS: Políticas simples y directas
-- Los usuarios pueden ver sus propias watchlists
CREATE POLICY "watchlists_select_own" ON public.watchlists
    FOR SELECT USING (auth.uid() = owner_id);

-- Los usuarios pueden crear watchlists (CRÍTICO: esto debe funcionar para nuevos usuarios)
CREATE POLICY "watchlists_insert_own" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Los usuarios pueden actualizar sus propias watchlists
CREATE POLICY "watchlists_update_own" ON public.watchlists
    FOR UPDATE USING (auth.uid() = owner_id);

-- Los usuarios pueden eliminar sus propias watchlists
CREATE POLICY "watchlists_delete_own" ON public.watchlists
    FOR DELETE USING (auth.uid() = owner_id);

-- WATCHLIST_MEMBERS: Políticas para gestión de miembros
-- Los usuarios pueden ver miembros de sus watchlists
CREATE POLICY "watchlist_members_select_own" ON public.watchlist_members
    FOR SELECT USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- Los propietarios pueden agregar miembros
CREATE POLICY "watchlist_members_insert_owner" ON public.watchlist_members
    FOR INSERT WITH CHECK (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- Los propietarios pueden actualizar roles de miembros
CREATE POLICY "watchlist_members_update_owner" ON public.watchlist_members
    FOR UPDATE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- Los propietarios pueden eliminar miembros
CREATE POLICY "watchlist_members_delete_owner" ON public.watchlist_members
    FOR DELETE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- WATCHLIST_MOVIES: Políticas para películas
-- Los usuarios pueden ver películas de sus watchlists
CREATE POLICY "watchlist_movies_select_own" ON public.watchlist_movies
    FOR SELECT USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- Los usuarios pueden agregar películas a sus watchlists
CREATE POLICY "watchlist_movies_insert_own" ON public.watchlist_movies
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- Los usuarios pueden eliminar películas de sus watchlists
CREATE POLICY "watchlist_movies_delete_own" ON public.watchlist_movies
    FOR DELETE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- 6. VERIFICAR QUE LAS POLÍTICAS ESTÉN ACTIVAS
-- Esta consulta debe mostrar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('watchlists', 'watchlist_members', 'watchlist_movies')
ORDER BY tablename, policyname;
