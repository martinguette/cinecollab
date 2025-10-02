-- SCRIPT DE DEBUG PARA PROBLEMA DE NUEVOS USUARIOS
-- Este script ayuda a diagnosticar por qué los nuevos usuarios no pueden crear watchlists

-- 1. VERIFICAR ESTRUCTURA DE TABLAS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('watchlists', 'watchlist_members', 'watchlist_movies')
ORDER BY table_name, ordinal_position;

-- 2. VERIFICAR POLÍTICAS RLS ACTIVAS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('watchlists', 'watchlist_members', 'watchlist_movies')
ORDER BY tablename, policyname;

-- 3. VERIFICAR SI RLS ESTÁ HABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('watchlists', 'watchlist_members', 'watchlist_movies');

-- 4. VERIFICAR USUARIOS RECIENTES (últimos 7 días)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 5. VERIFICAR WATCHLISTS CREADAS POR USUARIOS RECIENTES
SELECT 
    w.id,
    w.name,
    w.owner_id,
    w.created_at,
    u.email as owner_email,
    u.created_at as user_created_at
FROM public.watchlists w
JOIN auth.users u ON w.owner_id = u.id
WHERE u.created_at > NOW() - INTERVAL '7 days'
ORDER BY w.created_at DESC;

-- 6. PROBAR CREACIÓN DE WATCHLIST (SOLO PARA DEBUG - NO EJECUTAR EN PRODUCCIÓN)
-- Descomenta las siguientes líneas solo para testing:
/*
-- Simular creación de watchlist para un usuario específico
-- Reemplaza 'USER_ID_AQUI' con el ID de un usuario nuevo que tenga problemas
DO $$
DECLARE
    test_user_id uuid := 'USER_ID_AQUI';
    test_watchlist_id uuid;
BEGIN
    -- Intentar crear una watchlist
    INSERT INTO public.watchlists (name, description, owner_id, invite_code)
    VALUES ('Test Watchlist', 'Test Description', test_user_id, 'TEST123')
    RETURNING id INTO test_watchlist_id;
    
    RAISE NOTICE 'Watchlist creada exitosamente con ID: %', test_watchlist_id;
    
    -- Limpiar el test
    DELETE FROM public.watchlists WHERE id = test_watchlist_id;
    RAISE NOTICE 'Test watchlist eliminada';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al crear watchlist: %', SQLERRM;
END $$;
*/
