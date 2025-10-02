-- FIX: Corregir sincronización de películas en watchlists colaborativas
-- Problema: Las políticas RLS buscan en 'watchlist_collaborators' pero el frontend usa 'watchlist_members'
-- Solución: Actualizar las políticas para usar 'watchlist_members'

-- 1. ELIMINAR POLÍTICAS INCORRECTAS
DROP POLICY IF EXISTS "watchlist_movies_collaborator_access" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_collaborator_insert" ON public.watchlist_movies;
DROP POLICY IF EXISTS "watchlist_movies_collaborator_delete" ON public.watchlist_movies;

-- 2. CREAR POLÍTICAS CORRECTAS USANDO watchlist_members

-- Política para que los MIEMBROS puedan VER todas las películas de la watchlist
CREATE POLICY "watchlist_movies_member_select" ON public.watchlist_movies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.watchlist_members 
            WHERE watchlist_id = watchlist_movies.watchlist_id 
            AND user_id = auth.uid()
        )
    );

-- Política para que los MIEMBROS puedan AGREGAR películas a la watchlist
CREATE POLICY "watchlist_movies_member_insert" ON public.watchlist_movies
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND
        EXISTS (
            SELECT 1 FROM public.watchlist_members 
            WHERE watchlist_id = watchlist_movies.watchlist_id 
            AND user_id = auth.uid()
        )
    );

-- Política para que los MIEMBROS puedan ELIMINAR películas que ellos agregaron
CREATE POLICY "watchlist_movies_member_delete" ON public.watchlist_movies
    FOR DELETE USING (
        auth.uid() = added_by AND
        EXISTS (
            SELECT 1 FROM public.watchlist_members 
            WHERE watchlist_id = watchlist_movies.watchlist_id 
            AND user_id = auth.uid()
        )
    );

-- 3. VERIFICAR QUE LAS POLÍTICAS DEL OWNER SIGAN FUNCIONANDO
-- (La política "watchlist_movies_owner_full_access" ya existe y está correcta)

-- 4. OPCIONAL: Eliminar tabla watchlist_collaborators si no se usa
-- DROP TABLE IF EXISTS public.watchlist_collaborators;
-- (Comentado por seguridad - verificar primero que no se use)

-- RESUMEN DE LA SOLUCIÓN:
-- - Los propietarios (owner_id) tienen acceso completo a través de "watchlist_movies_owner_full_access"
-- - Los miembros (watchlist_members) ahora pueden ver, agregar y eliminar películas
-- - Se mantiene la seguridad: solo pueden eliminar películas que ellos agregaron
-- - Se corrige la inconsistencia entre frontend (watchlist_members) y backend (watchlist_collaborators)
