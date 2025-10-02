-- SOLUCIÓN PARA COMPARTIR WATCHLISTS A TRAVÉS DE ENLACES
-- Este script permite que los usuarios puedan ver información básica de watchlists
-- para poder unirse a ellas a través de enlaces compartidos

-- ========================================
-- PARTE 1: AGREGAR POLÍTICA PARA ACCESO PÚBLICO A WATCHLISTS
-- ========================================

-- Agregar política que permita a cualquier usuario autenticado ver información básica de watchlists
-- Esto es necesario para que puedan unirse a watchlists compartidas
CREATE POLICY "watchlists_public_read_for_joining" ON public.watchlists
    FOR SELECT 
    TO authenticated
    USING (true); -- Permite leer cualquier watchlist para poder unirse

-- ========================================
-- PARTE 2: AGREGAR POLÍTICA PARA UNIRSE A WATCHLISTS
-- ========================================

-- Agregar política que permita a cualquier usuario autenticado unirse a watchlists
-- (solo para insertar en watchlist_members, no para ver miembros existentes)
CREATE POLICY "watchlist_members_join_any" ON public.watchlist_members
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id); -- Solo pueden agregarse a sí mismos

-- ========================================
-- PARTE 3: VERIFICACIÓN
-- ========================================

-- Verificar que las nuevas políticas estén creadas
SELECT 
    'WATCHLISTS' as table_name,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'watchlists'
AND policyname = 'watchlists_public_read_for_joining'

UNION ALL

SELECT 
    'WATCHLIST_MEMBERS' as table_name,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'watchlist_members'
AND policyname = 'watchlist_members_join_any'

ORDER BY table_name, policyname;

-- ========================================
-- INSTRUCCIONES DE TESTING
-- ========================================

-- Para probar que la solución funciona:
-- 1. Crea una watchlist con un usuario
-- 2. Copia el enlace de compartir (formato: /watchlist/join/{id})
-- 3. Abre el enlace en una ventana incógnita o con otro usuario
-- 4. Deberías poder ver la información de la watchlist y unirte a ella
-- 5. Una vez unido, el usuario debería poder ver la watchlist en su lista

-- NOTA: Esta solución mantiene la seguridad porque:
-- - Solo usuarios autenticados pueden ver información de watchlists
-- - Solo pueden unirse a sí mismos (no pueden agregar otros usuarios)
-- - Las políticas existentes siguen protegiendo las operaciones de modificación
