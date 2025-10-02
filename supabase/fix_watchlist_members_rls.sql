-- CORRECCIÓN DE POLÍTICAS RLS PARA WATCHLIST_MEMBERS
-- Este script corrige las políticas para que los nuevos usuarios puedan ser agregados como miembros

-- 1. DESACTIVAR RLS TEMPORALMENTE EN WATCHLIST_MEMBERS
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES EN WATCHLIST_MEMBERS
DROP POLICY IF EXISTS "Users can view members of accessible watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can add members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can update member roles" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can remove members" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_owner_only" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_select_own" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_insert_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_update_owner" ON public.watchlist_members;
DROP POLICY IF EXISTS "watchlist_members_delete_owner" ON public.watchlist_members;

-- 3. REACTIVAR RLS
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS SIMPLES Y DIRECTAS PARA WATCHLIST_MEMBERS

-- Los usuarios pueden ver miembros de sus propias watchlists
CREATE POLICY "allow_users_view_members_own_watchlists" ON public.watchlist_members
    FOR SELECT 
    TO authenticated
    USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- Los propietarios de watchlists pueden agregar miembros
CREATE POLICY "allow_owners_add_members" ON public.watchlist_members
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- Los propietarios de watchlists pueden actualizar roles de miembros
CREATE POLICY "allow_owners_update_member_roles" ON public.watchlist_members
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

-- Los propietarios de watchlists pueden eliminar miembros
CREATE POLICY "allow_owners_remove_members" ON public.watchlist_members
    FOR DELETE 
    TO authenticated
    USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists WHERE owner_id = auth.uid()
        )
    );

-- 5. VERIFICAR QUE LAS POLÍTICAS ESTÉN CREADAS
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'watchlist_members'
ORDER BY policyname;
