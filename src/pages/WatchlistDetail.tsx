import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
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
import { WatchlistMovieCard } from '@/components/watchlists/WatchlistMovieCard';
import { RandomizerButton } from '@/components/watchlists/RandomizerButton';
import { RandomSelectionModal } from '@/components/watchlists/RandomSelectionModal';
import { EmptyWatchlistState } from '@/components/watchlists/EmptyWatchlistState';
import { TMDbMediaItem } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useGuest } from '@/hooks/use-guest';
import { ArrowLeft, Globe, Lock, Share2, Users, X, Check } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

const WatchlistDetail = () => {
  const { t } = useTranslation('watchlists');
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<TMDbMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistName, setWatchlistName] = useState<string>('');
  const [watchlistDescription, setWatchlistDescription] = useState<
    string | null
  >(null);
  const { config, loading: configLoading } = useTMDbConfig();
  const { isGuest, requireAuth } = useGuest();
  // Obtener el nombre de la watchlist
  useEffect(() => {
    if (!id) return;
    supabase
      .from('watchlists')
      .select('name, description')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setWatchlistName(data.name);
          setWatchlistDescription(data.description ?? null);
        }
      });
  }, [id]);

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
              } catch (e: unknown) {
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
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [selectedRandomItem, setSelectedRandomItem] =
    useState<TMDbMediaItem | null>(null);
  const shareUrl = `${window.location.origin}/watchlist/join/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('detail.copied'),
        description: t('detail.linkCopied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast({
        title: t('common.error'),
        description: t('detail.copyError'),
        variant: 'destructive',
      });
    }
  };

  const handleRandomSelect = (item: TMDbMediaItem) => {
    setSelectedRandomItem(item);
    setRandomModalOpen(true);
  };

  return (
    <Layout>
      <div className="p-4">
        <Link
          to="/watchlists"
          className="text-sm text-blue-500 hover:underline"
        >
          ← {t('detail.backToLists')}
        </Link>
        <div className="mt-2 mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">
              {watchlistName || t('detail.defaultTitle')}
            </h1>
            {watchlistDescription && (
              <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">
                {watchlistDescription}
              </p>
            )}
          </div>

          <div className="flex flex-row items-center justify-end gap-3 w-full sm:w-auto">
            {items.length > 0 && (
              <RandomizerButton
                items={items}
                onRandomSelect={handleRandomSelect}
                disabled={loading || configLoading}
              />
            )}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="gap-1 bg-black text-white hover:bg-neutral-800 flex-1 sm:flex-none sm:min-w-[120px]"
                  type="button"
                  onClick={(e) => {
                    if (isGuest) {
                      e.preventDefault();
                      requireAuth(() => {}, true);
                    }
                  }}
                >
                  <Share2 className="inline-block" />
                  {t('detail.share')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('detail.shareTitle')}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <label htmlFor="share-link" className="text-sm font-medium">
                    {t('detail.shareLink')}:
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
                    {copied ? t('detail.copied') : t('detail.copyLink')}
                  </Button>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    type="button"
                  >
                    {t('buttons.close')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {(loading || configLoading) && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !configLoading && config && items.length === 0 && (
          <EmptyWatchlistState watchlistName={watchlistName} />
        )}
        {!loading && !configLoading && config && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {items.map((item, idx) => (
              <WatchlistMovieCard
                key={item.id + '-' + idx}
                item={item}
                config={config}
                watchlistId={id!}
                onRemove={() => {
                  // Remove the item from the local state
                  setItems((prev) => prev.filter((_, index) => index !== idx));
                }}
              />
            ))}
          </div>
        )}

        {/* Random Selection Modal */}
        <RandomSelectionModal
          isOpen={randomModalOpen}
          onClose={() => setRandomModalOpen(false)}
          selectedItem={selectedRandomItem}
          config={config}
        />
      </div>
    </Layout>
  );
};

export default WatchlistDetail;
