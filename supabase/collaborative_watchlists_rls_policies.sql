-- SOLUCIÓN DEFINITIVA PARA ACCESO COLABORATIVO
-- Permite que colaboradores vean watchlists compartidas sin recursión

-- PASO 1: CREAR FUNCIONES AUXILIARES PARA EVITAR RECURSIÓN
-- Función para verificar si el usuario es propietario de una watchlist
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

-- Función para verificar si el usuario es miembro de una watchlist
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

-- Función para verificar si el usuario puede acceder a una watchlist
CREATE OR REPLACE FUNCTION public.can_access_watchlist(watchlist_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.is_watchlist_owner(watchlist_id_param) OR public.is_watchlist_member(watchlist_id_param);
$$;

-- PASO 2: DESACTIVAR RLS TEMPORALMENTE
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_collaborators DISABLE ROW LEVEL SECURITY;

-- PASO 3: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- Políticas de watchlists
DROP POLICY IF EXISTS "watchlists_owner_access" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_full_access" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_and_collaborators" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_manage" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_update" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_delete" ON public.watchlists;
DROP POLICY IF EXISTS "Users can access their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can access watchlists where they are members" ON public.watchlists;
DROP POLICY IF EXISTS "Allow all authenticated users to read watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_select_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_insert_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_update_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_delete_own" ON public.watchlists;

-- Políticas de watchlist_members
DROP POLICY IF EXISTS "watchlist_members_owner_access" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_only" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_and_collaborators" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_and_self" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_manage" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_update" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_delete" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_select_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_insert_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_update_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_delete_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_select_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_insert_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_update_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_delete_owner" ON public.watchlist_members;

-- Políticas de watchlist_movies
DROP POLICY IF EXISTS "watchlist_movies_owner_access" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_owner_full_access" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_collaborator_access" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_collaborator_insert" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_collaborator_delete" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Collaborators can access movies in their watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Allow insert for owner" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Permitir SELECT a todos los usuarios autenticados" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_select_own" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_insert_own" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_delete_own" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_select_members" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_insert_members" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_delete_own_added" ON public.watchlist_movies;

-- Políticas de watchlist_collaborators
DROP POLICY IF EXISTS "watchlist_collaborators_owner_access" ON public.watchlist_collaborators;
DROP POLICY IF EXISTS "watchlist_collaborators_own" ON public.watchlist_collaborators;
DROP POLICY IF EXISTS "Collaborators can access their own records" ON public.watchlist_collaborators;

-- PASO 4: REACTIVAR RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_collaborators ENABLE ROW LEVEL SECURITY;

-- PASO 5: CREAR POLÍTICAS COLABORATIVAS SIN RECURSIÓN

-- WATCHLISTS: Propietarios y miembros pueden ver las listas
CREATE POLICY "watchlists_owner_and_members_view" ON public.watchlists
    FOR SELECT USING (public.can_access_watchlist(id));

-- WATCHLISTS: Solo propietarios pueden crear, editar y eliminar
CREATE POLICY "watchlists_owner_create" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "watchlists_owner_update" ON public.watchlists
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "watchlists_owner_delete" ON public.watchlists
    FOR DELETE USING (auth.uid() = owner_id);

-- WATCHLIST_MEMBERS: Propietarios y miembros pueden ver membresías
CREATE POLICY "watchlist_members_owner_and_members_view" ON public.watchlist_members
    FOR SELECT USING (
        public.can_access_watchlist(watchlist_id)
    );

-- WATCHLIST_MEMBERS: Solo propietarios pueden gestionar miembros
CREATE POLICY "watchlist_members_owner_manage" ON public.watchlist_members
    FOR INSERT WITH CHECK (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "watchlist_members_owner_update" ON public.watchlist_members
    FOR UPDATE USING (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "watchlist_members_owner_delete" ON public.watchlist_members
    FOR DELETE USING (public.is_watchlist_owner(watchlist_id));

-- WATCHLIST_MOVIES: Propietarios y miembros pueden ver películas
CREATE POLICY "watchlist_movies_owner_and_members_view" ON public.watchlist_movies
    FOR SELECT USING (public.can_access_watchlist(watchlist_id));

-- WATCHLIST_MOVIES: Propietarios pueden gestionar todas las películas
CREATE POLICY "watchlist_movies_owner_manage" ON public.watchlist_movies
    FOR INSERT WITH CHECK (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "watchlist_movies_owner_update" ON public.watchlist_movies
    FOR UPDATE USING (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "watchlist_movies_owner_delete" ON public.watchlist_movies
    FOR DELETE USING (public.is_watchlist_owner(watchlist_id));

-- WATCHLIST_MOVIES: Miembros pueden agregar películas
CREATE POLICY "watchlist_movies_members_add" ON public.watchlist_movies
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND 
        public.is_watchlist_member(watchlist_id)
    );

-- WATCHLIST_MOVIES: Miembros pueden eliminar sus propias películas
CREATE POLICY "watchlist_movies_members_remove_own" ON public.watchlist_movies
    FOR DELETE USING (
        auth.uid() = added_by AND 
        public.is_watchlist_member(watchlist_id)
    );

-- WATCHLIST_COLLABORATORS: Solo propietarios pueden gestionar colaboradores
CREATE POLICY "watchlist_collaborators_owner_manage" ON public.watchlist_collaborators
    FOR ALL USING (public.is_watchlist_owner(watchlist_id));

-- PASO 6: CREAR TABLAS PARA FAVORITOS Y VISTO (si no existen)
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

-- Habilitar RLS para las nuevas tablas
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "user_favorites_own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_watched_own" ON public.user_watched;

-- Políticas para favoritos
CREATE POLICY "user_favorites_own" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para visto
CREATE POLICY "user_watched_own" ON public.user_watched
    FOR ALL USING (auth.uid() = user_id);

-- ✅ SCRIPT COMPLETADO
-- Ahora los colaboradores pueden ver las watchlists compartidas
-- Las funciones auxiliares evitan la recursión infinita
-- Se mantiene la seguridad: solo propietarios pueden gestionar
