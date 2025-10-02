-- SOLUCIÓN COMPLETA PARA NUEVOS USUARIOS
-- Este script corrige completamente el problema de RLS para nuevos usuarios

-- ========================================
-- PARTE 1: CORRECCIÓN DE WATCHLISTS
-- ========================================

-- Desactivar RLS temporalmente
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own watchlists and collaborative watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_full_access" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_owner_only" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_select_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_insert_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_update_own" ON public.watchlists;
DROP POLICY IF EXISTS "watchlists_delete_own" ON public.watchlists;
DROP POLICY IF EXISTS "allow_authenticated_users_create_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "allow_users_view_own_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "allow_users_update_own_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "allow_users_delete_own_watchlists" ON public.watchlists;

-- Reactivar RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Crear políticas corregidas para watchlists
CREATE POLICY "watchlists_create_own" ON public.watchlists
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "watchlists_view_own" ON public.watchlists
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "watchlists_update_own" ON public.watchlists
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "watchlists_delete_own" ON public.watchlists
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = owner_id);

-- ========================================
-- PARTE 2: CORRECCIÓN DE WATCHLIST_MEMBERS
-- ========================================

-- Desactivar RLS temporalmente
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view members of accessible watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can add members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can update member roles" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can remove members" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_only" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_select_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_insert_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_update_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_delete_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "allow_users_view_members_own_watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "allow_owners_add_members" ON public.watchlist_members;
DROP POLICY IF EXISTS "allow_owners_update_member_roles" ON public.watchlist_members;
DROP POLICY IF EXISTS "allow_owners_remove_members" ON public.watchlist_members;

-- Reactivar RLS
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;

-- Crear políticas corregidas para watchlist_members
CREATE POLICY "watchlist_members_view_own" ON public.watchlist_members
    FOR SELECT 
    TO authenticated
    USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "watchlist_members_add_own" ON public.watchlist_members
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "watchlist_members_update_own" ON public.watchlist_members
    FOR UPDATE 
    TO authenticated
    USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "watchlist_members_delete_own" ON public.watchlist_members
    FOR DELETE 
    TO authenticated
    USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- ========================================
-- PARTE 3: CORRECCIÓN DE WATCHLIST_MOVIES
-- ========================================

-- Desactivar RLS temporalmente
ALTER TABLE public.watchlist_movies DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
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
DROP POLICY IF EXISTS "watchlist_movies_select_own" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_insert_own" ON public.watchlist_movies;

-- Reactivar RLS
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;

-- Crear políticas corregidas para watchlist_movies
CREATE POLICY "watchlist_movies_view_own" ON public.watchlist_movies
    FOR SELECT 
    TO authenticated
    USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "watchlist_movies_add_own" ON public.watchlist_movies
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        auth.uid() = added_by AND
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "watchlist_movies_delete_own" ON public.watchlist_movies
    FOR DELETE 
    TO authenticated
    USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- ========================================
-- PARTE 4: VERIFICACIÓN FINAL
-- ========================================

-- Verificar que todas las políticas estén creadas correctamente
SELECT 
    'WATCHLISTS' as table_name,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'watchlists'

UNION ALL

SELECT 
    'WATCHLIST_MEMBERS' as table_name,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'watchlist_members'

UNION ALL

SELECT 
    'WATCHLIST_MOVIES' as table_name,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'watchlist_movies'

ORDER BY table_name, policyname;

-- ========================================
-- INSTRUCCIONES DE TESTING
-- ========================================

-- Para probar que la solución funciona:
-- 1. Crea un nuevo usuario en tu aplicación (email o OAuth)
-- 2. Intenta crear una watchlist
-- 3. Si funciona, el problema está resuelto
-- 4. Si no funciona, revisa los logs de Supabase para más detalles

-- Si necesitas más debugging, ejecuta el script debug_new_users_issue.sql
