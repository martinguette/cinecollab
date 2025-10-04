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
import { BackButton } from '@/components/ui/back-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Globe,
  Lock,
  Share2,
  Users,
  X,
  Check,
  Edit,
  MoreVertical,
  Trash2,
} from 'lucide-react';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleEditClick = () => {
    setEditName(watchlistName);
    setEditDescription(watchlistDescription || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    if (!editName.trim()) {
      toast({
        title: t('errors.nameRequired'),
        description: t('errors.nameRequiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('watchlists')
      .update({
        name: editName.trim(),
        description: editDescription.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    setSaving(false);

    if (error) {
      toast({
        title: t('errors.updateFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setWatchlistName(editName.trim());
      setWatchlistDescription(editDescription.trim() || null);
      setEditModalOpen(false);
      toast({
        title: t('messages.watchlistUpdated'),
        description: t('messages.watchlistUpdatedDescription'),
      });
    }
  };

  const handleDeleteWatchlist = async () => {
    if (!id) return;

    setDeleting(true);
    const { error } = await supabase.from('watchlists').delete().eq('id', id);

    setDeleting(false);

    if (error) {
      toast({
        title: t('errors.deleteFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('messages.watchlistDeleted'),
        description: t('messages.watchlistDeletedDescription'),
      });
      // Redirect to watchlists page
      window.location.href = '/watchlists';
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <BackButton onClick={() => window.history.back()} variant="outline" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{t('detail.options')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                {t('detail.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteModalOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('detail.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-6">
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

        {/* Edit Watchlist Dialog */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('detail.editWatchlist')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">{t('detail.name')}</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t('detail.namePlaceholder')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">
                  {t('detail.description')}
                </Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder={t('detail.descriptionPlaceholder')}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={saving}
              >
                {t('buttons.cancel')}
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
              >
                {saving ? t('detail.saving') : t('buttons.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Watchlist Dialog */}
        <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('detail.deleteWatchlist')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('detail.deleteConfirmation', { name: watchlistName })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                {t('buttons.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWatchlist}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? t('detail.deleting') : t('buttons.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default WatchlistDetail;
