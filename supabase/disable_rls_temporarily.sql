-- DESACTIVAR RLS TEMPORALMENTE PARA ACCESO A DATOS
-- Este script desactiva RLS para que puedas acceder a tus watchlists

-- DESACTIVAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;

-- ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view their own watchlists and collaborative watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON public.watchlists;

DROP POLICY IF EXISTS "Users can view movies in accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can add movies to accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can delete movies from accessible watchlists" ON public.watchlist_movies;

DROP POLICY IF EXISTS "Users can view members of accessible watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can add members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can update member roles" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can remove members" ON public.watchlist_members;

-- NOTA: RLS está desactivado temporalmente
-- Esto permite acceso completo a los datos mientras arreglamos las políticas
