-- FIX CRÍTICO: Eliminar recursión infinita en políticas RLS
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- 1. ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
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

-- 2. CREAR POLÍTICAS CORREGIDAS SIN RECURSIÓN

-- Watchlists table policies (SIN RECURSIÓN)
CREATE POLICY "Users can view their own watchlists and collaborative watchlists" ON public.watchlists
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        id IN (
            SELECT watchlist_id FROM public.watchlist_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create watchlists" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own watchlists" ON public.watchlists
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own watchlists" ON public.watchlists
    FOR DELETE USING (auth.uid() = owner_id);

-- Watchlist_movies table policies (SIN RECURSIÓN)
CREATE POLICY "Users can view movies in accessible watchlists" ON public.watchlist_movies
    FOR SELECT USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        ) OR
        watchlist_id IN (
            SELECT watchlist_id FROM public.watchlist_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add movies to accessible watchlists" ON public.watchlist_movies
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND
        (
            watchlist_id IN (
                SELECT id FROM public.watchlists 
                WHERE owner_id = auth.uid()
            ) OR
            watchlist_id IN (
                SELECT watchlist_id FROM public.watchlist_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete movies from accessible watchlists" ON public.watchlist_movies
    FOR DELETE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        ) OR
        watchlist_id IN (
            SELECT watchlist_id FROM public.watchlist_members 
            WHERE user_id = auth.uid()
        )
    );

-- Watchlist_members table policies (SIN RECURSIÓN - FIX CRÍTICO)
CREATE POLICY "Users can view members of accessible watchlists" ON public.watchlist_members
    FOR SELECT USING (
        -- User is the owner of the watchlist
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        ) OR
        -- User is already a member of the watchlist
        user_id = auth.uid()
    );

CREATE POLICY "Watchlist owners can add members" ON public.watchlist_members
    FOR INSERT WITH CHECK (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Watchlist owners can update member roles" ON public.watchlist_members
    FOR UPDATE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Watchlist owners can remove members" ON public.watchlist_members
    FOR DELETE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

-- 3. VERIFICAR QUE NO HAY ERRORES
-- Este script debería ejecutarse sin errores
