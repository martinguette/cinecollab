-- FIX FINAL: Eliminar políticas existentes y recrear todo correctamente
-- Este script elimina todas las políticas existentes y las recrea

-- 1. CREAR LAS TABLAS QUE FALTAN
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, media_id, media_type)
);

CREATE TABLE IF NOT EXISTS public.user_watched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  watched_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, media_id, media_type)
);

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users can view their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON public.watchlists;

DROP POLICY IF EXISTS "Users can view movies in their watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can add movies to their watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can delete movies from their watchlists" ON public.watchlist_movies;

DROP POLICY IF EXISTS "Users can view members of their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can add members to their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can update members of their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can remove members from their watchlists" ON public.watchlist_members;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

DROP POLICY IF EXISTS "Users can view their own watched items" ON public.user_watched;
DROP POLICY IF EXISTS "Users can add their own watched items" ON public.user_watched;
DROP POLICY IF EXISTS "Users can delete their own watched items" ON public.user_watched;

-- 3. REACTIVAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS RLS CORRECTAS (SIN RECURSIÓN)

-- Watchlists table policies
CREATE POLICY "Users can view their own watchlists" ON public.watchlists
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create watchlists" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own watchlists" ON public.watchlists
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own watchlists" ON public.watchlists
    FOR DELETE USING (auth.uid() = owner_id);

-- Watchlist_movies table policies
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

-- Watchlist_members table policies
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

-- User_favorites table policies
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- User_watched table policies
CREATE POLICY "Users can view their own watched items" ON public.user_watched
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own watched items" ON public.user_watched
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched items" ON public.user_watched
    FOR DELETE USING (auth.uid() = user_id);
