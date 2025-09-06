// (removed broken import fragment)
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const shareUrl = `${window.location.origin}/watchlist/join/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: '¡Enlace copiado!',
        description: 'El enlace ha sido copiado al portapapeles.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el enlace.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <Link
          to="/watchlists"
          className="text-sm text-blue-500 hover:underline"
        >
          ← Volver a mis listas
        </Link>
        <div className="flex items-center justify-between mt-2 mb-4">
          <h1 className="text-2xl font-bold ">Películas/Series guardadas</h1>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="gap-1 bg-black text-white hover:bg-neutral-800"
                type="button"
              >
                <Share2 className="inline-block" />
                Compartir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartir esta watchlist</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <label htmlFor="share-link" className="text-sm font-medium">
                  Enlace para compartir:
                </label>
                <input
                  id="share-link"
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full px-2 py-1 border rounded bg-gray-100 text-gray-800 text-sm"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  variant="default"
                  className="mt-2 bg-black text-white hover:bg-neutral-800"
                  type="button"
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? '¡Copiado!' : 'Copiar enlace'}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
