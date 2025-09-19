-- EMERGENCY FIX: Eliminar recursión infinita en políticas RLS
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- 1. DESACTIVAR RLS TEMPORALMENTE PARA ARREGLAR LAS POLÍTICAS
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
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

-- 3. CREAR POLÍTICAS SIMPLES SIN RECURSIÓN

-- Watchlists table policies (POLÍTICAS SIMPLES)
CREATE POLICY "Users can view their own watchlists" ON public.watchlists
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create watchlists" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own watchlists" ON public.watchlists
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own watchlists" ON public.watchlists
    FOR DELETE USING (auth.uid() = owner_id);

-- Watchlist_movies table policies (POLÍTICAS SIMPLES)
CREATE POLICY "Users can view movies in their watchlists" ON public.watchlist_movies
    FOR SELECT USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can add movies to their watchlists" ON public.watchlist_movies
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete movies from their watchlists" ON public.watchlist_movies
    FOR DELETE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

-- Watchlist_members table policies (POLÍTICAS SIMPLES)
CREATE POLICY "Users can view members of their watchlists" ON public.watchlist_members
    FOR SELECT USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can add members to their watchlists" ON public.watchlist_members
    FOR INSERT WITH CHECK (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update members of their watchlists" ON public.watchlist_members
    FOR UPDATE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove members from their watchlists" ON public.watchlist_members
    FOR DELETE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

-- 4. REACTIVAR RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR QUE NO HAY ERRORES
-- Este script debería ejecutarse sin errores
