// (removed broken import fragment)
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useTMDbConfig } from '@/hooks/use-tmdb-config';
import { supabase } from '@/integrations/supabase/client';
import { getMovieDetails, getTVDetails } from '@/lib/tmdb-api';
import { MediaCard } from '@/components/movies/MediaCard';
import { TMDbMediaItem } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Globe, Lock, Share2, Users, X, Check } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

const WatchlistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<TMDbMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config, loading: configLoading } = useTMDbConfig();

  useEffect(() => {
    // ...existing code...
    if (!id) return;
    setLoading(true);
    setError(null);
    // 1. Obtener los items de la watchlist desde Supabase
    supabase
      .from('watchlist_movies')
      .select('media_id, media_type, watchlist_id')
      .eq('watchlist_id', id)
      .then(async ({ data, error }) => {
        if (error) {
          setError('Error al cargar la watchlist.');
          setLoading(false);
          return;
        }
        if (!data || data.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }
        // 2. Obtener detalles de cada media
        const details = await Promise.all(
          data.map(
            async (
              item: Pick<
                Database['public']['Tables']['watchlist_movies']['Row'],
                'media_id' | 'media_type' | 'watchlist_id'
              >
            ) => {
              try {
                const mediaIdNum = Number(item.media_id);
                if (item.media_type === 'movie') {
                  return await getMovieDetails(mediaIdNum);
                } else {
                  return await getTVDetails(mediaIdNum);
                }
              } catch (e: any) {
                console.error('Error fetching details for', item, e);
                return null;
              }
            }
          )
        );
        setItems(details.filter(Boolean));
        setLoading(false);
      });
  }, [id]);

  return (
    <Layout>
      <div className="p-4">
        <Link
          to="/watchlists"
          className="text-sm text-blue-500 hover:underline"
        >
          ← Volver a mis listas
        </Link>
        <h1 className="text-2xl font-bold mb-4 mt-2">
          Películas/Series guardadas
        </h1>
        {(loading || configLoading) && <div>Cargando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !configLoading && config && items.length === 0 && (
          <div>No hay películas o series guardadas en esta lista.</div>
        )}
        {!loading && !configLoading && config && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {items.map((item, idx) => (
              <MediaCard
                key={item.id + '-' + idx}
                item={item}
                config={config}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WatchlistDetail;
