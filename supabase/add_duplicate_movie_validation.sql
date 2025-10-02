-- ADD DUPLICATE MOVIE VALIDATION
-- Tarea 35: Implementar validación de duplicados en watchlists
-- Prevenir que los usuarios agreguen la misma película múltiples veces a una watchlist

-- 1. LIMPIAR DUPLICADOS EXISTENTES
-- Eliminar duplicados manteniendo el más reciente (por added_at)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY watchlist_id, media_id, media_type 
            ORDER BY added_at DESC
        ) as rn
    FROM watchlist_movies
)
DELETE FROM watchlist_movies 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 2. AGREGAR CONSTRAINT UNIQUE
-- Prevenir duplicados a nivel de base de datos
ALTER TABLE watchlist_movies 
ADD CONSTRAINT watchlist_movies_unique_media 
UNIQUE (watchlist_id, media_id, media_type);

-- 3. VERIFICACIÓN
-- Verificar que el constraint se creó correctamente
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'watchlist_movies' 
    AND tc.table_schema = 'public'
    AND tc.constraint_name = 'watchlist_movies_unique_media'
GROUP BY tc.constraint_name, tc.constraint_type;

-- RESULTADO ESPERADO:
-- constraint_name: watchlist_movies_unique_media
-- constraint_type: UNIQUE  
-- columns: watchlist_id, media_id, media_type

-- COMPORTAMIENTO:
-- Ahora cualquier intento de insertar una película duplicada en la misma watchlist
-- resultará en un error de violación de constraint único (código 23505)
-- Esto permite al frontend manejar el error y mostrar un mensaje apropiado al usuario
