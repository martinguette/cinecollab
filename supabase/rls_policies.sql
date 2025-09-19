-- Row Level Security (RLS) Policies for CineCollab
-- This file contains the RLS policies for secure data access

-- Create tables for user preferences
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

-- Enable RLS on all tables
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own watchlists and collaborative watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON public.watchlists;

-- Watchlists table policies
-- Users can view watchlists they own or are members of
CREATE POLICY "Users can view their own watchlists and collaborative watchlists" ON public.watchlists
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        auth.uid() IN (
            SELECT user_id FROM public.watchlist_members 
            WHERE watchlist_id = watchlists.id
        )
    );

-- Users can insert watchlists (create new ones)
CREATE POLICY "Users can create watchlists" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can update watchlists they own
CREATE POLICY "Users can update their own watchlists" ON public.watchlists
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can delete watchlists they own
CREATE POLICY "Users can delete their own watchlists" ON public.watchlists
    FOR DELETE USING (auth.uid() = owner_id);

-- Drop existing watchlist_movies policies
DROP POLICY IF EXISTS "Users can view movies in accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can add movies to accessible watchlists" ON public.watchlist_movies;
DROP POLICY IF EXISTS "Users can delete movies from accessible watchlists" ON public.watchlist_movies;

-- Watchlist_movies table policies
-- Users can view movies in watchlists they have access to
CREATE POLICY "Users can view movies in accessible watchlists" ON public.watchlist_movies
    FOR SELECT USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid() OR 
            id IN (
                SELECT watchlist_id FROM public.watchlist_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Users can add movies to watchlists they own or are members of
CREATE POLICY "Users can add movies to accessible watchlists" ON public.watchlist_movies
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid() OR 
            id IN (
                SELECT watchlist_id FROM public.watchlist_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Users can delete movies from watchlists they own or are members of
CREATE POLICY "Users can delete movies from accessible watchlists" ON public.watchlist_movies
    FOR DELETE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid() OR 
            id IN (
                SELECT watchlist_id FROM public.watchlist_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Drop existing watchlist_members policies
DROP POLICY IF EXISTS "Users can view members of accessible watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can add members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can update member roles" ON public.watchlist_members;
DROP POLICY IF EXISTS "Watchlist owners can remove members" ON public.watchlist_members;

-- Watchlist_members table policies
-- Users can view members of watchlists they have access to
CREATE POLICY "Users can view members of accessible watchlists" ON public.watchlist_members
    FOR SELECT USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid() OR 
            id IN (
                SELECT watchlist_id FROM public.watchlist_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Watchlist owners can add members
CREATE POLICY "Watchlist owners can add members" ON public.watchlist_members
    FOR INSERT WITH CHECK (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

-- Watchlist owners can update member roles
CREATE POLICY "Watchlist owners can update member roles" ON public.watchlist_members
    FOR UPDATE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

-- Watchlist owners can remove members
CREATE POLICY "Watchlist owners can remove members" ON public.watchlist_members
    FOR DELETE USING (
        watchlist_id IN (
            SELECT id FROM public.watchlists 
            WHERE owner_id = auth.uid()
        )
    );

-- Users can join watchlists via invitation (this would be handled by a function in a real implementation)
-- For now, we'll allow users to insert themselves as members if they have the invitation code
-- This is a simplified approach - in production, you'd want a more secure invitation system

-- Drop existing user_favorites policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- User_favorites table policies
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can add their own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Drop existing user_watched policies
DROP POLICY IF EXISTS "Users can view their own watched items" ON public.user_watched;
DROP POLICY IF EXISTS "Users can add their own watched items" ON public.user_watched;
DROP POLICY IF EXISTS "Users can delete their own watched items" ON public.user_watched;

-- User_watched table policies
-- Users can view their own watched items
CREATE POLICY "Users can view their own watched items" ON public.user_watched
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add their own watched items
CREATE POLICY "Users can add their own watched items" ON public.user_watched
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own watched items
CREATE POLICY "Users can delete their own watched items" ON public.user_watched
    FOR DELETE USING (auth.uid() = user_id);
