-- Habilitar acceso de invitados a información básica de watchlists
-- Esto permite que usuarios no autenticados puedan ver watchlists compartidas

-- Política para permitir SELECT a usuarios no autenticados (invitados)
-- Solo para información básica de watchlists
DROP POLICY IF EXISTS "Allow public read access to watchlists" ON public.watchlists;

CREATE POLICY "Allow public read access to watchlists"
ON public.watchlists
FOR SELECT
TO public
USING (true);

-- Nota: Esta política permite que cualquier persona (incluyendo invitados) 
-- pueda leer información básica de watchlists.
-- Esto es necesario para que funcionen los enlaces de invitación.
-- Las operaciones de escritura (INSERT, UPDATE, DELETE) siguen protegidas
-- por las políticas existentes que requieren autenticación.
