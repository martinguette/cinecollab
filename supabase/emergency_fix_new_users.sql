-- SOLUCIÓN DE EMERGENCIA PARA NUEVOS USUARIOS
-- Este script corrige específicamente el problema de creación de watchlists para nuevos usuarios

-- 1. DESACTIVAR RLS TEMPORALMENTE EN WATCHLISTS
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES EN WATCHLISTS
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

-- 3. REACTIVAR RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICA SIMPLE Y DIRECTA PARA CREACIÓN DE WATCHLISTS
-- Esta política permite que cualquier usuario autenticado cree una watchlist
CREATE POLICY "allow_authenticated_users_create_watchlists" ON public.watchlists
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- 5. CREAR POLÍTICA PARA VER WATCHLISTS PROPIAS
CREATE POLICY "allow_users_view_own_watchlists" ON public.watchlists
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = owner_id);

-- 6. CREAR POLÍTICA PARA ACTUALIZAR WATCHLISTS PROPIAS
CREATE POLICY "allow_users_update_own_watchlists" ON public.watchlists
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 7. CREAR POLÍTICA PARA ELIMINAR WATCHLISTS PROPIAS
CREATE POLICY "allow_users_delete_own_watchlists" ON public.watchlists
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = owner_id);

-- 8. VERIFICAR QUE LAS POLÍTICAS ESTÉN CREADAS
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'watchlists'
ORDER BY policyname;

-- 9. INSTRUCCIONES PARA TESTING
-- Para probar que funciona:
-- 1. Crea un nuevo usuario en tu aplicación
-- 2. Intenta crear una watchlist
-- 3. Si funciona, el problema está resuelto
-- 4. Si no funciona, ejecuta el script de debug para más información
